const express = require("express");
const router = express.Router();
const pool = require("../db");
const { ADMIN_BYPASS_ROLES } = require('../constants/roles');
const { getUsernameFromToken } = require("../utils/context-helper");

router.get("/", async (req, res) => {
  try {
    let {
      companyCode,
      branchCode,
      departmentCode,
      serviceTypeCode,
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = req.query;

    // Phase T4.1: Enforced Context Isolation (Alignment with Location module)
    const isBypass = req.user && ADMIN_BYPASS_ROLES.has(req.user.role);
    if (!isBypass) {
      companyCode = companyCode || req.user.company_code;
      branchCode = branchCode || req.user.branch;
      departmentCode = departmentCode || req.user.department;

      if (!companyCode) {
        return res.json({ data: [], total: 0 });
      }
    }

    // Build dynamic query with context filtering
    let query = `
            SELECT e.*, c.name as customer_display_name, c.name as customer_company
            FROM enquiry e
            LEFT JOIN customer c ON e.customer_id = c.id
            WHERE 1=1
        `;

    const params = [];
    let paramIndex = 1;

    // Mandatory context filtering (allow NULL for global compatibility if needed, though rare for Enquiries)
    if (companyCode) {
      query += ` AND (e.company_code = $${paramIndex} OR e.company_code IS NULL)`;
      params.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND (e.branch_code = $${paramIndex} OR e.branch_code IS NULL)`;
        params.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND (e.department_code = $${paramIndex} OR e.department_code IS NULL)`;
          params.push(departmentCode);
          paramIndex++;
        }
      }
    }

    if (serviceTypeCode) {
      query += ` AND e.service_type_code = $${paramIndex}`;
      params.push(serviceTypeCode);
      paramIndex++;
    }

    // Search filtering
    if (search) {
      query += ` AND (e.enquiry_no ILIKE $${paramIndex} OR e.customer_name ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Status filtering
    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const offset = (Number(page) - 1) * Number(limit);
    query += ` ORDER BY e.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = `
            SELECT COUNT(*)
            FROM enquiry e
            LEFT JOIN customer c ON e.customer_id = c.id
            WHERE 1=1
        `;

    const countParams = params.slice(0, -2); // Remove limit and offset

    if (companyCode) {
      countQuery += ` AND (e.company_code = $1 OR e.company_code IS NULL)`;
      if (branchCode) {
        countQuery += ` AND (e.branch_code = $2 OR e.branch_code IS NULL)`;
        if (departmentCode) {
          countQuery += ` AND (e.department_code = $3 OR e.department_code IS NULL)`;
        }
      }
    }

    let cIdx = (companyCode ? 1 : 0) + (branchCode ? 1 : 0) + (departmentCode ? 1 : 0) + 1;
    if (serviceTypeCode) { countQuery += ` AND e.service_type_code = $${cIdx}`; cIdx++; }
    if (search) { countQuery += ` AND (e.enquiry_no ILIKE $${cIdx} OR e.customer_name ILIKE $${cIdx} OR c.name ILIKE $${cIdx})`; cIdx++; }
    if (status) { countQuery += ` AND e.status = $${cIdx}`; }

    const countResult = await pool.query(countQuery, countParams);
    const totalRecords = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      total: totalRecords
    });
  } catch (error) {
    console.error("❌ [ERROR] Fetching enquiries failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /enquiry/:code - Fetch single enquiry with line items and vendor cards
router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // Get enquiry details - Format dates as strings to prevent timezone conversion
    const enquiryResult = await pool.query(
      `SELECT e.*, c.name as customer_display_name,
             TO_CHAR(e.date, 'YYYY-MM-DD') as date,
             TO_CHAR(e.effective_date_from, 'YYYY-MM-DD') as effective_date_from,
             TO_CHAR(e.effective_date_to, 'YYYY-MM-DD') as effective_date_to
       FROM enquiry e 
       LEFT JOIN customer c ON e.customer_id = c.id 
       WHERE e.code = $1`,
      [code]
    );

    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    const enquiry = enquiryResult.rows[0];
    const enquiry_id = enquiry.id;
    let line_items = [];

    // Get line items
    const { rows: lineItemsResult } = await pool.query(
      "SELECT * FROM enquiry_line_items WHERE enquiry_id = $1 ORDER BY s_no",
      [enquiry_id]
    );

    // Get carriage mappings
    const { rows: carriageResult } = await pool.query(
      "SELECT * FROM enquiry_carriage_mapping WHERE enquiry_id = $1 ORDER BY id",
      [enquiry_id]
    );

    // BULK FETCH: Get all vendor cards for this enquiry
    const { rows: allVendorCards } = await pool.query(
      "SELECT * FROM enquiry_vendor_cards WHERE enquiry_id=$1 ORDER BY id DESC",
      [enquiry_id]
    );

    // BULK FETCH: Get all sub-charges for this enquiry
    const { rows: allSubCharges } = await pool.query(
      `SELECT sc.*, mi.name as item_display_name
       FROM enquiry_vendor_sub_charges sc
       LEFT JOIN master_item mi ON sc.charge_name = mi.code AND mi.item_type = 'CHARGE_TYPE'
       WHERE sc.enquiry_id = $1
       ORDER BY sc.id`,
      [enquiry_id]
    );

    // Grouping logic in memory
    const cardsByLineItem = allVendorCards.reduce((acc, card) => {
      const liId = card.enquiry_line_item_id;
      if (!acc[liId]) acc[liId] = [];
      acc[liId].push(card);
      return acc;
    }, {});

    const subChargesByCardId = allSubCharges.reduce((acc, sc) => {
      if (!acc[sc.master_id]) acc[sc.master_id] = [];
      acc[sc.master_id].push(sc);
      return acc;
    }, {});

    // Assemble line items with their nested summaries
    for (let lineItem of lineItemsResult) {
      const line_item_id = lineItem.s_no;
      const vendorCards = cardsByLineItem[line_item_id] || [];

      let source_list = [];
      let selected_source_list = [];
      let tariff_list = [];
      let selected_tariff_list = [];

      vendorCards.forEach(card => {
        // Attach sub-charges
        card.name = card.item_display_name; // Consistency fix
        card.sub_charges = subChargesByCardId[card.id] || [];

        const isSelected = card.sub_charges.length > 0; // Presence implies saved selection
        card.is_selected = isSelected;
        if (isSelected) {
          card.selected_subcharges = card.sub_charges;
        }

        const typeVal = (card.master_type || "").toLowerCase();
        if (typeVal === "tariff") {
          if (isSelected) selected_tariff_list.push(card);
          tariff_list.push(card);
        } else if (typeVal === "sourcing") {
          if (isSelected) selected_source_list.push(card);
          source_list.push(card);
        }
      });

      let enquiry_summary = [
        {
          id: 1,
          summary_type: "sourcing",
          sourced_no: "--",
          vendor_name: "--",
          currency_code: "--",
          charge: "--",
          sourced_time: "--",
          remarks: "--",
          selected_source_items: [],
          sourced_list: [],
        },
        {
          id: 2,
          summary_type: "tariff",
          sourced_no: "--",
          vendor_name: "--",
          currency_code: "--",
          charge: "--",
          sourced_time: "--",
          remarks: "--",
          selected_source_items: [],
          sourced_list: [],
        }
      ];

      if (source_list.length > 0) {
        let selected_sourcing = source_list.find(s => s.is_selected) || {};
        enquiry_summary[0] = {
          id: 1,
          summary_type: "sourcing",
          sourced_no: selected_sourcing.sourced_no || "--",
          vendor_name: selected_sourcing.vendor_name || "--",
          currency_code: selected_sourcing.currency_code || "--",
          charge: Math.max(selected_sourcing.charges || 0, selected_sourcing.negotiated_amount || 0) || "--",
          sourced_time: selected_sourcing.created_at,
          remarks: selected_sourcing.remarks || "--",
          selected_source_items: selected_source_list,
          sourced_list: source_list,
        };
      }

      if (tariff_list.length > 0) {
        let selected_tariff = tariff_list.find(t => t.is_selected) || {};
        enquiry_summary[1] = {
          id: 2,
          summary_type: "tariff",
          sourced_no: selected_tariff.sourced_no || "--",
          vendor_name: selected_tariff.vendor_name || "--",
          currency_code: selected_tariff.currency_code || "--",
          charge: Math.max(selected_tariff.charges || 0, selected_tariff.negotiated_amount || 0) || "--",
          sourced_time: selected_tariff.created_at,
          remarks: selected_tariff.remarks || "--",
          selected_source_items: selected_tariff_list,
          sourced_list: tariff_list,
        };
      }

      line_items.push({ ...lineItem, enquiry_summary });
    }

    res.json({
      ...enquiry,
      line_items: line_items,
      carriage_map: carriageResult,
      // vendor_cards: vendorCardsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /enquiry/:code/preview - Fetch the preview list of  line items and vendor cards for single enquiry
router.get("/:code/preview", async (req, res) => {
  try {
    const { code } = req.params;

    // 1. Get enquiry details
    const enquiryResult = await pool.query(
      "SELECT e.*, c.name as customer_display_name FROM enquiry e LEFT JOIN customer c ON e.customer_id = c.id WHERE e.code = $1",
      [code]
    );

    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    const enquiry = enquiryResult.rows[0];
    const enquiryId = enquiry.id;

    // 2. Get all line items
    const { rows: lineItems } = await pool.query(
      "SELECT * FROM enquiry_line_items WHERE enquiry_id = $1 ORDER BY s_no",
      [enquiryId]
    );

    // BULK FETCH: Get all vendor cards for this enquiry
    const { rows: allVendorCards } = await pool.query(
      "SELECT * FROM enquiry_vendor_cards WHERE enquiry_id = $1 ORDER BY master_type, id",
      [enquiryId]
    );

    // BULK FETCH: Get all sub-charges for this enquiry
    const { rows: allSubCharges } = await pool.query(
      `SELECT sc.*, mi.name 
       FROM enquiry_vendor_sub_charges sc
       LEFT JOIN master_item mi ON sc.charge_name = mi.code AND mi.item_type = 'CHARGE_TYPE'
       WHERE sc.enquiry_id = $1
       ORDER BY sc.id`,
      [enquiryId]
    );

    // Grouping logic in memory
    const cardsByLineItem = allVendorCards.reduce((acc, card) => {
      const liId = card.enquiry_line_item_id;
      if (!acc[liId]) acc[liId] = [];
      acc[liId].push(card);
      return acc;
    }, {});

    const subChargesByCardId = allSubCharges.reduce((acc, sc) => {
      if (!acc[sc.master_id]) acc[sc.master_id] = [];
      acc[sc.master_id].push(sc);
      return acc;
    }, {});

    const detailedLineItems = lineItems.map((item) => {
      const vendorCards = cardsByLineItem[item.s_no] || [];

      const vendorsWithCharges = vendorCards.map(vendor => ({
        ...vendor,
        sub_charges: subChargesByCardId[vendor.id] || []
      }));

      return {
        ...item,
        sourcing_vendors: vendorsWithCharges.filter(v => v.master_type === 'sourcing'),
        tariff_vendors: vendorsWithCharges.filter(v => v.master_type === 'tariff')
      };
    });

    res.json({
      enquiry: enquiry,
      line_items: detailedLineItems
    });

  } catch (error) {
    console.error("Error in enquiry preview route:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});
// POST /enquiry - Create new enquiry
router.post("/", async (req, res) => {
  try {
    const {
      date,
      customer_id,
      customer_name,
      email,
      mobile,
      landline,
      company_name,
      contact_department,
      from_location,
      to_location,
      location_type_from,
      location_type_to,
      effective_date_from,
      effective_date_to,
      department,
      cargo_type,
      service_type,
      status = "Open",
      remarks,
      enquiry_type,
      line_items = [],
      is_new_customer = false,
      code,
      name,
      source_sales_code,
      company_code,
      branch_code,
      department_code,
      service_type_code: bodyServiceTypeCode,
    } = req.body;

    // Phase I: created_by is stamped by ownershipStamper middleware (req.ownerUsername).
    // Fallback to body.created_by which the stamper also sets as a safety net.
    const enquiryCreatedBy = req.ownerUsername || req.body.created_by || null;

    // Get user context for number series / org-unit scoping
    const userResult = await pool.query(
      "SELECT company_code, branch_code, department_code, service_type_code FROM users WHERE username = $1",
      [enquiryCreatedBy || name]
    );

    let userContext = userResult.rows[0] || {};

    // Override with request body context if available (matches customer.js logic)
    if (company_code) userContext.company_code = company_code;
    if (branch_code) userContext.branch_code = branch_code;
    if (department_code) userContext.department_code = department_code;
    if (bodyServiceTypeCode) userContext.service_type_code = bodyServiceTypeCode;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Logic to resolve Final Customer ID and Manage Contacts
      let finalCustomerId = customer_id;
      let customerRecord = null;

      // 1. If no ID provided, try to find by name
      if (!finalCustomerId && company_name) {
        const existingCus = await client.query(
          "SELECT id, name FROM customer WHERE name = $1",
          [company_name]
        );
        if (existingCus.rows.length > 0) {
          finalCustomerId = existingCus.rows[0].id;
          customerRecord = existingCus.rows[0];
        }
      }

      // 2. If still no Customer ID, and we have a company name, CREATE NEW CUSTOMER
      if (!finalCustomerId && company_name) {
        // Generate customer number using number series
        let customerNo;
        let seriesCode;

        // 1. Look up Mapping Relation for specific Series Code (e.g., MAA_FF_CUS)
        // Matches logic in customer.js
        let mappingRes;
        if (userContext.service_type_code) {
          mappingRes = await client.query(
            `SELECT mapping FROM mapping_relations
             WHERE code_type = $1
             AND company_code = $2
             AND branch_code = $3
             AND department_code = $4
             AND (service_type_code = $5 OR service_type_code IS NULL)
             ORDER BY CASE WHEN service_type_code IS NULL THEN 1 ELSE 0 END, id DESC
             LIMIT 1`,
            ['customerCode', userContext.company_code, userContext.branch_code, userContext.department_code, userContext.service_type_code]
          );
        } else {
          mappingRes = await client.query(
            `SELECT mapping FROM mapping_relations
             WHERE code_type = $1
             AND company_code = $2
             AND branch_code = $3
             AND department_code = $4
             AND service_type_code IS NULL
             ORDER BY id DESC
             LIMIT 1`,
            ['customerCode', userContext.company_code, userContext.branch_code, userContext.department_code]
          );
        }

        if (mappingRes.rows.length > 0) {
          seriesCode = mappingRes.rows[0].mapping;
        }

        let numberRelationFound = false;

        if (seriesCode) {
          // 2. Use the found Series Code to get the Number Relation
          const customerNumberResult = await client.query(
            `SELECT nr.prefix, nr.last_no_used as current_number, nr.increment_by, nr.id
                       FROM number_relation nr 
                       WHERE nr.number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE`,
            [seriesCode]
          );

          if (customerNumberResult.rows.length > 0) {
            numberRelationFound = true;
            const numberSeries = customerNumberResult.rows[0];
            const nextNumber =
              (Number(numberSeries.current_number) || 0) +
              (Number(numberSeries.increment_by) || 1);

            // customer.js logic:
            // nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
            // customer_no = `${rel.prefix || ''}${nextNo}`;

            customerNo = (numberSeries.prefix || "") + nextNumber; // Dynamic width, strictly following customer.js if prefix + number

            // Note: customer.js logic is `${rel.prefix || ''}${nextNo}` without padding
            // But checking previous logic: `paddedNumber = nextNumber.toString().padStart(6, "0");`
            // User compliant: "CUSTOMER6" implies prefix + number. 
            // I will adhere to customer.js approach: just prefix + number, OR keep padding if user wants?
            // User showed "MAA_FF_CUS" with last no used 5. If prefix is "CUS", output "CUS6".
            // Let's assume customer.js logic is the reference.

            // Wait, looking at customer.js: `customer_no = ${rel.prefix || ''}${nextNo};` NO PADDING explicitly shown in snippet provided.
            // The previous enquiry.js had padding `.padStart(6, "0")`.
            // User complained: "no series should be like CUSTOMER6 ... but the number series was 000022"
            // The 000022 likely came from the FALLBACK query `SELECT COALESCE(MAX ...`.
            // If I follow customer.js verbatim:
            customerNo = `${numberSeries.prefix || ''}${nextNumber}`;

            // Update the current number in number_relation
            await client.query(
              "UPDATE number_relation SET last_no_used = $1 WHERE id = $2",
              [nextNumber, numberSeries.id]
            );
          }
        }

        if (!numberRelationFound) {
          // Fallback
          console.warn("No Number Series Mapping or Relation found for customerCode. Using default fallback.");
          const customerNoResult = await client.query(
            `SELECT COALESCE(MAX(CAST(SUBSTRING(customer_no FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_no 
                         FROM customer WHERE customer_no ~ '^[0-9]+$'`
          );
          customerNo = customerNoResult.rows[0].next_no
            .toString()
            .padStart(6, "0");
        }

        const customerResult = await client.query(
          `INSERT INTO customer (customer_no, name, 
                     company_code, branch_code, department_code, service_type_code )
                     VALUES ($1, $2, $3, $4, $5, $6 ) RETURNING id, name`,
          [
            customerNo,
            company_name || customer_name,
            userContext.company_code || null,
            userContext.branch_code || null,
            userContext.department_code || null,
            userContext.service_type_code || null,
          ]
        );
        finalCustomerId = customerResult.rows[0].id;
      }

      // 3. Handle Contact Creation (if name provided)
      if (finalCustomerId && customer_name && customer_name.trim() !== "") {
        // Check if contact exists FOR THIS CUSTOMER
        const existingContact = await client.query(
          "SELECT id FROM customer_contacts WHERE customer_id = $1 AND name = $2",
          [finalCustomerId, customer_name]
        );

        if (existingContact.rows.length === 0) {
          await client.query(
            `INSERT INTO customer_contacts (customer_id, name, department, mobile, landline, email) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              finalCustomerId,
              customer_name,
              contact_department || department || "",
              mobile || "",
              landline || "",
              email || "",
            ]
          );
        }
      }

      // Generate enquiry number and code using number series (matching tariff pattern)
      let enquiryNo, enquiryCode;
      let seriesCode;

      // Number series lookup (matching tariff pattern)
      if ((!code || code === "") && userContext.company_code) {
        let whereConditions = ["code_type = $1", "company_code = $2"];
        let queryParams = ["enquiryNo", userContext.company_code];
        let paramIndex = 3;

        if (userContext.branch_code) {
          whereConditions.push(`branch_code = $${paramIndex}`);
          queryParams.push(userContext.branch_code);
          paramIndex++;
        } else {
          whereConditions.push("(branch_code IS NULL OR branch_code = '')");
        }

        if (userContext.department_code) {
          whereConditions.push(`department_code = $${paramIndex}`);
          queryParams.push(userContext.department_code);
        } else {
          whereConditions.push(
            "(department_code IS NULL OR department_code = '')"
          );
        }

        const mappingQuery = `
                    SELECT mapping FROM mapping_relations
                    WHERE ${whereConditions.join(" AND ")}
                    ORDER BY id DESC
                    LIMIT 1
                `;

        const mappingRes = await client.query(mappingQuery, queryParams);
        console.log(
          "Debug: Enquiry create method No series Mapping res",
          mappingRes,
          "for Query:",
          mappingQuery,
          "params:",
          queryParams
        );
        if (mappingRes.rows.length > 0) {
          seriesCode = mappingRes.rows[0].mapping;
        }
      }

      // Generate enquiry code (matching tariff pattern)
      if (seriesCode) {
        const seriesResult = await client.query(
          "SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1",
          [seriesCode]
        );

        if (seriesResult.rows.length === 0) {
          await client.query("ROLLBACK");
          client.release();
          return res.status(400).json({ error: "Number series not found" });
        }

        const series = seriesResult.rows[0];
        if (series.is_manual) {
          if (!code || code.trim() === "") {
            await client.query("ROLLBACK");
            client.release();
            return res
              .status(400)
              .json({ error: "Manual code entry required for this series" });
          }
          const exists = await client.query(
            "SELECT 1 FROM enquiry WHERE code = $1",
            [code]
          );
          if (exists.rows.length > 0) {
            await client.query("ROLLBACK");
            client.release();
            return res
              .status(400)
              .json({ error: "Enquiry code already exists" });
          }
          enquiryCode = code;
        } else {
          const relResult = await client.query(
            "SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE",
            [seriesCode]
          );

          if (relResult.rows.length === 0) {
            await client.query("ROLLBACK");
            client.release();
            return res
              .status(400)
              .json({ error: "Number series relation not found" });
          }

          const rel = relResult.rows[0];
          let nextNo =
            rel.last_no_used === 0
              ? Number(rel.starting_no)
              : Number(rel.last_no_used) + Number(rel.increment_by);

          enquiryCode = `${rel.prefix || ""}${nextNo}`;

          await client.query(
            "UPDATE number_relation SET last_no_used = $1 WHERE id = $2",
            [nextNo, rel.id]
          );
        }
      } else if (!code || code === "") {
        enquiryCode = "ENQ-" + Date.now();
      } else {
        enquiryCode = code;
      }

      // Generate enquiry number (same as code for enquiries)
      enquiryNo = enquiryCode;
      console.log(
        "Debug: create enquiry API enquiryNo generated no series",
        enquiryNo
      );

      // Check for duplicate enquiry number
      const duplicateCheck = await client.query(
        "SELECT id FROM enquiry WHERE enquiry_no = $1",
        [enquiryNo]
      );

      if (duplicateCheck.rows.length > 0) {
        throw new Error(
          "Duplicate enquiry number generated. Please try again."
        );
      }

      // Create enquiry
      const enquiryResult = await client.query(
        `INSERT INTO enquiry (enquiry_no, code, date, customer_id, customer_name, email, mobile, landline,
                 company_name, contact_department, from_location, to_location, location_type_from, location_type_to, effective_date_from, effective_date_to, department,
                 service_type, status, remarks, enquiry_type, company_code, branch_code, department_code, service_type_code, source_sales_code, cargo_type, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28) RETURNING id`,
        [
          enquiryNo,
          enquiryCode,
          date,
          finalCustomerId,
          customer_name,
          email,
          mobile,
          landline,
          company_name,
          contact_department,
          from_location,
          to_location,
          location_type_from,
          location_type_to,
          effective_date_from,
          effective_date_to,
          department,
          service_type,
          status,
          remarks,
          enquiry_type || null,
          userContext.company_code,
          userContext.branch_code,
          userContext.department_code,
          userContext.service_type_code,
          source_sales_code,
          cargo_type,
          enquiryCreatedBy,  // Phase I: stamped by ownershipStamper
        ]
      );

      console.log("Debug: Create enquiry result", enquiryResult);

      const enquiryId = enquiryResult.rows[0].id;

      // Create line items
      for (let i = 0; i < line_items.length; i++) {
        const item = line_items[i];
        await client.query(
          `INSERT INTO enquiry_line_items (
             enquiry_id, s_no, quantity, type, service_area, basis, remarks, status,
             line_from_location_type, line_from_location, line_to_location_type, line_to_location
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            enquiryId,
            i + 1,
            item.quantity,
            item.type,
            item.service_area,
            item.basis,
            item.remarks,
            item.status || "Active",
            item.line_from_location_type || null,
            item.line_from_location || null,
            item.line_to_location_type || null,
            item.line_to_location || null,
          ]
        );
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: "Enquiry created successfully",
        id: enquiryId,
        enquiry_no: enquiryNo,
        code: enquiryCode,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating enquiry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /enquiry/:code - Update enquiry
router.put("/:code", async (req, res) => {
  try {
    const { code: enquiryCode } = req.params;
    let {
      date,
      customer_id,
      customer_name,
      email,
      mobile,
      landline,
      company_name,
      contact_department,
      from_location,
      to_location,
      location_type_from,
      location_type_to,
      effective_date_from,
      effective_date_to,
      department,
      service_type,
      status,
      remarks,
      enquiry_type,
      source_sales_code,
      line_items = [],
      cargo_type,
      is_new_customer,
      username = "System",
      company_code,
      branch_code,
      department_code,
      service_type_code: bodyServiceTypeCode,
    } = req.body;

    // First get the enquiry ID from the code
    const enquiryResult = await pool.query(
      "SELECT id, customer_id FROM enquiry WHERE code = $1",
      [enquiryCode]
    );
    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    const { id: enquiryId, customer_id: existingCustomerId } = enquiryResult.rows[0];

    username = getUsernameFromToken(req);

    // Get user context
    const userResult = await pool.query(
      "SELECT company_code, branch_code, department_code, service_type_code FROM users WHERE username = $1",
      [username]
    );

    let userContext = userResult.rows[0] || {};

    // Override with request body context if available (matches customer.js logic)
    if (company_code) userContext.company_code = company_code;
    if (branch_code) userContext.branch_code = branch_code;
    if (department_code) userContext.department_code = department_code;
    if (bodyServiceTypeCode) userContext.service_type_code = bodyServiceTypeCode;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Logic to resolve Final Customer ID and Manage Contacts
      let finalCustomerId = customer_id || existingCustomerId; // Fallback to existing if not changing
      let customerRecord = null;

      // 1. If no ID provided, try to find by name
      if (!finalCustomerId && company_name) {
        const existingCus = await client.query(
          "SELECT id, name FROM customer WHERE name = $1",
          [company_name]
        );
        if (existingCus.rows.length > 0) {
          finalCustomerId = existingCus.rows[0].id;
          customerRecord = existingCus.rows[0];
        }
      }

      // 2. If still no Customer ID, and we have a company name, CREATE NEW CUSTOMER
      if (!finalCustomerId && company_name) {
        // Generate customer number using number series
        let customerNo;
        let seriesCode;

        // 1. Look up Mapping Relation for specific Series Code (e.g., MAA_FF_CUS)
        // Matches logic in customer.js
        let mappingRes;
        if (userContext.service_type_code) {
          mappingRes = await client.query(
            `SELECT mapping FROM mapping_relations
             WHERE code_type = $1
             AND company_code = $2
             AND branch_code = $3
             AND department_code = $4
             AND (service_type_code = $5 OR service_type_code IS NULL)
             ORDER BY CASE WHEN service_type_code IS NULL THEN 1 ELSE 0 END, id DESC
             LIMIT 1`,
            ['customerCode', userContext.company_code, userContext.branch_code, userContext.department_code, userContext.service_type_code]
          );
        } else {
          mappingRes = await client.query(
            `SELECT mapping FROM mapping_relations
             WHERE code_type = $1
             AND company_code = $2
             AND branch_code = $3
             AND department_code = $4
             AND service_type_code IS NULL
             ORDER BY id DESC
             LIMIT 1`,
            ['customerCode', userContext.company_code, userContext.branch_code, userContext.department_code]
          );
        }

        if (mappingRes.rows.length > 0) {
          seriesCode = mappingRes.rows[0].mapping;
        }

        let numberRelationFound = false;

        if (seriesCode) {
          // 2. Use the found Series Code to get the Number Relation
          const customerNumberResult = await client.query(
            `SELECT nr.prefix, nr.last_no_used as current_number, nr.increment_by, nr.id
                       FROM number_relation nr 
                       WHERE nr.number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE`,
            [seriesCode]
          );

          if (customerNumberResult.rows.length > 0) {
            numberRelationFound = true;
            const numberSeries = customerNumberResult.rows[0];
            const nextNumber =
              (Number(numberSeries.current_number) || 0) +
              (Number(numberSeries.increment_by) || 1);

            // customer.js logic: matches POST route implementation
            customerNo = (numberSeries.prefix || "") + nextNumber;

            // Update the current number in number_relation
            await client.query(
              "UPDATE number_relation SET last_no_used = $1 WHERE id = $2",
              [nextNumber, numberSeries.id]
            );
          }
        }

        if (!numberRelationFound) {
          // Fallback
          console.warn("No Number Series Mapping or Relation found for customerCode. Using default fallback.");
          const customerNoResult = await client.query(
            `SELECT COALESCE(MAX(CAST(SUBSTRING(customer_no FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_no 
                         FROM customer WHERE customer_no ~ '^[0-9]+$'`
          );
          customerNo = customerNoResult.rows[0].next_no
            .toString()
            .padStart(6, "0");
        }

        const customerResult = await client.query(
          `INSERT INTO customer (customer_no, name, 
                     company_code, branch_code, department_code, service_type_code )
                     VALUES ($1, $2, $3, $4, $5, $6 ) RETURNING id, name`,
          [
            customerNo,
            company_name || customer_name,
            userContext.company_code || null,
            userContext.branch_code || null,
            userContext.department_code || null,
            userContext.service_type_code || null,
          ]
        );
        finalCustomerId = customerResult.rows[0].id;
      }

      // 3. Handle Contact Creation (if name provided)
      if (finalCustomerId && customer_name && customer_name.trim() !== "") {
        // Check if contact exists FOR THIS CUSTOMER
        const existingContact = await client.query(
          "SELECT id FROM customer_contacts WHERE customer_id = $1 AND name = $2",
          [finalCustomerId, customer_name]
        );

        if (existingContact.rows.length === 0) {
          await client.query(
            `INSERT INTO customer_contacts (customer_id, name, department, mobile, landline, email) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              finalCustomerId,
              customer_name,
              contact_department || department || "",
              mobile || "",
              landline || "",
              email || "",
            ]
          );
        }
      }

      // Update enquiry (note: we don't update the code as it's the identifier)
      await client.query(
        `UPDATE enquiry SET date = $1, customer_id = $2, customer_name = $3, email = $4,
                 mobile = $5, landline = $6, company_name = $7, contact_department = $8, from_location = $9, to_location = $10,
                 effective_date_from = $11, effective_date_to = $12, department = $13, service_type = $14, status = $15, remarks = $16, enquiry_type = $22, source_sales_code = $17,
                 cargo_type= $19, location_type_from= $20, location_type_to= $21 WHERE id = $18`,
        [
          date,
          finalCustomerId,
          customer_name,
          email,
          mobile,
          landline,
          company_name,
          contact_department,
          from_location,
          to_location,
          effective_date_from,
          effective_date_to,
          department,
          service_type,
          status,
          remarks,
          source_sales_code,
          enquiryId,
          cargo_type,
          location_type_from,
          location_type_to,
          enquiry_type || null,
        ]
      );

      // Delete existing line items
      // await client.query(
      //   "DELETE FROM enquiry_line_items WHERE enquiry_id = $1",
      //   [enquiryId]
      // );

      // selecting existing line items for the enquiry
      const { rows: existingLineItems } = await client.query(
        `SELECT * FROM enquiry_line_items WHERE enquiry_id = $1 ORDER BY s_no`,
        [enquiryId]
      );

      // Delete line items that are not present in the incoming payload
      const incomingIds = (line_items || [])
        .filter((li) => li && li.id)
        .map((li) => Number(li.id));

      if (existingLineItems.length > 0) {
        const toDeleteIds = existingLineItems
          .map((li) => Number(li.id))
          .filter((id) => !incomingIds.includes(id));
        if (toDeleteIds.length > 0) {
          await client.query(
            `DELETE FROM enquiry_line_items WHERE enquiry_id = $1 AND id = ANY($2::int[])`,
            [enquiryId, toDeleteIds]
          );
        }
      }

      // Upsert the incoming line_items and ensure correct s_no ordering
      for (let i = 0; i < line_items.length; i++) {
        const item = line_items[i];
        const newSno = i + 1;
        if (item.id) {
          // Check if critical fields changed, triggering vendor card cleanup
          const existingItem = existingLineItems.find(ex => ex.id === Number(item.id));
          if (existingItem) {
            const keyFields = ['type', 'service_area', 'line_from_location', 'line_to_location'];
            const hasChange = keyFields.some(field => {
              const newVal = (item[field] || '').toString().trim();
              const oldVal = (existingItem[field] || '').toString().trim();
              return newVal !== oldVal;
            });

            if (hasChange) {
            await client.query(
              `DELETE FROM enquiry_vendor_cards WHERE enquiry_id = $1 AND enquiry_line_item_id = $2`,
              [enquiryId, newSno]
            );
          }
          }

          await client.query(
            `UPDATE enquiry_line_items SET 
               s_no = $1,
               quantity = $2, type = $3, service_area = $4, basis = $5, remarks = $6, status = $7,
               line_from_location_type = $8, line_from_location = $9,
               line_to_location_type = $10, line_to_location = $11
             WHERE enquiry_id = $12 AND id = $13`,
            [
              newSno,
              item.quantity,
              item.type,
              item.service_area,
              item.basis,
              item.remarks,
              item.status || "Active",
              item.line_from_location_type || null,
              item.line_from_location || null,
              item.line_to_location_type || null,
              item.line_to_location || null,
              enquiryId,
              item.id,
            ]
          );
        } else {
          await client.query(
            `INSERT INTO enquiry_line_items (
               enquiry_id, s_no, quantity, type, service_area, basis, remarks, status,
               line_from_location_type, line_from_location, line_to_location_type, line_to_location
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              enquiryId,
              newSno,
              item.quantity,
              item.type,
              item.service_area,
              item.basis,
              item.remarks,
              item.status || "Active",
              item.line_from_location_type || null,
              item.line_from_location || null,
              item.line_to_location_type || null,
              item.line_to_location || null,
            ]
          );
        }
      }
      await client.query("COMMIT");

      res.json({ message: "Enquiry updated successfully" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating enquiry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /enquiry/:code - Delete enquiry
router.delete("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    // First get the enquiry ID from the code
    const enquiryResult = await pool.query(
      "SELECT id FROM enquiry WHERE code = $1",
      [code]
    );
    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    const enquiryId = enquiryResult.rows[0].id;

    const result = await pool.query("DELETE FROM enquiry WHERE code = $1", [
      code,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    res.json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /enquiry/customers/dropdown - Get customers for dropdown
router.get("/customers/dropdown", async (req, res) => {
  try {
    const username = getUsernameFromToken(req);

    const { search = "" } = req.query;

    // Get user context
    const userResult = await pool.query(
      "SELECT company_code, branch_code, department_code FROM users WHERE username = $1",
      [username]
    );
    const userContext = userResult.rows[0] || {};

    // Get customers from customer table with primary contact details
    let customerQuery = `
            SELECT DISTINCT c.id, c.name, c.name as company_name, 
                   cc.email, cc.mobile, cc.landline, cc.name as contact_name,
                   cc.department as contact_department,
                   c.name as display_name,
                   COUNT(cc2.id) as contact_count
            FROM customer c
            LEFT JOIN customer_contacts cc ON c.id = cc.customer_id AND cc.is_primary = true AND cc.is_active = true
            LEFT JOIN customer_contacts cc2 ON c.id = cc2.customer_id AND cc2.is_active = true
            WHERE 1=1
        `;

    const customerParams = [];
    let paramIndex = 1;

    // Context filtering
    if (userContext.company_code) {
      customerQuery += ` AND c.company_code = $${paramIndex}`;
      customerParams.push(userContext.company_code);
      paramIndex++;
    }

    if (search) {
      customerQuery += ` AND c.name ILIKE $${paramIndex}`;
      customerParams.push(`%${search}%`);
      paramIndex++;
    }

    customerQuery += ` GROUP BY c.id, c.name, cc.email, cc.mobile, cc.landline, cc.name, cc.department ORDER BY c.name LIMIT 50`;

    const customerResult = await pool.query(customerQuery, customerParams);

    // Also get unique customers from enquiry table (for existing enquiries)
    let enquiryQuery = `
            SELECT DISTINCT customer_name as name, company_name, email, mobile, landline,
                   CONCAT(customer_name, CASE WHEN company_name IS NOT NULL THEN ' - ' || company_name ELSE '' END) as display_name,
                   NULL as id
            FROM enquiry 
            WHERE customer_id IS NULL AND customer_name IS NOT NULL
        `;

    const enquiryParams = [];
    let enquiryParamIndex = 1;

    if (userContext.company_code) {
      enquiryQuery += ` AND company_code = $${enquiryParamIndex}`;
      enquiryParams.push(userContext.company_code);
      enquiryParamIndex++;
    }

    if (search) {
      enquiryQuery += ` AND (customer_name ILIKE $${enquiryParamIndex} OR company_name ILIKE $${enquiryParamIndex})`;
      enquiryParams.push(`%${search}%`);
      enquiryParamIndex++;
    }

    enquiryQuery += ` ORDER BY customer_name LIMIT 50`;

    const enquiryResult = await pool.query(enquiryQuery, enquiryParams);

    // Combine and deduplicate results with case-insensitive comparison
    const allCustomers = [...customerResult.rows, ...enquiryResult.rows];
    const uniqueCustomers = allCustomers.filter((customer, index, self) => {
      return (
        index ===
        self.findIndex((c) => {
          // Compare by display_name first (case-insensitive)
          if (c.display_name && customer.display_name) {
            if (
              c.display_name.toLowerCase() ===
              customer.display_name.toLowerCase()
            ) {
              return true;
            }
          }

          // Also compare by company_name (case-insensitive) to catch duplicates
          if (c.company_name && customer.company_name) {
            if (
              c.company_name.toLowerCase() ===
              customer.company_name.toLowerCase()
            ) {
              return true;
            }
          }

          // Compare by name field (case-insensitive) for customer table entries
          if (c.name && customer.name) {
            if (c.name.toLowerCase() === customer.name.toLowerCase()) {
              return true;
            }
          }

          return false;
        })
      );
    });

    res.json(uniqueCustomers);
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get customer details for auto-fill
router.get("/customers/:customerId/details", async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get customer details from customer table
    const customerResult = await pool.query(
      `SELECT id, name, name as company_name, name as customer_name
             FROM customer 
             WHERE id = $1`,
      [customerId]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer = customerResult.rows[0];

    // Initialize contact fields
    customer.email = null;
    customer.mobile = null;
    customer.landline = null;
    customer.contact_department = null;
    customer.remarks = null;

    // Get primary contact from customer_contacts if available
    const contactResult = await pool.query(
      `SELECT name as contact_name, department as contact_department, 
                    mobile, landline, email, remarks
             FROM customer_contacts 
             WHERE customer_id = $1 AND is_primary = true AND is_active = true
             ORDER BY created_at DESC
             LIMIT 1`,
      [customerId]
    );

    // If primary contact exists, use contact details
    if (contactResult.rows.length > 0) {
      const contact = contactResult.rows[0];
      customer.customer_name = contact.contact_name || customer.name;
      customer.contact_department = contact.contact_department;
      customer.mobile = contact.mobile;
      customer.landline = contact.landline;
      customer.email = contact.email;
      customer.remarks = contact.remarks;
    }

    res.json(customer);
  } catch (error) {
    console.error("Error fetching customer details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get customer contacts for dropdown
router.get("/customers/:customerId/contacts", async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get all active contacts for the customer
    const contactsResult = await pool.query(
      `SELECT id, name, department, mobile, landline, email, remarks, is_primary,
                    CONCAT(name, CASE WHEN department IS NOT NULL THEN ' (' || department || ')' ELSE '' END) as display_name
             FROM customer_contacts 
             WHERE customer_id = $1 AND is_active = true
             ORDER BY is_primary DESC, name ASC`,
      [customerId]
    );

    res.json(contactsResult.rows);
  } catch (error) {
    console.error("Error fetching customer contacts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /enquiry/locations/dropdown - Get locations for dropdown
router.get("/locations/dropdown", async (req, res) => {
  try {
    const username = getUsernameFromToken(req);

    const { search = "" } = req.query;

    // Get user context
    const userResult = await pool.query(
      "SELECT company_code, branch_code, department_code FROM users WHERE username = $1",
      [username]
    );
    const userContext = userResult.rows[0] || {};

    // Get locations from master_location table
    let locationQuery = `
            SELECT code, name, city, state, country,
                   CONCAT(name, ' (', city, ', ', state, ', ', country, ')') as display_name
            FROM master_location
            WHERE active = true
        `;

    const params = [];
    let paramIndex = 1;

    // Add context filtering
    if (userContext.company_code) {
      locationQuery += ` AND company_code = $${paramIndex}`;
      params.push(userContext.company_code);
      paramIndex++;

      if (userContext.branch_code) {
        locationQuery += ` AND branch_code = $${paramIndex}`;
        params.push(userContext.branch_code);
        paramIndex++;

        if (userContext.department_code) {
          locationQuery += ` AND department_code = $${paramIndex}`;
          params.push(userContext.department_code);
          paramIndex++;
        }
      }
    }

    // Add search filtering
    if (search) {
      locationQuery += ` AND (name ILIKE $${paramIndex} OR city ILIKE $${paramIndex} OR state ILIKE $${paramIndex} OR country ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
    }

    locationQuery += ` ORDER BY name ASC`;

    const result = await pool.query(locationQuery, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching locations dropdown:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get departments dropdown for enquiry
router.get("/departments/dropdown", async (req, res) => {
  try {
    const { search, company_code } = req.query;
    const userContext = getUsernameFromToken(req);

    let query = `
      SELECT DISTINCT d.code, d.name, d.company_code, d.branch_code,
             CONCAT(d.name, CASE WHEN d.description IS NOT NULL THEN ' - ' || d.description ELSE '' END) as display_name
      FROM departments d
      WHERE (d.status IS NULL OR d.status = 'Active' OR d.status = 'active' OR d.status = '')
    `;

    const params = [];
    let paramIndex = 1;

    // Filter by user context company if available
    if (userContext.company_code) {
      query += ` AND d.company_code = $${paramIndex}`;
      params.push(userContext.company_code);
      paramIndex++;
    }

    // Filter by specific company if provided
    if (company_code && company_code !== userContext.company_code) {
      query += ` AND d.company_code = $${paramIndex}`;
      params.push(company_code);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      query += ` AND (d.name ILIKE $${paramIndex} OR d.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY d.name LIMIT 50`;

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching departments dropdown:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

router.post("/:code/sourcing", async (req, res) => {
  try {
    const { code } = req.params;
    const {
      line_item_type,
      service_area,
      basis,
      service_type,
      from_location_type,
      to_location_type,
      department,
      cargo_type,
      from_location,
      to_location,
      effective_date_from,
      effective_date_to,
      sourcing,
      local_tariff,
      lineItemId,
    } = req.body;

    let fromLoc = from_location;
    let fromLocType = from_location_type;
    let toLoc = to_location;
    let toLocType = to_location_type;

    // Fallback to line item locations if not provided in payload
    if ((!fromLoc || !toLoc) || (!fromLocType && !toLocType)) {
      try {
        const { rows: liRows } = await pool.query(
          `SELECT eli.line_from_location, eli.line_from_location_type, eli.line_to_location, eli.line_to_location_type,
                  e.from_location AS enq_from_location, e.location_type_from AS enq_from_location_type,
                  e.to_location AS enq_to_location, e.location_type_to AS enq_to_location_type
           FROM enquiry e
           JOIN enquiry_line_items eli ON eli.enquiry_id = e.id
           WHERE e.code = $1 AND ($2::int IS NULL OR eli.s_no = $2::int)
           ORDER BY eli.s_no ASC
           LIMIT 1`,
          [code, lineItemId ? Number(lineItemId) : null]
        );
        if (liRows.length > 0) {
          const r = liRows[0];
          fromLoc = fromLoc || r.line_from_location || r.enq_from_location;
          fromLocType = fromLocType || r.line_from_location_type || r.enq_from_location_type;
          toLoc = toLoc || r.line_to_location || r.enq_to_location;
          toLocType = toLocType || r.line_to_location_type || r.enq_to_location_type;
        }
      } catch (e) {
        console.log("sourcing route: fallback line item lookup error", e.message);
      }
    }

    // Resolve service type name if it's a code (Phase 4)
    let serviceTypeKeywords = [service_type].filter(Boolean);
    if (service_type && service_type.trim() !== "") {
      try {
        const { rows: stRows } = await pool.query(
          "SELECT name FROM service_types WHERE LOWER(code) = LOWER($1) OR LOWER(name) = LOWER($1)",
          [service_type]
        );
        stRows.forEach((r) => {
          const n = r.name;
          if (n && !serviceTypeKeywords.some(k => k.toLowerCase() === n.toLowerCase())) {
            serviceTypeKeywords.push(n);
          }
        });
      } catch (e) {
        console.log("sourcing route: service type resolution error", e.message);
      }
    }

    let query = `
      SELECT * FROM ( 
        SELECT s.*, COALESCE(v.vendor_no, s.vendor_name) AS vendor_name, v.name AS vendor_alias,
        CASE
          WHEN s.period_end_date IS NULL THEN 'Active'
          WHEN NOW() > s.period_end_date::DATE THEN 'Expired'
          ELSE 'Active' 
        END AS source_status
        FROM sourcing s
        LEFT JOIN vendor v ON (s.vendor_name = v.vendor_no OR s.vendor_name = v.name OR s.vendor_name = v.name2)
      ) AS sub WHERE source_status = 'Active'
    `;

    const params = [];
    let paramIndex = 1;

    // Department filter (normalized compare against name/code stored in "mode")
    if (department && department.trim() !== "") {
      query += ` AND LOWER(REPLACE(REPLACE(mode, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`;
      params.push(department);
      paramIndex++;
    }

    // Service Area filter (normalized)
    if (service_area && service_area.trim() !== "") {
      query += ` AND LOWER(REPLACE(REPLACE(service_area, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`;
      params.push(service_area);
      paramIndex++;
    }

    // Location filtering: always apply based on provided/resolved values
    const locationConditions = [];
    if (fromLoc && fromLoc.trim() !== "") {
      if (fromLocType && fromLocType.trim() !== "") {
        locationConditions.push(
          `(LOWER(REPLACE(REPLACE(from_location, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', '')) AND LOWER(REPLACE(REPLACE(location_type_from, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex + 1}, ' ', ''), '_', '')))`
        );
        params.push(fromLoc, fromLocType);
        paramIndex += 2;
      } else {
        locationConditions.push(`LOWER(REPLACE(REPLACE(from_location, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`);
        params.push(fromLoc);
        paramIndex++;
      }
    }
    if (toLoc && toLoc.trim() !== "") {
      if (toLocType && toLocType.trim() !== "") {
        locationConditions.push(
          `(LOWER(REPLACE(REPLACE(to_location, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', '')) AND LOWER(REPLACE(REPLACE(location_type_to, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex + 1}, ' ', ''), '_', '')))`
        );
        params.push(toLoc, toLocType);
        paramIndex += 2;
      } else {
        locationConditions.push(`LOWER(REPLACE(REPLACE(to_location, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`);
        params.push(toLoc);
        paramIndex++;
      }
    }
    if (locationConditions.length > 0) {
      if (sourcing === "match_any") {
        query += ` AND (${locationConditions.join(" OR ")})`;
      } else {
        query += ` AND ${locationConditions.join(" AND ")}`;
      }
    }

    // Cargo type filter (normalized)
    if (cargo_type && cargo_type.trim() !== "") {
      query += ` AND LOWER(REPLACE(REPLACE(cargo_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`;
      params.push(cargo_type);
      paramIndex++;
    }

    // Basis filter (code match, normalized)
    if (basis && basis.trim() !== "") {
      query += ` AND LOWER(REPLACE(REPLACE(basis, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`;
      params.push(basis);
      paramIndex++;
    }

    // Line item type filter (e.g., Freight, Transportation)
    if (line_item_type && line_item_type.trim() !== "") {
      query += ` AND LOWER(REPLACE(REPLACE(type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`;
      params.push(line_item_type);
      paramIndex++;
    }

    // Service type filter -> match either "shipping_type" or "type" columns (flexible matching)
    if (serviceTypeKeywords.length > 0) {
      const typeIdxStart = paramIndex;
      serviceTypeKeywords.forEach((v) => { params.push(v); paramIndex++; });
      const typeConds = serviceTypeKeywords.map((_, i) =>
        `(LOWER(REPLACE(REPLACE(shipping_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${typeIdxStart + i}, ' ', ''), '_', '')) OR LOWER(REPLACE(REPLACE(type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${typeIdxStart + i}, ' ', ''), '_', '')))`
      ).join(' OR ');
      query += ` AND (${typeConds})`;
    }
    // (legacy check if keywords empty but param exists)
    else if (service_type && service_type.trim() !== "") {
      query += ` AND (LOWER(REPLACE(REPLACE(shipping_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', '')) OR LOWER(REPLACE(REPLACE(type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', '')))`;
      params.push(service_type);
      paramIndex++;
    }

    // Date range filter (overlap logic; apply with whichever values are present)
    const hasFromDate = !!(effective_date_from && effective_date_from.trim() !== "");
    const hasToDate = !!(effective_date_to && effective_date_to.trim() !== "");
    if (hasFromDate && hasToDate) {
      query += ` AND (
        (period_start_date IS NULL OR period_start_date <= $${paramIndex + 1}) AND 
        (period_end_date IS NULL OR period_end_date >= $${paramIndex})
      )`;
      params.push(effective_date_from, effective_date_to);
      paramIndex += 2;
    } else if (hasFromDate) {
      query += ` AND (period_end_date IS NULL OR period_end_date >= $${paramIndex})`;
      params.push(effective_date_from);
      paramIndex++;
    } else if (hasToDate) {
      query += ` AND (period_start_date IS NULL OR period_start_date <= $${paramIndex})`;
      params.push(effective_date_to);
      paramIndex++;
    }

    const logData = `[${new Date().toISOString()}] SOURCING QUERY:\n${query}\nPARAMS: ${JSON.stringify(params)}\n\n`;
    fs.appendFileSync(path.join(__dirname, "../sourcing_query_log.txt"), logData);

    const { rows: sourceResult } = await pool.query(query, params);

    const sourceIds = sourceResult.map((s) => s.id);

    const { rows: sourceSubchargeResult } = await pool.query(
      `SELECT * FROM sourcing_sub_charges WHERE sourcing_id = ANY($1) ORDER BY sourcing_id, id`,
      [sourceIds]
    );

    // reducing the collected sub charge as per source id
    const subChargesBySource = sourceSubchargeResult.reduce(
      (acc, subCharge) => {
        if (!acc[subCharge.sourcing_id]) acc[subCharge.sourcing_id] = [];
        acc[subCharge.sourcing_id].push(subCharge);
        return acc;
      },
      {}
    );

    const sourceResponse = sourceResult.map((src) => ({
      ...src,
      sub_charges: subChargesBySource[src.id] || [],
      selected_subcharges: subChargesBySource[src.id] || [],
    }));

    res.json(sourceResponse);
  } catch (error) {
    console.error("Error fetching sourcing options:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /enquiry/:code/tariff - Get tariff options for enquiry
router.post("/:code/tariff", async (req, res) => {
  try {
    const { code } = req.params;
    const {
      department,
      cargo_type,
      service_type,
      from_location,
      from_location_type,
      to_location,
      to_location_type,
      from_location_code,
      from_location_name,
      to_location_code,
      to_location_name,
      effective_date_from,
      effective_date_to,
      sourcing,
      local_tariff,
      service_area,
    } = req.body;

    // Resolve service type names if codes provided (Phase 4)
    const lineItemType = req.body.line_item_type || req.body.type;
    const globalServiceType = req.body.service_type;
    let serviceTypeKeywords = [lineItemType, globalServiceType].filter(Boolean);

    try {
      const allInputTypes = [...serviceTypeKeywords];
      for (const st of allInputTypes) {
        if (st && st.trim() !== "") {
          const { rows: stRows } = await pool.query(
            "SELECT name FROM service_types WHERE LOWER(code) = LOWER($1)",
            [st]
          );
          stRows.forEach((r) => {
            const n = r.name;
            if (n && !serviceTypeKeywords.some(k => k.toLowerCase() === n.toLowerCase())) {
              serviceTypeKeywords.push(n);
            }
          });
        }
      }
    } catch (e) {
      console.log("tariff route: service type resolution error", e.message);
    }

    let query = `
      SELECT t.*, COALESCE(v.vendor_no, t.vendor_name) AS vendor_name, v.name AS vendor_alias, v.type AS vendor_type
      FROM tariff AS t
      LEFT JOIN vendor AS v ON (t.vendor_name = v.vendor_no OR t.vendor_name = v.name OR t.vendor_name = v.name2)
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (effective_date_from && effective_date_to) {
      // Overlap date range instead of full containment
      query += `
        AND t.period_start_date <= $${paramIndex + 1}
        AND (t.expiry_date IS NULL OR t.expiry_date >= $${paramIndex})
      `;
      params.push(effective_date_from, effective_date_to);
      paramIndex += 2;
    }

    if (department && department.trim() !== "") {
      query += ` AND LOWER(REPLACE(REPLACE(t.mode, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`;
      params.push(department);
      paramIndex++;
    }

    if (cargo_type && cargo_type.trim() !== "") {
      query += ` AND LOWER(REPLACE(REPLACE(t.cargo_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`;
      params.push(cargo_type);
      paramIndex++;
    }

    // Route filtering based on provided from/to (relaxed for single-location masters)
    const normCmp = (field, idx) => `LOWER(REPLACE(REPLACE(${field}, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${idx}, ' ', ''), '_', ''))`;

    const hasFrom = !!(from_location || from_location_code || from_location_name);
    const hasTo = !!(to_location || to_location_code || to_location_name);

    if (hasFrom && hasTo) {
      const fromVals = [from_location, from_location_code, from_location_name].filter(Boolean);
      const toVals = [to_location, to_location_code, to_location_name].filter(Boolean);
      const fromIdxStart = paramIndex;
      fromVals.forEach((v) => { params.push(v); paramIndex++; });
      const toIdxStart = paramIndex;
      toVals.forEach((v) => { params.push(v); paramIndex++; });

      const fromConds = fromVals.map((_, i) => normCmp('t.from_location', fromIdxStart + i)).join(' OR ');
      const toConds = toVals.map((_, i) => normCmp('t.to_location', toIdxStart + i)).join(' OR ');

      // Relaxed: Match specific route OR "General" tariff (empty locations)
      query += ` AND ((${fromConds}) OR t.from_location IS NULL OR TRIM(t.from_location) = '') 
                 AND ((${toConds}) OR t.to_location IS NULL OR TRIM(t.to_location) = '')`;
    } else if (hasFrom) {
      const fromVals = [from_location, from_location_code, from_location_name].filter(Boolean);
      const fromIdxStart = paramIndex;
      fromVals.forEach((v) => { params.push(v); paramIndex++; });
      const fromConds = fromVals.map((_, i) => normCmp('t.from_location', fromIdxStart + i)).join(' OR ');

      query += ` AND ((${fromConds}) OR t.from_location IS NULL OR TRIM(t.from_location) = '') 
                 AND (t.to_location IS NULL OR TRIM(t.to_location) = '' OR TRIM(t.to_location) = 'null')`;
    } else if (hasTo) {
      const toVals = [to_location, to_location_code, to_location_name].filter(Boolean);
      const toIdxStart = paramIndex;
      toVals.forEach((v) => { params.push(v); paramIndex++; });
      const toConds = toVals.map((_, i) => normCmp('t.to_location', toIdxStart + i)).join(' OR ');

      query += ` AND ((${toConds}) OR t.to_location IS NULL OR TRIM(t.to_location) = '') 
                 AND (t.from_location IS NULL OR TRIM(t.from_location) = '' OR TRIM(t.from_location) = 'null')`;
    }

    // Service Area filter
    if (service_area && service_area.trim() !== "") {
      query += ` AND LOWER(REPLACE(REPLACE(t.service_area, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${paramIndex}, ' ', ''), '_', ''))`;
      params.push(service_area);
      paramIndex++;
    }

    // Service Type/Line Item Type filter (Search in t.shipping_type)
    if (serviceTypeKeywords.length > 0) {
      const typeIdxStart = paramIndex;
      serviceTypeKeywords.forEach((v) => { params.push(v); paramIndex++; });
      const typeConds = serviceTypeKeywords.map((_, i) =>
        `(LOWER(REPLACE(REPLACE(t.shipping_type, ' ', ''), '_', '')) = LOWER(REPLACE(REPLACE($${typeIdxStart + i}, ' ', ''), '_', '')))`
      ).join(' OR ');
      query += ` AND (${typeConds})`;
    }

    if (Array.isArray(sourcing) && sourcing.length > 0) {
      const vendorNos = (sourcing || [])
        .map((v) => v.vendor_no || v.vendor_name)
        .filter((x) => x && String(x).trim() !== "");
      const vendorTypes = (sourcing || [])
        .map((v) => v.vendor_type)
        .filter((x) => x && String(x).trim() !== "");
      if (vendorNos.length > 0) {
        query += ` AND (t.vendor_name = ANY($${paramIndex}) OR v.vendor_no = ANY($${paramIndex}) OR v.name = ANY($${paramIndex}) OR v.name2 = ANY($${paramIndex}))`;
        params.push(vendorNos);
        paramIndex++;
      }
      if (vendorTypes.length > 0) {
        query += ` AND v.type = ANY($${paramIndex})`;
        params.push(vendorTypes);
        paramIndex++;
      }
    }

    query += ` ORDER BY t.vendor_name, t.created_at DESC`;

    const { rows: tariffResult } = await pool.query(query, params);
    const tariffIds = tariffResult.map((T) => T.id);

    if (tariffIds.length === 0) return res.json([]);

    const { rows: tariffSubchargeResult } = await pool.query(
      `SELECT * FROM tariff_charges WHERE tariff_id = ANY($1) ORDER BY tariff_id, id`,
      [tariffIds]
    );

    const subChargesByTariff = tariffSubchargeResult.reduce(
      (acc, subCharge) => {
        if (!acc[subCharge.tariff_id]) acc[subCharge.tariff_id] = [];
        acc[subCharge.tariff_id].push(subCharge);
        return acc;
      },
      {}
    );

    const tariffResponse = tariffResult.map((tariff) => ({
      ...tariff,
      sub_charges: subChargesByTariff[tariff.id] || [],
    }));

    res.json(tariffResponse);
  } catch (error) {
    console.error("Error fetching tariff options:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:code/vendor-cards", async (req, res) => {
  try {
    const username = getUsernameFromToken(req);

    if (!username) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { code } = req.params;
    const {
      vendorCard,
      vendorCards,
      masterType: masterTypeRaw,
      sourcingType,
      lineItemId,
    } = req.body;

    const masterType = (masterTypeRaw || sourcingType || "").toLowerCase();
    // Validate masterType
    if (!masterType || (masterType !== "sourcing" && masterType !== "tariff")) {
      return res.status(400).json({
        error: "Invalid master type",
        details: "masterType must be either 'sourcing' or 'tariff'",
      });
    }

    // Fetch enquiry with context fields
    const enquiryResult = await pool.query(
      "SELECT id, department, service_type, cargo_type, location_type_from, location_type_to, effective_date_from, effective_date_to FROM enquiry WHERE code = $1",
      [code]
    );

    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    const enquiryRow = enquiryResult.rows[0];
    const enquiryId = enquiryRow.id;

    // retriving the previously selected sourcing Id
    const { rows: vendorCardId } = await pool.query(`SELECT id FROM enquiry_vendor_cards WHERE enquiry_id = $1 AND enquiry_line_item_id = $2 AND master_type=$3;`, [enquiryId, lineItemId, masterType]);

    const client = await pool.connect();



    try {
      await client.query("BEGIN");

      const list = Array.isArray(vendorCards)
        ? vendorCards
        : vendorCard
          ? [vendorCard]
          : [];

      if (list.length === 0) {
        return res.status(400).json({ error: "No vendor cards provided" });
      }

      let insertedCount = 0;
      const inserted = [];

      for (const card of list) {
        let effectiveDate, expiryDate;

        if (masterType === "sourcing") {
          effectiveDate =
            card.effective_date ||
            card.period_start_date ||
            card.start_date ||
            enquiryRow.effective_date_from ||
            null;
          expiryDate =
            card.expiry_date ||
            card.period_end_date ||
            card.end_date ||
            enquiryRow.effective_date_to ||
            null;
        } else if (masterType === "tariff") {
          effectiveDate =
            card.effective_date ||
            card.period_start_date ||
            enquiryRow.effective_date_from ||
            null;
          enquiryRow.effective_date_to ||
            null;
        }

        // Ensure remarks column exists
        await client.query("ALTER TABLE enquiry_vendor_cards ADD COLUMN IF NOT EXISTS remarks TEXT");

        const insertQuery = `
          INSERT INTO enquiry_vendor_cards 
            (enquiry_id, enquiry_line_item_id, master_type, department, service_type, 
             type, service_area, vendor_type, vendor_name, basis, cargo, 
             location_type_from, from_location, location_type_to, to_location, 
             period_start_date, period_end_date, remarks)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING id
        `;

        const insertParams = [
          enquiryId,
          lineItemId,
          masterType,
          card.department || enquiryRow.department || null,
          card.service_type || card.shipping_type || enquiryRow.service_type || null,
          card.type || null,
          card.service_area || null,
          card.vendor_type || null,
          card.vendor_name || card.vendor_code || card.vendor || card.code || null,
          card.basis || null,
          card.cargo || card.cargo_type || enquiryRow.cargo_type || null,
          card.location_type_from || enquiryRow.location_type_from || null,
          card.from_location || null,
          card.location_type_to || enquiryRow.location_type_to || null,
          card.to_location || null,
          effectiveDate,
          expiryDate,
          card.remarks || null,
        ];

        const result = await client.query(insertQuery, insertParams);
        const vendorCardId = result.rows[0].id;
        inserted.push({ id: vendorCardId, vendor_name: insertParams[8], master_type: masterType });

        const chargesArr = Array.isArray(card.charges)
          ? card.charges
          : Array.isArray(card.selected_subcharges)
            ? card.selected_subcharges
            : [];

        if (chargesArr.length > 0) {
          for (const ch of chargesArr) {
            const chargeName = ch.charge_name || ch.name || null;
            const currencyVal = ch.currency || card.currency || null;
            const basisVal = ch.basis || card.basis || null;
            const amountVal = ch.amount ?? ch.charges ?? ch.charge ?? null;
            const sellRateCur = ch.sell_rate_currency || null;
            const sellRateVal = ch.sell_rate || null;
            const gstVatVal = ch.gst_vat || ch.gst_rate || null;
            const remarksVal = ch.remarks || null;

            if (!chargeName || !currencyVal) {
              console.warn("Skipping sub-charge due to missing fields", {
                chargeName,
                currencyVal,
                basisVal,
                amountVal,
              });
              continue;
            }

            const subChargeQuery = `
              INSERT INTO enquiry_vendor_sub_charges
          (enquiry_id, enquiry_line_item_id, master_id, master_type, charge_name,
            currency, basis, charges, sell_rate_currency, sell_rate, sell_rate_gst, gst_vat, remarks)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, charge_name
            `;

            const subChargeParams = [
              enquiryId,
              lineItemId,
              vendorCardId,
              masterType,
              chargeName,
              currencyVal,
              basisVal,
              amountVal,
              sellRateCur,
              sellRateVal,
              ch.sell_rate_gst || ch.sell_rate_gst_vat || 0,
              gstVatVal,
              remarksVal,
            ];


            const subChargeResult = await client.query(subChargeQuery, subChargeParams);
            if (subChargeResult.rows && subChargeResult.rows.length > 0) {
              // Attach the created sub-charge ID to the inserted card's sub_charges array
              if (!inserted[inserted.length - 1].sub_charges) {
                inserted[inserted.length - 1].sub_charges = [];
              }
              inserted[inserted.length - 1].sub_charges.push(subChargeResult.rows[0]);
            }
          }
        }

        insertedCount++;
      }


      await client.query("COMMIT");

      res.json({
        message: `Vendor cards added successfully for ${masterType}`,
        master_type: masterType,
        count: insertedCount,
        inserted
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// // delete enquiry vendor card
// router.delete("/:code/vendor-card/:cardId", async (req, res)=>{
//   const { code, cardId } = req.params;

// });

// PUT /enquiry/:code/vendor-cards/:cardId/negotiate - Update negotiated charges
router.put("/:code/vendor-cards/:cardId/negotiate", async (req, res) => {
  try {
    const { cardId } = req.params;
    const { negotiated_charges } = req.body;

    await pool.query(
      "UPDATE enquiry_vendor_cards SET negotiated_charges = $1 WHERE id = $2",
      [JSON.stringify(negotiated_charges), cardId]
    );

    res.json({ message: "Negotiated charges updated successfully" });
  } catch (error) {
    console.error("Error updating negotiated charges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update sub-charges for a vendor card
router.put("/:code/vendor-cards/:cardId/sub-charges", async (req, res) => {
  try {
    const { cardId } = req.params;
    const updates = Array.isArray(req.body?.list) ? req.body.list : [];
    if (!cardId) {
      return res.status(400).json({ error: "cardId is required" });
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: "No sub-charge updates provided" });
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Ensure remarks column exists
      await client.query("ALTER TABLE enquiry_vendor_cards ADD COLUMN IF NOT EXISTS remarks TEXT");

      let updated = 0;
      for (const u of updates) {
        const selGst = u.sell_rate_gst || u.sell_rate_gst_vat || 0;
        const params = [
          u.sell_rate_currency ?? u.currency ?? null,  // Use ?? to preserve empty strings
          u.sell_rate ?? u.amount ?? null,
          u.gst_vat ?? u.gst_rate ?? selGst ?? null,  // Use ?? to preserve 0 values
          u.remarks || null,
          selGst,
          Number(cardId),
          Number(u.id) || null,
          u.charge_name || null,
        ];

        console.log('🔍 UPDATE sub-charge - Input:', {
          charge_name: u.charge_name,
          sell_rate_currency: u.sell_rate_currency,
          gst_vat: u.gst_vat,
          sell_rate_gst_vat: u.sell_rate_gst_vat,
          id: u.id
        });
        console.log('🔍 UPDATE sub-charge - Params:', params.slice(0, 7));

        const qById = `UPDATE enquiry_vendor_sub_charges 
          SET sell_rate_currency = $1, sell_rate = $2, gst_vat = $3, remarks = $4, sell_rate_gst = $5 
          WHERE master_id = $6 AND id = $7`;

        let r;
        if (params[6]) { // if we have a numeric ID
          r = await client.query(qById, params.slice(0, 7));
          console.log('✅ UPDATE by ID - Rows affected:', r.rowCount);
        }

        if (!params[6] || (r && r.rowCount === 0)) {
          // Fallback to name only if absolutely necessary and no ID matched
          const qByName = `UPDATE enquiry_vendor_sub_charges 
            SET sell_rate_currency = $1, sell_rate = $2, gst_vat = $3, remarks = $4, sell_rate_gst = $5 
            WHERE master_id = $6 AND charge_name = $7`;
          r = await client.query(qByName, [
            params[0], params[1], params[2], params[3], params[4], params[5], params[7]
          ]);
        }
        updated += r.rowCount || 0;
      }

      // Also update remarks on the main card if at least one sub-charge had remarks
      const mainRemarks = updates.find(u => u.remarks)?.remarks;
      if (mainRemarks) {
        await client.query("UPDATE enquiry_vendor_cards SET remarks = $1 WHERE id = $2", [mainRemarks, Number(cardId)]);
      }

      await client.query("COMMIT");
      res.json({ updated });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating sub-charges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:code/vendor-cards/:cardId/sub-charges", async (req, res) => {
  try {
    const { cardId } = req.params;
    if (!cardId) return res.status(400).json({ error: "cardId is required" });
    const { rows } = await pool.query(
      `SELECT id, master_id, charge_name, currency, basis, charges, sell_rate_currency, sell_rate, gst_vat, sell_rate_gst, remarks
       FROM enquiry_vendor_sub_charges WHERE master_id = $1 ORDER BY id`,
      [Number(cardId)]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching vendor sub-charges:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tariff/sub-charges/:tariffId", async (req, res) => {
  try {
    const { tariffId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, tariff_id, charge_name, currency, basis, amount AS charges, gst_vat
       FROM tariff_charges WHERE tariff_id = $1 ORDER BY id`,
      [Number(tariffId)]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /enquiry/:code/confirm - Confirm enquiry and create booking
router.post("/:code/confirm", async (req, res) => {
  try {
    const { code } = req.params;

    // Get enquiry details with active vendor card
    const enquiryResult = await pool.query(
      `
            SELECT e.*,
          json_agg(eli.*) as line_items,
          (SELECT row_to_json(evc.*) FROM enquiry_vendor_cards evc WHERE evc.enquiry_id = e.id AND evc.is_active = true LIMIT 1) as active_vendor
            FROM enquiry e
            LEFT JOIN enquiry_line_items eli ON e.id = eli.enquiry_id
            WHERE e.code = $1
            GROUP BY e.id
        `,
      [code]
    );

    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    const enquiry = enquiryResult.rows[0];

    if (!enquiry.active_vendor) {
      return res.status(400).json({ error: "No active vendor selected" });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Generate booking number
      const bookingNoResult = await client.query(
        `SELECT COALESCE(MAX(CAST(SUBSTRING(booking_no FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_no 
                 FROM booking WHERE booking_no ~ '^BKG[0-9]+$'`
      );
      const bookingNo =
        "BKG" + bookingNoResult.rows[0].next_no.toString().padStart(6, "0");

      // Create booking
      await client.query(
        `INSERT INTO booking(booking_no, enquiry_id, customer_id, customer_name, mail_id, phone_no1, phone_no2,
            company_name, from_location, to_location, effective_date_from, effective_date_to, department,
            status, remarks, vendor_details, line_items, charges, company_code, branch_code, department_code, service_type_code)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
        [
          bookingNo,
          id,
          enquiry.customer_id,
          enquiry.customer_name,
          enquiry.mail_id,
          enquiry.phone_no1,
          enquiry.phone_no2,
          enquiry.company_name,
          enquiry.from_location,
          enquiry.to_location,
          enquiry.effective_date_from,
          enquiry.effective_date_to,
          enquiry.department,
          "Confirmed",
          enquiry.remarks,
          JSON.stringify(enquiry.active_vendor),
          JSON.stringify(enquiry.line_items),
          JSON.stringify(
            enquiry.active_vendor.negotiated_charges ||
            enquiry.active_vendor.charges
          ),
          enquiry.company_code,
          enquiry.branch_code,
          enquiry.department_code,
          enquiry.service_type_code,
        ]
      );

      // Update enquiry status to Confirmed
      await client.query("UPDATE enquiry SET status = $1 WHERE id = $2", [
        "Confirmed",
        id,
      ]);

      await client.query("COMMIT");

      res.json({
        message: "Enquiry confirmed and booking created successfully",
        booking_no: bookingNo,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error confirming enquiry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:code/lineItem - Get Line Item List
router.get("/:code/lineItem", async (req, res) => {
  try {
    const { code } = req.params;

    const { rows: enquiryIdRow } = await pool.query(
      ` SELECT id FROM enquiry WHERE code = $1
  `,
      [code]
    );
    const [{ id: enquiry_id }] = enquiryIdRow;

    const { rows: lineItemsResult } = await pool.query(
      `
SELECT * FROM enquiry_line_items WHERE enquiry_id = $1
  `,
      [enquiry_id]
    );

    res.json({
      lineItemCount: lineItemsResult.length,
      lineItems: lineItemsResult,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Carriage mapping APIs
router.get("/:id/carriage-mapping", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`CREATE TABLE IF NOT EXISTS enquiry_carriage_mapping(
    id SERIAL PRIMARY KEY,
    enquiry_id INT NOT NULL,
    direction VARCHAR(10) NOT NULL,
    carriage VARCHAR(150) NOT NULL,
    location_type VARCHAR(150),
    location VARCHAR(150)
  )`);
    const { rows } = await pool.query(
      'SELECT * FROM enquiry_carriage_mapping WHERE enquiry_id = $1 ORDER BY id',
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching enquiry carriage-mapping:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/carriage-mapping/save', async (req, res) => {
  try {
    const { enquiry_id, list } = req.body || {};
    if (!enquiry_id) {
      return res.status(400).json({ error: 'enquiry_id is required' });
    }
    const items = Array.isArray(list) ? list : [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM enquiry_carriage_mapping WHERE enquiry_id = $1', [enquiry_id]);
      for (const it of items) {
        await client.query(
          `INSERT INTO enquiry_carriage_mapping(enquiry_id, direction, carriage, location_type, location)
VALUES($1, $2, $3, $4, $5)`,
          [enquiry_id, it.direction, it.carriage, it.location_type || null, it.location || null]
        );
      }
      await client.query('COMMIT');
      res.json({ success: true });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving enquiry carriage-mapping:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /:code/lineItem - Insert New Line Item
router.post("/:code/line-Item", async (req, res) => {
  try {
    const { code } = req.params;
    const { s_no, quantity, type, service_area, basis, remarks, status } =
      req.body;

    const { rows: enquiry_id } = await pool.query(
      ` SELECT id FROM enquiry WHERE code = $1
  `,
      [code]
    );
    const { } = await pool.query(
      `INSERT INTO enquiry_line_items(enquiry_id, s_no, quantity, type, service_area, basis, remarks, status, enquiry_line_item_id)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $2)`,
      [
        enquiry_id,
        s_no,
        quantity,
        type,
        service_area,
        basis,
        remarks,
        status || "Active",
      ]
    );
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error.",
      error: error.message,
    });
  }
});

// POST method for adding or updating the line Item selection
router.put("/:code/line-items/selection", async (req, res) => {
  try {
    const { code } = req.params;
    const { selectedLineItems } = req.body;
    let query;
    let params;

    const { rows: enquiryIdRow } = await pool.query(
      ` SELECT id FROM enquiry WHERE code = $1
  `,
      [code]
    );
    const [{ id: enquiry_id }] = enquiryIdRow;

    // unselect all line item for the id
    const result = await pool.query(
      `UPDATE enquiry_line_items SET is_selected = false WHERE enquiry_id = $1 RETURNING * `,
      [enquiry_id]
    );

    let lineItemsList = selectedLineItems.map((lineItem) => ({
      lineItemId: lineItem.id,
      enquiryId: lineItem.enquiry_id,
      lineItemSno: lineItem.s_no,
    }));
    if (selectedLineItems.length > 0) {
      query = ` UPDATE enquiry_line_items SET is_selected = true WHERE enquiry_id = $1 AND`;
      params = [enquiry_id];
      lineItemsList.forEach((lineItem, index) => {
        if (lineItemsList.length === 1) {
          query += `(s_no = $${index + 2})`;
          params.push(lineItem.lineItemSno);
        } else {
          query +=
            index === 0
              ? `(s_no = $${index + 2}`
              : index === lineItemsList.length - 1
                ? `  OR  s_no = $${index + 2})`
                : `  OR  s_no = $${index + 2} `;
          params.push(lineItem.lineItemSno);
        }
      });
      const { rows: lineItemSelectionResult } = await pool.query(query, params);
    }
    // const lineItemSelectionResult = await pool.query(
    //   ` UPDATE enquiry_line_items SET is_selected = true `
    // );

    res.status(200).json({ msg: "Updated Line Item Selection !" });
  } catch (error) {
    console.error(
      "line item selection update method,",
      error,
      "message,",
      error.message
    );
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

router.put("/:code/line-item/:lineItemId/selection", async (req, res) => {
  try {
    const { code, lineItemId } = req.params;
    const { vendorCardList, sourcingType } = req.body;

    typeof vendorCardList === "undefined" && (vendorCardList = []);

    // First get the enquiry ID from the code
    const enquiryResult = await pool.query(
      "SELECT id FROM enquiry WHERE code = $1",
      [code]
    );
    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    const enquiryId = enquiryResult.rows[0].id;

    // Column is_selected does not exist in the schema, and we're moving to "Live Snapshot"
    // where any vendor added to an enquiry is considered selected.
    // Thus, we skip the selection flag update.
    res.status(200).json({ msg: "Updated Line Item Selection !" });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
});


// DELETE all vendor cards and sub-charges for an enquiry line item (scope: all|sourcing|tariff)
router.delete("/:code/line-item/:lineItemId/vendor-cards", async (req, res) => {
  try {
    const { code, lineItemId } = req.params;
    const scope = (req.query.scope || 'all').toString();
    const { rows: enqRows } = await pool.query("SELECT id FROM enquiry WHERE code = $1", [code]);
    if (enqRows.length === 0) return res.status(404).json({ error: "Enquiry not found" });
    const enquiryId = enqRows[0].id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let typeCond = '';
      if (scope === 'sourcing') typeCond = " AND master_type = 'sourcing'";
      else if (scope === 'tariff') typeCond = " AND master_type = 'tariff'";

      const delSub = await client.query(
        `DELETE FROM enquiry_vendor_sub_charges WHERE enquiry_id = $1 AND enquiry_line_item_id = $2${typeCond} `,
        [enquiryId, Number(lineItemId)]
      );
      const delCards = await client.query(
        `DELETE FROM enquiry_vendor_cards WHERE enquiry_id = $1 AND enquiry_line_item_id = $2${typeCond} `,
        [enquiryId, Number(lineItemId)]
      );
      await client.query('COMMIT');
      res.json({ deleted_cards: delCards.rowCount, deleted_sub_charges: delSub.rowCount });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting vendor cards/sub-charges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE specific vendor card and its sub-charges
router.delete("/:code/vendor-cards/:cardId", async (req, res) => {
  try {
    const { code, cardId } = req.params;
    const { rows: enqRows } = await pool.query("SELECT id FROM enquiry WHERE code = $1", [code]);
    if (enqRows.length === 0) return res.status(404).json({ error: "Enquiry not found" });
    const enquiryId = enqRows[0].id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Delete sub-charges first
      await client.query(
        "DELETE FROM enquiry_vendor_sub_charges WHERE enquiry_id = $1 AND master_id = $2",
        [enquiryId, Number(cardId)]
      );
      // Delete the card
      const result = await client.query(
        "DELETE FROM enquiry_vendor_cards WHERE enquiry_id = $1 AND id = $2",
        [enquiryId, Number(cardId)]
      );
      await client.query('COMMIT');
      res.json({ message: "Vendor card and sub-charges deleted", rowCount: result.rowCount });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting vendor card:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
