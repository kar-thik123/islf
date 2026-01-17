const pool = require('./db');
async function run() {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'booking'");
        res.rows.forEach(r => console.log('COL_B:' + r.column_name));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
