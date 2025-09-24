const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const {getUsernameFromToken}=require('../utils/context-helper');
const { logMasterEvent } = require('../log');
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
router.get('/', async (req, res) => {
    console.log("📩 [DEBUG] /api/enquiry called with query:", req.query);

    try { const username = getUsernameFromToken(req);
        // if (!username) {
        //     return res.status(401).json({ error: 'Unauthorized' });
        // }
        const { page = 1, limit = 10, search = '', status = '' } = req.query;
        const offset = (page - 1) * limit;
        console.log("📄 [DEBUG] Pagination => page:", page, "limit:", limit, "offset:", offset);

        // Get user context
        const userResult = await pool.query(
            'SELECT company_code, branch_code, department_code, service_type_code FROM users WHERE username = $1',
            [username]
        );
        console.log("✅ [DEBUG] User context rows:", userResult.rows);

        if (userResult.rows.length === 0) {
            console.warn("⚠️ [DEBUG] User not found in DB for username:", username);
            return res.status(404).json({ error: 'User not found' });
        }

        const userContext = userResult.rows[0];
        console.log("📌 [DEBUG] User context:", userContext);

        // Build dynamic query with context filtering
        let query = `
            SELECT e.*, c.name as customer_display_name, c.name as customer_company
            FROM enquiry e
            LEFT JOIN customer c ON e.customer_id = c.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramIndex = 1;

        // Context filtering
        if (userContext.company_code) {
            query += ` AND e.company_code = $${paramIndex}`;
            params.push(userContext.company_code);
            paramIndex++;
        }
        if (userContext.branch_code) {
            query += ` AND e.branch_code = $${paramIndex}`;
            params.push(userContext.branch_code);
            paramIndex++;
        }
        if (userContext.department_code) {
            query += ` AND e.department_code = $${paramIndex}`;
            params.push(userContext.department_code);
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

        query += ` ORDER BY e.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        console.log("📝 [DEBUG] Final query:", query);
        console.log("📊 [DEBUG] Query params:", params);

        const result = await pool.query(query, params);
        console.log("✅ [DEBUG] Enquiry result count:", result.rows.length);

        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) 
            FROM enquiry e
            LEFT JOIN customer c ON e.customer_id = c.id
            WHERE 1=1
        `;
        
        const countParams = params.slice(0, -2); // Remove limit and offset
        console.log("🧮 [DEBUG] Count query params:", countParams);

        if (userContext.company_code) countQuery += ` AND e.company_code = $1`;
        if (userContext.branch_code) countQuery += ` AND e.branch_code = $${userContext.company_code ? 2 : 1}`;
        if (userContext.department_code) countQuery += ` AND e.department_code = $${(userContext.company_code ? 1 : 0) + (userContext.branch_code ? 1 : 0) + 1}`;
        if (search) countQuery += ` AND (e.enquiry_no ILIKE $${countParams.length} OR e.customer_name ILIKE $${countParams.length} OR c.name ILIKE $${countParams.length})`;
        if (status) countQuery += ` AND e.status = $${countParams.length}`;

        console.log("🧮 [DEBUG] Count query:", countQuery);

        const countResult = await pool.query(countQuery, countParams);
        const totalRecords = parseInt(countResult.rows[0].count);
        console.log("📦 [DEBUG] Total records:", totalRecords);

        res.json({
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalRecords,
                pages: Math.ceil(totalRecords / limit)
            }
        });

    } catch (error) {
        console.error('❌ [ERROR] Fetching enquiries failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /enquiry/:code - Fetch single enquiry with line items and vendor cards
router.get('/:code', async (req, res) => {
    try {
       

        const { code } = req.params;

        // Get enquiry details
        const enquiryResult = await pool.query(
            'SELECT e.*, c.name as customer_display_name FROM enquiry e LEFT JOIN customer c ON e.customer_id = c.id WHERE e.code = $1',
            [code]
        );

        if (enquiryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        const enquiry = enquiryResult.rows[0];

        // Get line items
        const lineItemsResult = await pool.query(
            'SELECT * FROM enquiry_line_items WHERE enquiry_id = $1 ORDER BY s_no',
            [enquiry.id]
        );

        // Get vendor cards
        const vendorCardsResult = await pool.query(
            'SELECT * FROM enquiry_vendor_cards WHERE enquiry_id = $1 ORDER BY created_at',
            [enquiry.id]
        );

        res.json({
            ...enquiry,
            line_items: lineItemsResult.rows,
            vendor_cards: vendorCardsResult.rows
        });

    } catch (error) {
        console.error('Error fetching enquiry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /enquiry - Create new enquiry
router.post('/', async (req, res) => {
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
            service_type,
            status = 'Open',
            remarks,
            line_items = [],
            is_new_customer = false,
            code,
            name
        } = req.body;

        // Get user context
        const userResult = await pool.query(
            'SELECT company_code, branch_code, department_code, service_type_code FROM users WHERE username = $1',
            [name]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userContext = userResult.rows[0];

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            let finalCustomerId = customer_id;

            // If new customer, create customer record first
            if (is_new_customer && customer_name) {
                // Generate customer number using number series
                const customerNumberResult = await client.query(
                    `SELECT nr.prefix, nr.last_no_used as current_number, nr.increment_by
                     FROM number_relation nr 
                     WHERE nr.company_code = $1 AND nr.branch_code = $2 
                     AND nr.department_code = $3 AND nr.number_series = 'CUSTOMER'`,
                    [userContext.company_code, userContext.branch_code, userContext.department_code]
                );

                let customerNo;
                if (customerNumberResult.rows.length > 0) {
                    const numberSeries = customerNumberResult.rows[0];
                    const nextNumber = numberSeries.current_number + numberSeries.increment_by;
                    const paddedNumber = nextNumber.toString().padStart(6, '0'); // Use 6 digits as default
                    customerNo = (numberSeries.prefix || 'CUST') + paddedNumber;
                    
                    // Update the current number in number_relation
                    await client.query(
                        'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
                        [nextNumber, numberSeries.id]
                    );
                } else {
                    // Fallback to simple numbering if no number series found
                    const customerNoResult = await client.query(
                        `SELECT COALESCE(MAX(CAST(SUBSTRING(customer_no FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_no 
                         FROM customer WHERE customer_no ~ '^[0-9]+$'`
                    );
                    customerNo = customerNoResult.rows[0].next_no.toString().padStart(6, '0');
                }

                const customerResult = await client.query(
                    `INSERT INTO customer (customer_no, name, email, mobile, landline, 
                     company_code, branch_code, department_code, service_type_code)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
                    [customerNo, company_name || customer_name, email, mobile, landline,
                     userContext.company_code, userContext.branch_code, userContext.department_code, userContext.service_type_code]
                );
                
                finalCustomerId = customerResult.rows[0].id;
            }

            // Generate enquiry number and code using number series (matching tariff pattern)
            let enquiryNo, enquiryCode;
            let seriesCode;

            // Number series lookup (matching tariff pattern)
            if ((!code || code === '') && userContext.company_code) {
                let whereConditions = ['code_type = $1', 'company_code = $2'];
                let queryParams = ['enquiryNo', userContext.company_code];
                let paramIndex = 3;

                
                if (userContext.branch_code) {
                    whereConditions.push(`branch_code = $${paramIndex}`);
                    queryParams.push(userContext.branch_code);
                    paramIndex++;
                } else {
                    whereConditions.push('(branch_code IS NULL OR branch_code = \'\')');
                }

                if (userContext.department_code) {
                    whereConditions.push(`department_code = $${paramIndex}`);
                    queryParams.push(userContext.department_code);
                } else {
                    whereConditions.push('(department_code IS NULL OR department_code = \'\')');
                }

                const mappingQuery = `
                    SELECT mapping FROM mapping_relations
                    WHERE ${whereConditions.join(' AND ')}
                    ORDER BY id DESC
                    LIMIT 1
                `;

                const mappingRes = await client.query(mappingQuery, queryParams);
                console.log("Debug: Enquiry create method No series Mapping res", mappingRes,"for Query:", mappingQuery,"params:",queryParams);
                if (mappingRes.rows.length > 0) {
                    seriesCode = mappingRes.rows[0].mapping;
                }
            }

            // Generate enquiry code (matching tariff pattern)
            if (seriesCode) {
                const seriesResult = await client.query(
                    'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
                    [seriesCode]
                );

                if (seriesResult.rows.length === 0) {
                    await client.query('ROLLBACK');
                    client.release();
                    return res.status(400).json({ error: 'Number series not found' });
                }

                const series = seriesResult.rows[0];
                if (series.is_manual) {
                    if (!code || code.trim() === '') {
                        await client.query('ROLLBACK');
                        client.release();
                        return res.status(400).json({ error: 'Manual code entry required for this series' });
                    }
                    const exists = await client.query('SELECT 1 FROM enquiry WHERE code = $1', [code]);
                    if (exists.rows.length > 0) {
                        await client.query('ROLLBACK');
                        client.release();
                        return res.status(400).json({ error: 'Enquiry code already exists' });
                    }
                    enquiryCode = code;
                } else {
                    const relResult = await client.query(
                        'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE',
                        [seriesCode]
                    );

                    if (relResult.rows.length === 0) {
                        await client.query('ROLLBACK');
                        client.release();
                        return res.status(400).json({ error: 'Number series relation not found' });
                    }

                    const rel = relResult.rows[0];
                    let nextNo = rel.last_no_used === 0
                        ? Number(rel.starting_no)
                        : Number(rel.last_no_used) + Number(rel.increment_by);

                    enquiryCode = `${rel.prefix || ''}${nextNo}`;

                    await client.query(
                        'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
                        [nextNo, rel.id]
                    );
                }
            } else if (!code || code === '') {
                enquiryCode = 'ENQ-' + Date.now();
            } else {
                enquiryCode = code;
            }

            // Generate enquiry number (same as code for enquiries)
            enquiryNo = enquiryCode;
            console.log("Debug: create enquiry API enquiryNo generated no series",enquiryNo);

            // Check for duplicate enquiry number
            const duplicateCheck = await client.query(
                'SELECT id FROM enquiry WHERE enquiry_no = $1',
                [enquiryNo]
            );

            if (duplicateCheck.rows.length > 0) {
                throw new Error('Duplicate enquiry number generated. Please try again.');
            }

            // Create enquiry
            const enquiryResult = await client.query(
                `INSERT INTO enquiry (enquiry_no, code, date, customer_id, customer_name, email, mobile, landline,
                 company_name, contact_department, from_location, to_location, location_type_from, location_type_to, effective_date_from, effective_date_to, department,
                 service_type, status, remarks, company_code, branch_code, department_code, service_type_code)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) RETURNING id`,
                [enquiryNo, enquiryCode, date, finalCustomerId, customer_name, email, mobile, landline,
                 company_name, contact_department, from_location, to_location, location_type_from, location_type_to, effective_date_from, effective_date_to, department,
                 service_type, status, remarks, userContext.company_code, userContext.branch_code, userContext.department_code, userContext.service_type_code]
            );

            console.log("Debug: Create enquiry result",enquiryResult);

            const enquiryId = enquiryResult.rows[0].id;

            // Create line items
            for (let i = 0; i < line_items.length; i++) {
                const item = line_items[i];
                await client.query(
                    `INSERT INTO enquiry_line_items (enquiry_id, s_no, quantity, basis, remarks, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [enquiryId, i + 1, item.quantity, item.basis, item.remarks, item.status || 'Active']
                );
            }

            await client.query('COMMIT');

            // Log the creation
            await logMasterEvent({
                username: name,
                action: 'CREATE',
                masterType: 'Enquiry',
                recordId: enquiryCode,
                details: `New Enquiry "${enquiryCode}" has been created successfully.`
            });

            res.status(201).json({ 
                message: 'Enquiry created successfully', 
                id: enquiryId, 
                enquiry_no: enquiryNo,
                code: enquiryCode
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error creating enquiry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /enquiry/:code - Update enquiry
router.put('/:code', async (req, res) => {
    try {
       

        const { code: enquiryCode } = req.params;
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
            service_type,
            status,
            remarks,
            line_items = [],
            username = 'System'
        } = req.body;

        // First get the enquiry ID from the code
        const enquiryResult = await pool.query('SELECT id FROM enquiry WHERE code = $1', [enquiryCode]);
        if (enquiryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        const enquiryId = enquiryResult.rows[0].id;

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Update enquiry (note: we don't update the code as it's the identifier)
            await client.query(
                `UPDATE enquiry SET date = $1, customer_id = $2, customer_name = $3, email = $4,
                 mobile = $5, landline = $6, company_name = $7, contact_department = $8, from_location = $9, to_location = $10,
                 location_type_from = $11, location_type_to = $12, effective_date_from = $13, effective_date_to = $14, department = $15, service_type = $16, status = $17, remarks = $18
                 WHERE id = $19`,
                [date, customer_id, customer_name, email, mobile, landline, company_name, contact_department,
                 from_location, to_location, location_type_from, location_type_to, effective_date_from, effective_date_to, department, service_type, status, remarks, enquiryId]
            );

            // Delete existing line items
            await client.query('DELETE FROM enquiry_line_items WHERE enquiry_id = $1', [enquiryId]);

            // Create new line items
            for (let i = 0; i < line_items.length; i++) {
                const item = line_items[i];
                await client.query(
                    `INSERT INTO enquiry_line_items (enquiry_id, s_no, quantity, basis, remarks, status)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [enquiryId, i + 1, item.quantity, item.basis, item.remarks, item.status || 'Active']
                );
            }

            await client.query('COMMIT');

            // Log the update
            await logMasterEvent({
                username: username,
                action: 'UPDATE',
                masterType: 'Enquiry',
                recordId: enquiryCode,
                details: `Enquiry "${enquiryCode}" has been updated successfully.`
            });

            res.json({ message: 'Enquiry updated successfully' });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error updating enquiry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /enquiry/:code - Delete enquiry
router.delete('/:code', async (req, res) => {
    try {
       

        const { code } = req.params;

        // First get the enquiry ID from the code
        const enquiryResult = await pool.query('SELECT id FROM enquiry WHERE code = $1', [code]);
        if (enquiryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        const enquiryId = enquiryResult.rows[0].id;

        const result = await pool.query('DELETE FROM enquiry WHERE code = $1', [code]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        // Log the deletion
        await logMasterEvent({
            username: username,
            action: 'DELETE',
            masterType: 'Enquiry',
            recordId: code,
            details: `Enquiry "${code}" has been deleted successfully.`
        });

        res.json({ message: 'Enquiry deleted successfully' });

    } catch (error) {
        console.error('Error deleting enquiry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /enquiry/customers/dropdown - Get customers for dropdown
router.get('/customers/dropdown', async (req, res) => {
    try {
        const username = getUsernameFromToken(req) || 'system';

        const { search = '' } = req.query;
        console.log("🔍 Search query received:", search);

        // Get user context
        const userResult = await pool.query(
            'SELECT company_code, branch_code, department_code FROM users WHERE username = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            console.warn(`⚠️ No user found for username: ${username}`);
            return res.status(404).json({ error: 'User not found' });
        }

        const userContext = userResult.rows[0];
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
            return index === self.findIndex(c => {
                // Compare by display_name first (case-insensitive)
                if (c.display_name && customer.display_name) {
                    if (c.display_name.toLowerCase() === customer.display_name.toLowerCase()) {
                        return true;
                    }
                }
                
                // Also compare by company_name (case-insensitive) to catch duplicates
                if (c.company_name && customer.company_name) {
                    if (c.company_name.toLowerCase() === customer.company_name.toLowerCase()) {
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
            });
        });

        console.log(`🎯 Final unique customers: ${uniqueCustomers.length}`);

        res.json(uniqueCustomers);

    } catch (error) {
        console.error('❌ Error fetching customers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get customer details for auto-fill
router.get('/customers/:customerId/details', async (req, res) => {
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
            return res.status(404).json({ error: 'Customer not found' });
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
        console.error('Error fetching customer details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get customer contacts for dropdown
router.get('/customers/:customerId/contacts', async (req, res) => {
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
        console.error('Error fetching customer contacts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /enquiry/locations/dropdown - Get locations for dropdown
router.get('/locations/dropdown', async (req, res) => {
    try {
        const username = getUsernameFromToken(req) || 'system';

        const { search = '' } = req.query;

        // Get user context
        const userResult = await pool.query(
            'SELECT company_code, branch_code, department_code FROM users WHERE username = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userContext = userResult.rows[0];

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
        console.error('Error fetching locations dropdown:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get departments dropdown for enquiry
router.get('/departments/dropdown', async (req, res) => {
  try {
    const { search, company_code } = req.query;
    const userContext = getUsernameFromToken(req) || 'system';
    
    console.log("🏢 Departments dropdown request:", { search, company_code, userContext });

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
    console.error('❌ Error fetching departments dropdown:', err);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

router.post('/:code/sourcing', async (req, res) => {
    try {
       

        const { code } = req.params;
        const { department, from_location, to_location, effective_date_from, effective_date_to } = req.body;

        // Get sourcing options based on criteria
        // let query = `
        //     SELECT s.*, v.name as vendor_name, v.type as vendor_type
        //     FROM sourcing s
        //     LEFT JOIN vendor v ON s.vendor_code = v.code
        //     WHERE s.active = true
        // `;
        
        let query= `
            SELECT * FROM ( SELECT *, CASE
            WHEN period_end_date = NULL THEN 'Active'
            WHEN NOW() > period_end_date::DATE  THEN 'Expired'
            ELSE 'Active' END AS source_status
            FROM sourcing) WHERE source_status = 'Active'
        `;
        const params = [];
        let paramIndex = 1;

        if (department) {
            query += ` AND mode = $${paramIndex}`;
            params.push(department);
            paramIndex++;
        }
        
        if (from_location) {
            query += ` AND from_location = $${paramIndex}`;
            params.push(from_location);
            paramIndex++;
        }

        if (to_location) {
            query += ` AND to_location = $${paramIndex}`;
            params.push(to_location);
            paramIndex++;
        }

        // Date range check
        if (effective_date_from && effective_date_to) {
            query += ` AND (
                (period_start_date <= $${paramIndex} AND period_end_date >= $${paramIndex}) OR
                (effective_date <= $${paramIndex + 1} AND effective_date >= $${paramIndex})
            )`;
            params.push(effective_date_from, effective_date_to);
            paramIndex += 2;
        }

        // query += ` ORDER BY s.vendor_code, s.created_at DESC`;
        query += `ORDER BY code, id DESC`;
        console.log(`DEBUG: /code/sourcing query ${query}, Params ${params}`);
        const result = await pool.query(query, params);

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching sourcing options:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /enquiry/:code/tariff - Get tariff options for enquiry
router.post('/:code/tariff', async (req, res) => {
    try {
       

        const { code } = req.params;
        const { department, from_location, to_location, effective_date_from, effective_date_to } = req.body;

        // Get tariff options based on criteria
        let query = `
            SELECT t.*, v.name as vendor_name, v.type as vendor_type
            FROM tariff t
            LEFT JOIN vendor v ON t.vendor_code = v.code
            WHERE t.active = true
        `;
        
        const params = [];
        let paramIndex = 1;

        if (department) {
            query += ` AND t.mode = $${paramIndex}`;
            params.push(department);
            paramIndex++;
        }

        if (from_location) {
            query += ` AND t.from_location = $${paramIndex}`;
            params.push(from_location);
            paramIndex++;
        }

        if (to_location) {
            query += ` AND t.to_location = $${paramIndex}`;
            params.push(to_location);
            paramIndex++;
        }

        // Date range check
        if (effective_date_from && effective_date_to) {
            query += ` AND t.effective_date <= $${paramIndex} AND (t.expiry_date IS NULL OR t.expiry_date >= $${paramIndex})`;
            params.push(effective_date_to);
            paramIndex++;
        }

        query += ` ORDER BY t.vendor_code, t.mandatory DESC, t.created_at DESC`;

        const result = await pool.query(query, params);

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching tariff options:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /enquiry/:code/vendor-cards - Add vendor cards to enquiry
router.post('/:code/vendor-cards', async (req, res) => {
    try {
        const username = getUsernameFromToken(req); 
        if (!username){ 
            return res.status(401).json({ error: 'Unauthorized' }); }

        const { code } = req.params;
        const { vendorCards } = req.body;

        (typeof vendorCards === 'undefined') && (vendorCards = []);

        console.log("DEBUG: vendor cards list from post met:",vendorCards);

        // First get the enquiry ID from the code
        const enquiryResult = await pool.query('SELECT id FROM enquiry WHERE code = $1', [code]);
        if (enquiryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        const enquiryId = enquiryResult.rows[0].id;

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Clear existing vendor cards
            await client.query('DELETE FROM enquiry_vendor_cards WHERE enquiry_id = $1', [enquiryId]);

            // Add new vendor cards
            for (const card of vendorCards) {
                // Handle date fields - convert empty strings to null
                const effectiveDate = card.effective_date && card.effective_date.trim() !== '' ? card.effective_date : null;
                const expiryDate = card.expiry_date && card.expiry_date.trim() !== '' ? card.expiry_date : null;
                
                await client.query(
                    `INSERT INTO enquiry_vendor_cards (enquiry_id, vendor_name, vendor_type, is_active, charges, source_type, source_id, mode, from_location, to_location, basis, vendor_code, effective_date, expiry_date, currency, quantity, remarks)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                    [enquiryId, card.vendor_name, card.vendor_type, card.is_active || false, 
                     JSON.stringify(card.charges || []), card.source_type, card.source_id,
                     card.mode, card.from_location, card.to_location, card.basis, 
                     card.vendor_code, effectiveDate, expiryDate, card.currency, card.quantity, card.remarks]
                );
            }

            await client.query('COMMIT');

            // Log the update
            await logMasterEvent({
                username: username,
                action: 'UPDATE',
                masterType: 'Enquiry',
                recordId: code,
                details: `Enquiry "${code}" has been updated successfully.`
            });

            res.json({ message: 'Enquiry updated successfully' });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error updating vendor cards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /enquiry/:code/vendor-cards/:cardId/negotiate - Update negotiated charges
router.put('/:code/vendor-cards/:cardId/negotiate', async (req, res) => {
    try {
       

        const { cardId } = req.params;
        const { negotiated_charges } = req.body;

        await pool.query(
            'UPDATE enquiry_vendor_cards SET negotiated_charges = $1 WHERE id = $2',
            [JSON.stringify(negotiated_charges), cardId]
        );

        res.json({ message: 'Negotiated charges updated successfully' });

    } catch (error) {
        console.error('Error updating negotiated charges:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /enquiry/:code/confirm - Confirm enquiry and create booking
router.post('/:code/confirm', async (req, res) => {
    try {
       

        const { code } = req.params;

        // Get enquiry details with active vendor card
        const enquiryResult = await pool.query(`
            SELECT e.*, 
                   json_agg(eli.*) as line_items,
                   (SELECT row_to_json(evc.*) FROM enquiry_vendor_cards evc WHERE evc.enquiry_id = e.id AND evc.is_active = true LIMIT 1) as active_vendor
            FROM enquiry e
            LEFT JOIN enquiry_line_items eli ON e.id = eli.enquiry_id
            WHERE e.code = $1
            GROUP BY e.id
        `, [code]);

        if (enquiryResult.rows.length === 0) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }

        const enquiry = enquiryResult.rows[0];

        if (!enquiry.active_vendor) {
            return res.status(400).json({ error: 'No active vendor selected' });
        }

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Generate booking number
            const bookingNoResult = await client.query(
                `SELECT COALESCE(MAX(CAST(SUBSTRING(booking_no FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_no 
                 FROM booking WHERE booking_no ~ '^BKG[0-9]+$'`
            );
            const bookingNo = 'BKG' + bookingNoResult.rows[0].next_no.toString().padStart(6, '0');

            // Create booking
            await client.query(
                `INSERT INTO booking (booking_no, enquiry_id, customer_id, customer_name, mail_id, phone_no1, phone_no2,
                 company_name, from_location, to_location, effective_date_from, effective_date_to, department,
                 status, remarks, vendor_details, line_items, charges, company_code, branch_code, department_code, service_type_code)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
                [bookingNo, id, enquiry.customer_id, enquiry.customer_name, enquiry.mail_id, enquiry.phone_no1, enquiry.phone_no2,
                 enquiry.company_name, enquiry.from_location, enquiry.to_location, enquiry.effective_date_from, enquiry.effective_date_to,
                 enquiry.department, 'Confirmed', enquiry.remarks, JSON.stringify(enquiry.active_vendor), 
                 JSON.stringify(enquiry.line_items), JSON.stringify(enquiry.active_vendor.negotiated_charges || enquiry.active_vendor.charges),
                 enquiry.company_code, enquiry.branch_code, enquiry.department_code, enquiry.service_type_code]
            );

            // Update enquiry status to Confirmed
            await client.query('UPDATE enquiry SET status = $1 WHERE id = $2', ['Confirmed', id]);

            await client.query('COMMIT');

            res.json({ message: 'Enquiry confirmed and booking created successfully', booking_no: bookingNo });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error confirming enquiry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;