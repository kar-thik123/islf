const pool = require('./db');

async function investigate() {
    try {
        console.log("=== STEP 3: ANALYSE BOOKING BKG000081 ===");
        const bkgRes = await pool.query(`SELECT * FROM booking WHERE booking_no = 'BKG000081'`);
        const bkg = bkgRes.rows[0];
        console.log("Booking:", JSON.stringify(bkg, null, 2));
        
        if (bkg) {
            const bkgDetailsRes = await pool.query(`SELECT * FROM booking_breakup WHERE booking_id = $1`, [bkg.id]);
            console.log("Booking Breakups:", JSON.stringify(bkgDetailsRes.rows, null, 2));

            const containersRes = await pool.query(`SELECT * FROM booking_container_breakup WHERE booking_id = $1`, [bkg.id]);
            console.log("Containers:", JSON.stringify(containersRes.rows, null, 2));

            const quoteMappingsRes = await pool.query(`SELECT * FROM booking_quote_mapping WHERE booking_id = $1`, [bkg.id]);
            console.log("Quote Mappings:", JSON.stringify(quoteMappingsRes.rows, null, 2));
        }

        console.log("\n=== STEP 4: ANALYSE ENQ_21 ===");
        const enq21Res = await pool.query(`SELECT * FROM enquiry WHERE code = 'Enq_21'`);
        const enq21 = enq21Res.rows[0];
        console.log("Enq_21:", JSON.stringify(enq21, null, 2));

        if (enq21) {
            const enq21Items = await pool.query(`SELECT * FROM enquiry_line_items WHERE enquiry_id = $1`, [enq21.id]);
            console.log("Enq_21 Line Items:", JSON.stringify(enq21Items.rows, null, 2));
        }

        console.log("\n=== STEP 5: ANALYSE ENQ_22 ===");
        const enq22Res = await pool.query(`SELECT * FROM enquiry WHERE code = 'Enq_22'`);
        const enq22 = enq22Res.rows[0];
        console.log("Enq_22:", JSON.stringify(enq22, null, 2));

        if (enq22) {
            const enq22Items = await pool.query(`SELECT * FROM enquiry_line_items WHERE enquiry_id = $1`, [enq22.id]);
            console.log("Enq_22 Line Items:", JSON.stringify(enq22Items.rows, null, 2));
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        pool.end();
    }
}

investigate();
