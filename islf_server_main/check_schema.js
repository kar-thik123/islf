const pool = require('./db');
async function run() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'booking'");
        console.log('Booking Table Columns:');
        console.log(JSON.stringify(res.rows, null, 2));

        const res2 = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'booking_line_items'");
        console.log('Booking Line Items Table Columns:');
        console.log(JSON.stringify(res2.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
