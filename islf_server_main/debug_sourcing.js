const pool = require('./db');
const fs = require('fs');

async function debug() {
    try {
        const res = await pool.query("SELECT code, name FROM service_types WHERE code ILIKE 'lcl001'");
        log("Service Type 'lcl001' => " + JSON.stringify(res.rows));

    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

function log(msg) {
    try {
        fs.appendFileSync('debug_result.txt', msg + '\n');
    } catch (e) { console.error("Log error", e); }
}

fs.writeFileSync('debug_result.txt', '');
debug();
