const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const { getUsernameFromToken } = require("../utils/context-helper");
const { logMasterEvent } = require("../log");
// GET /enquiry - Fetch all enquiries with context filtering
// router.get('/', async (req, res) => {
//     try {
//         const username = getUsernameFromToken(req);
//         if (!username) {
//             return res.status(401).json({ error: 'Unauthorized' });
//         }

//         const { page = 1, limit = 10, search = '', status = '' } = req.query;
//         const offset = (page - 1) * limit;

//         // Get user context
//         const userResult = await pool.query(
//             'SELECT company_code, branch_code, department_code, service_type_code FROM users WHERE username = $1',
//             [username]
//         );

//         if (userResult.rows.length === 0) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         const userContext = userResult.rows[0];

//         // Build dynamic query with context filtering
//         let query = `
//             SELECT e.*, c.name as customer_display_name, c.name as customer_company
//             FROM enquiry e
//             LEFT JOIN customer c ON e.customer_id = c.id
//             WHERE 1=1
//         `;

//         const params = [];
//         let paramIndex = 1;

//         // Context filtering
//         if (userContext.company_code) {
//             query += ` AND e.company_code = $${paramIndex}`;
//             params.push(userContext.company_code);
//             paramIndex++;
//         }

//         if (userContext.branch_code) {
//             query += ` AND e.branch_code = $${paramIndex}`;
//             params.push(userContext.branch_code);
//             paramIndex++;
//         }

//         if (userContext.department_code) {
//             query += ` AND e.department_code = $${paramIndex}`;
//             params.push(userContext.department_code);
//             paramIndex++;
//         }

//         // Search filtering
//         if (search) {
//             query += ` AND (e.enquiry_no ILIKE $${paramIndex} OR e.customer_name ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`;
//             params.push(`%${search}%`);
//             paramIndex++;
//         }

//         // Status filtering
//         if (status) {
//             query += ` AND e.status = $${paramIndex}`;
//             params.push(status);
//             paramIndex++;
//         }

//         query += ` ORDER BY e.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
//         params.push(limit, offset);

//         const result = await pool.query(query, params);

//         // Get total count for pagination
//         let countQuery = `
//             SELECT COUNT(*)
//             FROM enquiry e
//             LEFT JOIN customer c ON e.customer_id = c.id
//             WHERE 1=1
//         `;

//         const countParams = params.slice(0, -2); // Remove limit and offset

//         if (userContext.company_code) countQuery += ` AND e.company_code = $1`;
//         if (userContext.branch_code) countQuery += ` AND e.branch_code = $${userContext.company_code ? 2 : 1}`;
//         if (userContext.department_code) countQuery += ` AND e.department_code = $${(userContext.company_code ? 1 : 0) + (userContext.branch_code ? 1 : 0) + 1}`;
//         if (search) countQuery += ` AND (e.enquiry_no ILIKE $${countParams.length} OR e.customer_name ILIKE $${countParams.length} OR c.name ILIKE $${countParams.length})`;
//         if (status) countQuery += ` AND e.status = $${countParams.length}`;

//         const countResult = await pool.query(countQuery, countParams);
//         const totalRecords = parseInt(countResult.rows[0].count);

//         res.json({
//             data: result.rows,
//             pagination: {
//                 page: parseInt(page),
//                 limit: parseInt(limit),
//                 total: totalRecords,
//                 pages: Math.ceil(totalRecords / limit)
//             }
//         });

//     } catch (error) {
//         console.error('Error fetching enquiries:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });
router.get("/", async (req, res) => {
  console.log("📩 [DEBUG] /api/enquiry called with query:", req.query);

  try {
    const {
      companyCode,
      branchCode,
      departmentCode,
      serviceTypeCode,
      page = 1,
      limit = 10,
      search = "",
      status = "",
    } = req.query;

    // Do not require username for GET; proceed without user context
    const userContext = {};
    console.log(
      "📌 [DEBUG] User context skipped for GET /enquiry; using optional query filters."
    );

    // Build dynamic query with context filtering
    let query = `
            SELECT e.*, c.name as customer_display_name, c.name as customer_company
            FROM enquiry e
            LEFT JOIN customer c ON e.customer_id = c.id
            WHERE 1=1
        `;

    const params = [];
    let paramIndex = 1;

    // Optional query param filtering (similar to master_location)
    if (companyCode) {
      query += ` AND e.company_code = $${paramIndex}`;
      params.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND e.branch_code = $${paramIndex}`;
        params.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND e.department_code = $${paramIndex}`;
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

    query += ` ORDER BY e.created_at DESC`;
    // params.push(limit, offset);

    console.log("📝 [DEBUG] Final query:", query);
    console.log("📊 [DEBUG] Query params:", params);

    const result = await pool.query(query, params);
    console.log("✅ [DEBUG] Enquiry result count:", result.rows.length);

    // // Get total count for pagination
    // let countQuery = `
    //         SELECT COUNT(*)
    //         FROM enquiry e
    //         LEFT JOIN customer c ON e.customer_id = c.id
    //         WHERE 1=1
    //     `;

    // const countParams = params.slice(0, -2); // Remove limit and offset
    // console.log("🧮 [DEBUG] Count query params:", countParams);

    // if (userContext.company_code) countQuery += ` AND e.company_code = $1`;
    // if (userContext.branch_code)
    //   countQuery += ` AND e.branch_code = $${userContext.company_code ? 2 : 1}`;
    // if (userContext.department_code)
    //   countQuery += ` AND e.department_code = $${
    //     (userContext.company_code ? 1 : 0) +
    //     (userContext.branch_code ? 1 : 0) +
    //     1
    //   }`;
    // if (search)
    //   countQuery += ` AND (e.enquiry_no ILIKE $${countParams.length} OR e.customer_name ILIKE $${countParams.length} OR c.name ILIKE $${countParams.length})`;
    // if (status) countQuery += ` AND e.status = $${countParams.length}`;

    // console.log("🧮 [DEBUG] Count query:", countQuery);
    // console.log("🧮 [DEBUG] Count params:", countParams);

    // const countResult = await pool.query(countQuery, countParams);
    // const totalRecords = parseInt(countResult.rows[0].count);
    // console.log("📦 [DEBUG] Total records:", totalRecords);

    res.json({
      data: result.rows,
      // pagination: {
      //   total: totalRecords,
      // },
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

    // Get enquiry details
    const enquiryResult = await pool.query(
      "SELECT e.*, c.name as customer_display_name FROM enquiry e LEFT JOIN customer c ON e.customer_id = c.id WHERE e.code = $1",
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
    // console.log("enquiry line Item Result,", lineItemsResult);
    // Get vendor cards
    // const vendorCardsResult = await pool.query(
    //   "SELECT * FROM enquiry_vendor_cards WHERE enquiry_id = $1 ORDER BY created_at",
    //   [enquiry_id]
    // );

    // let nested_line_item = lineItemsResult.rows.forEach(lineItem => {
    for (let lineItem of lineItemsResult) {
      let line_item_id = lineItem.s_no;
      let enquiry_summary = [
        {
          id: "1",
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
        },
      ];
      const { rows: vendorCardsResult } = await pool.query(
        "SELECT * FROM enquiry_vendor_cards WHERE enquiry_id=$1 AND enquiry_line_item_id=$2 ORDER BY sourced_no DESC NULLS LAST;",
        [enquiry_id, line_item_id]
      );
      // console.log("list of vendor cards,", vendorCardsResult);
      let source_list = [];
      let selected_source_list = [];
      let tariff_list = [];
      let selected_tariff_list = [];
      vendorCardsResult.forEach((vendorCard) => {
        if (vendorCard.source_type.toLowerCase() == "tariff") {
          if (vendorCard.is_selected) {
            selected_tariff_list.push(vendorCard);
          }
          tariff_list.push(vendorCard);
        } else if (vendorCard.source_type.toLowerCase() == "sourcing") {
          if (vendorCard.is_selected) {
            selected_source_list.push(vendorCard);
          }
          source_list.push(vendorCard);
        }
      });
      // console.log(
      //   "vendor card source list:",
      //   source_list,
      //   "tariff list",
      //   tariff_list
      // );

      if (source_list.length != 0) {
        // removes the first element in enquiry summary list
        enquiry_summary.splice(0, 1);
        let selected_sourcing =
          source_list.find((source) => source.is_selected) || {};
        // eliminating null value with
        selected_sourcing["charges"] =
          selected_sourcing.charges == null ? 0 : selected_sourcing.charges;
        selected_sourcing["negotiated_amount"] =
          selected_sourcing.negotiated_amount == null
            ? 0
            : selected_sourcing.negotiated_amount;
        console.log(
          "Selected sourcing at line item id",
          line_item_id,
          "is:",
          selected_sourcing
        );

        let source_summary = {
          id: 1,
          summary_type: "sourcing",
          sourced_no: selected_sourcing.sourced_no || "--",
          vendor_name: selected_sourcing.vendor_name || "--",
          currency_code: selected_sourcing.currency_code || "--",
          charge:
            Math.max(
              selected_sourcing.charges,
              selected_sourcing.negotiated_amount
            ) || "--",
          sourced_time: selected_sourcing.created_at,
          remarks: selected_sourcing.remarks || "--",
          selected_source_items: selected_source_list,
          sourced_list: source_list,
        };
        // enquiry_summary.push(source_summary);
        enquiry_summary.splice(0, 0, source_summary);
      }

      if (tariff_list.length != 0) {
        // removing the last element in the enquiry summary
        enquiry_summary.splice(1, 1);
        let selected_tariff =
          tariff_list.find((tariff) => tariff.is_selected) || {};
        console.log(
          "Selected tariff at line item id",
          line_item_id,
          "is:",
          selected_tariff
        );
        let tariff_summary = {
          id: 2,
          summary_type: "tariff",
          sourced_no: selected_tariff.sourced_no || "--",
          vendor_name: selected_tariff.vendor_name || "--",
          currency_code: selected_tariff.currency_code || "--",
          charge:
            Math.max(
              selected_tariff.charges,
              selected_tariff.negotiated_amount
            ) || "--",
          sourced_time: selected_tariff.created_at,
          remarks: selected_tariff.remarks || "--",
          selected_source_items: selected_tariff_list,
          sourced_list: tariff_list,
        };
        // enquiry_summary.push(tariff_summary);
        enquiry_summary.splice(1, 0, tariff_summary);
      }

      let nested_line_item = { ...lineItem, enquiry_summary: enquiry_summary };
      console.log("enquiry summary,", enquiry_summary);
      line_items.push(nested_line_item);
    }

    res.json({
      ...enquiry,
      line_items: line_items,
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

    // Get enquiry details
    const enquiryResult = await pool.query(
      "SELECT e.*, c.name as customer_display_name FROM enquiry e LEFT JOIN customer c ON e.customer_id = c.id WHERE e.code = $1",
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
      "SELECT * FROM enquiry_line_items WHERE enquiry_id = $1 AND is_selected = true ORDER BY s_no",
      [enquiry_id]
    );
    console.log("enquiry line Item Result,", lineItemsResult);
    // Get vendor cards
    // const vendorCardsResult = await pool.query(
    //   "SELECT * FROM enquiry_vendor_cards WHERE enquiry_id = $1 ORDER BY created_at",
    //   [enquiry_id]
    // );

    // let nested_line_item = lineItemsResult.rows.forEach(lineItem => {
    for (let lineItem of lineItemsResult) {
      let line_item_id = lineItem.s_no;
      let enquiry_summary = [
        {
          id: "1",
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
        },
      ];
      const { rows: vendorCardsResult } = await pool.query(
        "SELECT * FROM enquiry_vendor_cards WHERE enquiry_id=$1 AND enquiry_line_item_id=$2 ORDER BY sourced_no DESC;",
        [enquiry_id, line_item_id]
      );
      // console.log("list of vendor cards,", vendorCardsResult);
      let selected_source_list = [];
      let selected_tariff_list = [];
      vendorCardsResult.forEach((vendorCard) => {
        if (
          vendorCard.source_type.toLowerCase() == "tariff" &&
          vendorCard.is_selected
        ) {
          selected_tariff_list.push(vendorCard);
        } else if (
          vendorCard.source_type.toLowerCase() == "sourcing" &&
          vendorCard.is_selected
        ) {
          selected_source_list.push(vendorCard);
        }
      });
      // console.log(
      //   "vendor card source list:",
      //   source_list,
      //   "tariff list",
      //   tariff_list
      // );

      if (selected_source_list.length != 0) {
        // removes the first element in enquiry summary list
        enquiry_summary.splice(0, 1);
        let selected_sourcing = selected_source_list[0] || {};
        // eliminating null value with
        selected_sourcing["charges"] =
          selected_sourcing.charges == null ? 0 : selected_sourcing.charges;
        selected_sourcing["negotiated_amount"] =
          selected_sourcing.negotiated_amount == null
            ? 0
            : selected_sourcing.negotiated_amount;
        console.log(
          "Selected sourcing at line item id",
          line_item_id,
          "is:",
          selected_sourcing
        );

        let source_summary = {
          id: 1,
          summary_type: "sourcing",
          sourced_no: selected_sourcing.sourced_no || "--",
          vendor_name: selected_sourcing.vendor_name || "--",
          currency_code: selected_sourcing.currency_code || "--",
          charge:
            Math.max(
              selected_sourcing.charges,
              selected_sourcing.negotiated_amount
            ) || "--",
          sourced_time: selected_sourcing.created_at,
          remarks: selected_sourcing.remarks || "--",
          selected_source_items: selected_source_list,
        };
        // enquiry_summary.push(source_summary);
        enquiry_summary.splice(0, 0, source_summary);
      }

      if (selected_tariff_list.length != 0) {
        // removing the last element in the enquiry summary
        enquiry_summary.splice(1, 1);
        let selected_tariff = selected_tariff_list[0] || {};
        console.log(
          "Selected tariff at line item id",
          line_item_id,
          "is:",
          selected_tariff
        );
        let tariff_summary = {
          id: 2,
          summary_type: "tariff",
          sourced_no: selected_tariff.sourced_no || "--",
          vendor_name: selected_tariff.vendor_name || "--",
          currency_code: selected_tariff.currency_code || "--",
          charge:
            Math.max(
              selected_tariff.charges,
              selected_tariff.negotiated_amount
            ) || "--",
          sourced_time: selected_tariff.created_at,
          remarks: selected_tariff.remarks || "--",
          selected_source_items: selected_tariff_list,
        };
        // enquiry_summary.push(tariff_summary);
        enquiry_summary.splice(1, 0, tariff_summary);
      }

      let nested_line_item = { ...lineItem, enquiry_summary: enquiry_summary };
      console.log("enquiry summary,", enquiry_summary);
      line_items.push(nested_line_item);
    }

    res.json({
      ...enquiry,
      line_items: line_items,
      // vendor_cards: vendorCardsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    res.status(500).json({ error: "Internal server error" });
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
      line_items = [],
      is_new_customer = false,
      code,
      name,
      source_sales_code,
    } = req.body;

    // Get user context
    const userResult = await pool.query(
      "SELECT company_code, branch_code, department_code, service_type_code FROM users WHERE username = $1",
      [name]
    );

    const userContext = userResult.rows[0] || {};

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // is Old Customer
      let { rows: isOldCustomerContact } = await pool.query(
        `SELECT cus.customer_id FROM (SELECT * FROM customer_contacts AS cc JOIN customer AS c ON c.id = cc.customer_id WHERE cc.name = $1 ) AS cus;`,
        [customer_name]
      );

      let { rows: isCompanyExists } = await pool.query(
        `SELECT exists (SELECT 1 FROM customer WHERE name= $1) AS found`,
        [company_name]
      );
      console.log("is New Customer contact DB response", isOldCustomerContact);

      let finalCustomerId = customer_id;

      // If new customer, create customer record first
      if (
        (is_new_customer ||
          !isCompanyExists ||
          isOldCustomerContact.length === 0) &&
        company_name
      ) {
        // Generate customer number using number series
        const customerNumberResult = await client.query(
          `SELECT nr.prefix, nr.last_no_used as current_number, nr.increment_by
                     FROM number_relation nr 
                     WHERE nr.company_code = $1 AND nr.branch_code = $2 
                     AND nr.department_code = $3 AND nr.number_series = 'CUSTOMER'`,
          [
            userContext.company_code,
            userContext.branch_code,
            userContext.department_code,
          ]
        );

        let customerNo;
        if (customerNumberResult.rows.length > 0) {
          const numberSeries = customerNumberResult.rows[0];
          const nextNumber =
            numberSeries.current_number + numberSeries.increment_by;
          const paddedNumber = nextNumber.toString().padStart(6, "0"); // Use 6 digits as default
          customerNo = (numberSeries.prefix || "CUST") + paddedNumber;

          // Update the current number in number_relation
          await client.query(
            "UPDATE number_relation SET last_no_used = $1 WHERE id = $2",
            [nextNumber, numberSeries.id]
          );
        } else {
          // Fallback to simple numbering if no number series found
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
                     VALUES ($1, $2, $3, $4, $5, $6 ) RETURNING *`,
          [
            customerNo,
            company_name || customer_name,

            userContext.company_code || "",
            userContext.branch_code || "",
            userContext.department_code || "",
            userContext.service_type_code || "",
          ]
        );
        console.log("Added Customer company,", customerResult);
        finalCustomerId = customerResult.rows[0].id;
        let { rows: customerContacts } = await pool.query(
          `INSERT INTO customer_contacts (customer_id, name, department, mobile, landline, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            finalCustomerId,
            customer_name || "",
            department || "",
            mobile || "",
            landline || "",
            email || "",
          ]
        );
      } else if (
        isCompanyExists &&
        isOldCustomerContact.length === 0 &&
        customer_name.trim() !== ""
      ) {
        let { rows: newCustomerResult } = await pool.query(
          `INSERT INTO customer_contacts (customer_id, name, department, mobile, landline, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            customer_id,
            customer_name || "",
            department || "",
            mobile || "",
            landline || "",
            email || "",
          ]
        );
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
                 service_type, status, remarks, company_code, branch_code, department_code, service_type_code, source_sales_code, cargo_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,$25,$26) RETURNING id`,
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
          userContext.company_code,
          userContext.branch_code,
          userContext.department_code,
          userContext.service_type_code,
          source_sales_code,
          cargo_type,
        ]
      );

      console.log("Debug: Create enquiry result", enquiryResult);

      const enquiryId = enquiryResult.rows[0].id;

      // Create line items
      for (let i = 0; i < line_items.length; i++) {
        const item = line_items[i];
        await client.query(
          `INSERT INTO enquiry_line_items (enquiry_id, s_no, quantity, type, service_area, basis, remarks, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            enquiryId,
            i + 1,
            item.quantity,
            item.type,
            item.service_area,
            item.basis,
            item.remarks,
            item.status || "Active",
          ]
        );
      }

      await client.query("COMMIT");

      // Log the creation
      await logMasterEvent({
        username: name,
        action: "CREATE",
        masterType: "Enquiry",
        recordId: enquiryCode,
        details: `New Enquiry "${enquiryCode}" has been created successfully.`,
      });

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
      source_sales_code,
      line_items = [],
      cargo_type,
      is_new_customer,
      username = "System",
    } = req.body;

    // First get the enquiry ID from the code
    const enquiryResult = await pool.query(
      "SELECT id FROM enquiry WHERE code = $1",
      [enquiryCode]
    );
    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    const enquiryId = enquiryResult.rows[0].id;

    username = getUsernameFromToken(req) || "system";

    // Get user context
    const userResult = await pool.query(
      "SELECT company_code, branch_code, department_code, service_type_code FROM users WHERE username = $1",
      [username]
    );

    const userContext = userResult.rows[0] || {};

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let { rows: isOldCustomerContact } = await pool.query(
        `SELECT cus.customer_id FROM (SELECT * FROM customer_contacts AS cc JOIN customer AS c ON c.id = cc.customer_id WHERE cc.name = $1 ) AS cus;`,
        [customer_name]
      );
      let { rows: isCompanyExists } = await pool.query(
        `SELECT exists (SELECT 1 FROM customer WHERE name= $1) AS found`,
        [company_name]
      );
      console.log(
        "is New Customer contact DB response",
        isOldCustomerContact,
        "for Company,",
        isCompanyExists
      );

      // If new customer, create customer record first
      if ((is_new_customer || !isCompanyExists.found) && company_name) {
        // Generate customer number using number series
        const customerNumberResult = await client.query(
          `SELECT nr.prefix, nr.last_no_used as current_number, nr.increment_by
                     FROM number_relation nr 
                     WHERE nr.company_code = $1 AND nr.branch_code = $2 
                     AND nr.department_code = $3 AND nr.number_series = 'CUSTOMER'`,
          [
            userContext.company_code,
            userContext.branch_code,
            userContext.department_code,
          ]
        );

        let customerNo;
        if (customerNumberResult.rows.length > 0) {
          const numberSeries = customerNumberResult.rows[0];
          const nextNumber =
            numberSeries.current_number + numberSeries.increment_by;
          const paddedNumber = nextNumber.toString().padStart(6, "0"); // Use 6 digits as default
          customerNo = (numberSeries.prefix || "CUST") + paddedNumber;

          // Update the current number in number_relation
          await client.query(
            "UPDATE number_relation SET last_no_used = $1 WHERE id = $2",
            [nextNumber, numberSeries.id]
          );
        } else {
          // Fallback to simple numbering if no number series found
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
                     company_code, branch_code, department_code, service_type_code)
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            customerNo,
            company_name || customer_name,

            userContext.company_code,
            userContext.branch_code,
            userContext.department_code,
            userContext.service_type_code,
          ]
        );

        let newCustomerId = customerResult.rows[0].id;
        let { rows: customerContacts } = await pool.query(
          `INSERT INTO customer_contacts (customer_id, name, department, mobile, landline, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            newCustomerId,
            customer_name || "",
            department || "",
            mobile || "",
            landline || "",
            email || "",
          ]
        );
      } else if (
        isCompanyExists.found &&
        isOldCustomerContact.length === 0 &&
        customer_name
      ) {
        let { rows: newCustomerResult } = await pool.query(
          `INSERT INTO customer_contacts (customer_id, name, department, mobile, landline, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [
            customer_id,
            customer_name || "",
            department || "",
            mobile || "",
            landline || "",
            email || "",
          ]
        );
      }

      // Update enquiry (note: we don't update the code as it's the identifier)
      await client.query(
        `UPDATE enquiry SET date = $1, customer_id = $2, customer_name = $3, email = $4,
                 mobile = $5, landline = $6, company_name = $7, contact_department = $8, from_location = $9, to_location = $10,
                 effective_date_from = $11, effective_date_to = $12, department = $13, service_type = $14, status = $15, remarks = $16, source_sales_code = $17,
                 cargo_type= $19, location_type_from= $20, location_type_to= $21 WHERE id = $18`,
        [
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
        ]
      );

      // Delete existing line items
      // await client.query(
      //   "DELETE FROM enquiry_line_items WHERE enquiry_id = $1",
      //   [enquiryId]
      // );

      // selecting the line item of the enquiry
      const { rows: lineItemResult } = await client.query(
        `SELECT id FROM enquiry_line_items WHERE enquiry_id = $1`,
        [enquiryId]
      );
      console.log("line items list for the enquiry", lineItemResult);
      // Create new line items
      if (lineItemResult.length === 0) {
        // Create new line items
        for (let i = 0; i < line_items.length; i++) {
          let item = line_items[i];
          await client.query(
            `INSERT INTO enquiry_line_items (enquiry_id, s_no, quantity, type, service_area, basis, remarks, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              enquiryId,
              i + 1,
              item.quantity,
              item.type,
              item.service_area,
              item.basis,
              item.remarks,
              item.status || "Active",
            ]
          );
        }
      } else {
        for (let i = 0; i < line_items.length; i++) {
          let item = line_items[i];
          if (item.id) {
            await client.query(
              `UPDATE enquiry_line_items SET quantity =$1, type = $2, service_area =$3, basis=$4, remarks=$5, status=$6
           WHERE enquiry_id= $7 AND s_no = $8 AND id = $9 `,
              [
                item.quantity,
                item.type,
                item.service_area,
                item.basis,
                item.remarks,
                item.status || "Active",
                enquiryId,
                i + 1,
                lineItemResult[i].id,
              ]
            );
          } else {
            await client.query(
              `INSERT INTO enquiry_line_items (enquiry_id, s_no, quantity, type, service_area, basis, remarks, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                enquiryId,
                i + 1,
                item.quantity,
                item.type,
                item.service_area,
                item.basis,
                item.remarks,
                item.status || "Active",
              ]
            );
          }
        }
      }
      await client.query("COMMIT");

      // Log the update
      await logMasterEvent({
        username: username,
        action: "UPDATE",
        masterType: "Enquiry",
        recordId: enquiryCode,
        details: `Enquiry "${enquiryCode}" has been updated successfully.`,
      });

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

    // Log the deletion
    await logMasterEvent({
      username: username,
      action: "DELETE",
      masterType: "Enquiry",
      recordId: code,
      details: `Enquiry "${code}" has been deleted successfully.`,
    });

    res.json({ message: "Enquiry deleted successfully" });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /enquiry/customers/dropdown - Get customers for dropdown
router.get("/customers/dropdown", async (req, res) => {
  try {
    const username = getUsernameFromToken(req) || "system";

    const { search = "" } = req.query;
    console.log("🔍 Search query received:", search);

    // Get user context
    const userResult = await pool.query(
      "SELECT company_code, branch_code, department_code FROM users WHERE username = $1",
      [username]
    );
    const userContext = userResult.rows[0] || {};
    console.log("✅ User context:", userContext);

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

    console.log("📌 Customer query:", customerQuery);
    console.log("📌 Customer params:", customerParams);

    const customerResult = await pool.query(customerQuery, customerParams);
    console.log(`✅ Customers fetched: ${customerResult.rows.length}`);

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

    console.log("📌 Enquiry query:", enquiryQuery);
    console.log("📌 Enquiry params:", enquiryParams);

    const enquiryResult = await pool.query(enquiryQuery, enquiryParams);
    console.log(`✅ Enquiry customers fetched: ${enquiryResult.rows.length}`);

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

    console.log(`🎯 Final unique customers: ${uniqueCustomers.length}`);

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
    const username = getUsernameFromToken(req) || "system";

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
    const userContext = getUsernameFromToken(req) || "system";

    console.log("🏢 Departments dropdown request:", {
      search,
      company_code,
      userContext,
    });

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

    console.log("📌 Department query:", query);
    console.log("📌 Department params:", params);

    const result = await pool.query(query, params);
    console.log(`✅ Departments fetched: ${result.rows.length}`);

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
    } = req.body;

    let query = `
      SELECT * FROM ( 
        SELECT *, 
        CASE
          WHEN period_end_date IS NULL THEN 'Active'
          WHEN NOW() > period_end_date::DATE THEN 'Expired'
          ELSE 'Active' 
        END AS source_status
        FROM sourcing
      ) WHERE source_status = 'Active'
    `;

    const params = [];
    let paramIndex = 1;

    // Department filter
    if (department && department.trim() !== "") {
      query += ` AND mode = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }

    // Service Area filter
    if (service_area && service_area.trim() !== "") {
      query += ` AND service_area = $${paramIndex}`;
      params.push(service_area);
      paramIndex++;

      // Get service area configuration
      const serviceAreaResult = await pool.query(
        `SELECT from_location, to_location FROM master_service_area WHERE service_area = $1`,
        [service_area]
      );

      if (serviceAreaResult.rows.length > 0) {
        const serviceAreaData = serviceAreaResult.rows[0];
        const saFromLoc = serviceAreaData.from_location;
        const saToLoc = serviceAreaData.to_location;

        console.log(
          "Service Area configuration - from_location:",
          saFromLoc,
          "to_location:",
          saToLoc
        );

        // Location filtering based on service area configuration and match_all/match_any
        let locationConditions = [];

        // Add from_location condition if service area requires it AND we have from_location value
        if (saFromLoc && from_location && from_location.trim() !== "") {
          if (from_location_type && from_location_type.trim() !== "") {
            locationConditions.push(
              `(from_location = $${paramIndex} AND location_type_from = $${
                paramIndex + 1
              })`
            );
            params.push(from_location, from_location_type);
            paramIndex += 2;
          } else {
            locationConditions.push(`from_location = $${paramIndex}`);
            params.push(from_location);
            paramIndex++;
          }
        }

        // Add to_location condition if service area requires it AND we have to_location value
        if (saToLoc && to_location && to_location.trim() !== "") {
          if (to_location_type && to_location_type.trim() !== "") {
            locationConditions.push(
              `(to_location = $${paramIndex} AND location_type_to = $${
                paramIndex + 1
              })`
            );
            params.push(to_location, to_location_type);
            paramIndex += 2;
          } else {
            locationConditions.push(`to_location = $${paramIndex}`);
            params.push(to_location);
            paramIndex++;
          }
        }

        // Apply location conditions based on match_all/match_any
        if (locationConditions.length > 0) {
          if (sourcing === "match_all") {
            // Require ALL conditions to match (AND logic)
            query += ` AND ${locationConditions.join(" AND ")}`;
            console.log(
              "Applying match_all logic:",
              locationConditions.join(" AND ")
            );
          } else if (sourcing === "match_any") {
            // Require ANY condition to match (OR logic)
            query += ` AND (${locationConditions.join(" OR ")})`;
            console.log(
              "Applying match_any logic:",
              locationConditions.join(" OR ")
            );
          } else {
            // Default: require ALL conditions
            query += ` AND ${locationConditions.join(" AND ")}`;
          }
        } else {
          console.log(
            "No location conditions to apply based on service area configuration"
          );
        }
      }
    }

    // Cargo type filter
    if (cargo_type && cargo_type.trim() !== "") {
      query += ` AND cargo_type = $${paramIndex}`;
      params.push(cargo_type);
      paramIndex++;
    }

    // Basis filter
    if (basis && basis.trim() !== "") {
      query += ` AND basis = $${paramIndex}`;
      params.push(basis);
      paramIndex++;
    }

    // Date range filter
    if (
      effective_date_from &&
      effective_date_from.trim() !== "" &&
      effective_date_to &&
      effective_date_to.trim() !== ""
    ) {
      query += ` AND (
        (period_start_date IS NULL OR period_start_date <= $${paramIndex}) AND 
        (period_end_date IS NULL OR period_end_date >= $${paramIndex})
      )`;
      params.push(effective_date_to);
      paramIndex++;
    }

    query += ` ORDER BY code, id DESC`;

    console.log("Final sourcing query:", query);
    console.log("Final sourcing params:", params);

    const { rows: sourceResult } = await pool.query(query, params);
    console.log(`Found ${sourceResult.length} sourcing vendors`);

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

    console.log("Sourcing response prepared:", sourceResponse);
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
      effective_date_from,
      effective_date_to,
      sourcing,
      local_tariff,
    } = req.body;

    if (!sourcing || sourcing.length === 0) {
      return res.status(400).json({ error: "No sourcing vendors selected" });
    }

    const vendorNos = sourcing.map((v) => v.vendor_no || v.vendor_name);
    const vendorTypes = sourcing.map((v) => v.vendor_type);

    let query = `
      SELECT t.*, v.name AS vendor_name, v.type AS vendor_type
      FROM tariff AS t
      LEFT JOIN vendor AS v ON t.vendor_name = v.vendor_no
      WHERE t.is_mandatory = true
    `;

    const params = [];
    let paramIndex = 1;
    if (effective_date_from && effective_date_to) {
      query += `
        AND t.period_start_date <= $${paramIndex}
        AND ($${paramIndex + 1} <= t.expiry_date OR t.expiry_date IS NULL)
      `;
      params.push(effective_date_from, effective_date_to);
      paramIndex += 2;
    }
    query += ` AND t.vendor_name = ANY($${paramIndex})`;
    params.push(vendorNos);
    paramIndex++;

    query += ` AND v.type = ANY($${paramIndex})`;
    params.push(vendorTypes);
    paramIndex++;
    if (department && department.trim() !== "") {
      query += ` AND t.mode = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }
    if (service_type && service_type.trim() !== "") {
      query += ` AND t.shipping_type = $${paramIndex}`;
      params.push(service_type);
      paramIndex++;
    }
    if (cargo_type && cargo_type.trim() !== "") {
      query += ` AND t.cargo_type = $${paramIndex}`;
      params.push(cargo_type);
      paramIndex++;
    }
    let locationConditions = [];

    if (from_location) {
      if (from_location_type) {
        locationConditions.push(
          `(t.from_location = $${paramIndex} AND t.location_type_from = $${
            paramIndex + 1
          })`
        );
        params.push(from_location, from_location_type);
        paramIndex += 2;
      } else {
        locationConditions.push(`t.from_location = $${paramIndex}`);
        params.push(from_location);
        paramIndex++;
      }
    }

    if (to_location) {
      if (to_location_type) {
        locationConditions.push(
          `(t.to_location = $${paramIndex} AND t.location_type_to = $${
            paramIndex + 1
          })`
        );
        params.push(to_location, to_location_type);
        paramIndex += 2;
      } else {
        locationConditions.push(`t.to_location = $${paramIndex}`);
        params.push(to_location);
        paramIndex++;
      }
    }

    if (locationConditions.length > 0) {
      if (local_tariff === "match_any") {
        query += ` AND (${locationConditions.join(" OR ")})`;
      } else {
        // match_all + default
        query += ` AND ${locationConditions.join(" AND ")}`;
      }
    }
    query += ` ORDER BY t.vendor_name, t.created_at DESC`;

    console.log("Final tariff query:", query);
    console.log("Final tariff params:", params);

    const { rows: tariffResult } = await pool.query(query, params);
    const tariffIds = tariffResult.map((T) => T.id);

    const { rows: tariffSubchargeResult } = await pool.query(
      `SELECT * FROM tariff_charges WHERE tariff_id = ANY($1) ORDER BY tariff_id, id`,
      tariffIds
    );

    // reducing the collected sub charge as per source id
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

    console.log(`Found ${tariff.length} tariff vendors`);

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
      "SELECT id, department, service_type, cargo_type, from_location_type, to_location_type, effective_date_from, effective_date_to FROM enquiry WHERE code = $1",
      [code]
    );

    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }

    const enquiryRow = enquiryResult.rows[0];
    const enquiryId = enquiryRow.id;

    // retriving the previously selected sourcing Id
    const {rows: vendorCardId} = await pool.query(`SELECT id FROM enquiry_vendor_cards WHERE enquiry_id = $1 AND enquiry_line_item_id = $2 AND master_type=$3;`, [enquiryId, lineItemId, masterType]);

    const client = await pool.connect();

    

    try {
      await client.query("BEGIN");

      const card = vendorCard ? vendorCard : null;

      if(!card){
        return res.status(400).json({error: "No vendor cards provided"});
      }



        // master_type already validated above

        // Handle date fields based on master_type
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
          expiryDate = card.expiry_date || enquiryRow.effective_date_to || null;
        }

        // Insert into enquiry_vendor_cards with proper master_type
        const insertQuery = `
          INSERT INTO enquiry_vendor_cards 
            (enquiry_id, enquiry_line_item_id, master_type, department, service_type, 
             type, service_area, vendor_type, vendor_name, basis, cargo, 
             location_type_from, from_location, location_type_to, to_location, 
             period_start_date, period_end_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          RETURNING id
        `;

        const insertParams = [
          enquiryId,
          lineItemId,
          masterType,
          card.department || enquiryRow.department || null,
          card.service_type || enquiryRow.service_type || null,
          card.type || null,
          card.service_area || null,
          card.vendor_type || null,
          card.vendor_name || card.vendor || card.code || null,
          card.basis || null,
          card.cargo || card.cargo_type || enquiryRow.cargo_type || null,
          card.location_type_from || enquiryRow.location_type_from || null,
          card.from_location || null,
          card.location_type_to || enquiryRow.location_type_to || null,
          card.to_location || null,
          effectiveDate,
          expiryDate,
        ];

        const result = await client.query(insertQuery, insertParams);
        const vendorCardId = result.rows[0].id;

        // Insert sub-charges with proper master_type reference
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
            const amountVal = ch.amount ?? ch.charges ?? null;
            const sellRateCur = ch.sell_rate_currency || null;
            const sellRateVal = ch.sell_rate || null;
            const gstVatVal = ch.gst_vat || ch.gst_rate || null;
            const remarksVal = ch.remarks || null;

            // Skip rows that would violate NOT NULL constraints
            if (!chargeName || !currencyVal) {
              console.warn(
                "Skipping sub-charge due to missing required fields",
                {
                  chargeName,
                  currencyVal,
                  basisVal,
                  amountVal,
                }
              );
              continue;
            }

            const subChargeQuery = `
              INSERT INTO enquiry_vendor_sub_charges 
                (enquiry_id, enquiry_line_item_id, master_id, master_type, charge_name, 
                 currency, basis, charges, sell_rate_currency, sell_rate, gst_vat, remarks)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
              gstVatVal,
              remarksVal,
            ];

            await client.query(subChargeQuery, subChargeParams);
          }
        }
      

      await client.query("COMMIT");

      res.json({
        message: `Vendor card added successfully for ${masterType}`,
        master_type: masterType,
        count: card.length,
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
        `INSERT INTO booking (booking_no, enquiry_id, customer_id, customer_name, mail_id, phone_no1, phone_no2,
                 company_name, from_location, to_location, effective_date_from, effective_date_to, department,
                 status, remarks, vendor_details, line_items, charges, company_code, branch_code, department_code, service_type_code)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
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
    console.log("Enquiry Id for the line item,", enquiryIdRow);
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
    const {} = await pool.query(
      `INSERT INTO enquiry_line_items (enquiry_id, s_no, quantity, type, service_area, basis, remarks, status, enquiry_line_item_id)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $2)`,
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

    // console.log("line Item Selection enquiry ID", enquiry_id);
    // unselect all line item for the id
    const result = await pool.query(
      `UPDATE enquiry_line_items SET is_selected = false WHERE enquiry_id = $1 RETURNING *`,
      [enquiry_id]
    );
    // console.log(
    //   "all line Items of the corresponding enquiry updated  to false",
    //   result
    // );

    // console.log("lineItems api body,", selectedLineItems);

    // if (lineItems[0].enquiry_id !== enquiry_id) {
    //   res.status(404).json({ msg: "enquiry Id mismatch." });
    // }
    let lineItemsList = selectedLineItems.map((lineItem) => ({
      lineItemId: lineItem.id,
      enquiryId: lineItem.enquiry_id,
      lineItemSno: lineItem.s_no,
    }));
    if (selectedLineItems.length > 0) {
      query = ` UPDATE enquiry_line_items SET is_selected = true WHERE enquiry_id = $1 AND `;
      params = [enquiry_id];
      console.log("mapped Line Item Result,", lineItemsList);
      lineItemsList.forEach((lineItem, index) => {
        console.log("index,", index, "line item result,", lineItemsList.length);
        if (lineItemsList.length === 1) {
          query += `( s_no = $${index + 2})`;
          params.push(lineItem.lineItemSno);
        } else {
          query +=
            index === 0
              ? `( s_no = $${index + 2}`
              : index === lineItemsList.length - 1
              ? `  OR  s_no = $${index + 2} )`
              : `  OR  s_no = $${index + 2} `;
          params.push(lineItem.lineItemSno);
        }
      });
      console.log("line item selection query,", query, "params list,", params);
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

    console.log("DEBUG: vendor cards list from post met:", vendorCardList);

    // First get the enquiry ID from the code
    const enquiryResult = await pool.query(
      "SELECT id FROM enquiry WHERE code = $1",
      [code]
    );
    if (enquiryResult.rows.length === 0) {
      return res.status(404).json({ error: "Enquiry not found" });
    }
    const enquiryId = enquiryResult.rows[0].id;

    // unselect all selected vendor card
    await pool.query(
      `UPDATE enquiry_vendor_cards SET is_selected=false 
        WHERE enquiry_id = $1 AND enquiry_line_item_id = $2
        AND source_type = $3; `,
      [enquiryId, lineItemId, sourcingType]
    );

    let selectedVendorCardList = vendorCardList.map((vendorCard) => ({
      vendorCardId: vendorCard.id,
      enquiryId: vendorCard.enquiry_id,
    }));
    if (selectedVendorCardList.length > 0) {
      query = ` UPDATE enquiry_vendor_cards SET is_selected = true WHERE enquiry_id = $1 AND enquiry_line_item_id = $2 AND source_type = $3 AND`;
      params = [enquiryId, lineItemId, sourcingType];
      console.log("mapped Line Item Result,", selectedVendorCardList);
      selectedVendorCardList.forEach((vendorCard, index) => {
        console.log(
          "index,",
          index,
          "line item result,",
          selectedVendorCardList.length
        );
        if (selectedVendorCardList.length === 1) {
          query += ` ( id = $${index + 4})`;
          params.push(vendorCard.vendorCardId);
        } else {
          query +=
            index === 0
              ? ` ( id = $${index + 4}`
              : index === selectedVendorCardList.length - 1
              ? `  OR  id = $${index + 4} )`
              : `  OR  id = $${index + 4} `;
          params.push(vendorCard.vendorCardId);
        }
      });
      console.log("line item selection query,", query, "params list,", params);
      const { rows: vendorCardSelectionResult } = await pool.query(
        query,
        params
      );
      console.log("Vendor Card Selection Result,", vendorCardSelectionResult);
    }
    // const lineItemSelectionResult = await pool.query(
    //   ` UPDATE enquiry_line_items SET is_selected = true `
    // );

    res.status(200).json({ msg: "Updated Line Item Selection !" });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
