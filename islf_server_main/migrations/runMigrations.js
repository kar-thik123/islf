/**
 * MIGRATION RUNNER
 * Executes SQL migration files in order
 */

const fs = require('fs');
const path = require('path');
const pool = require('../db');

const migrations = [
    '001_module_registry.sql',
    '002_audit_logs.sql',
    '003_audit_log_changes.sql',
    '004_system_logs.sql',
    '20260210_register_missing_modules.sql',
    '20260523_create_job_card_tables.sql',
    '20260523_add_booking_link_to_job_card.sql',
    '20260523_create_job_card_breakup_allocation.sql',
    '20260527_add_multi_booking_to_job_card.sql'
];

async function runMigrations() {
    console.log('Starting database migrations...\n');

    for (const migration of migrations) {
        const filePath = path.join(__dirname, migration);

        try {
            console.log(`Running migration: ${migration}`);

            // Read SQL file
            const sql = fs.readFileSync(filePath, 'utf8');

            // Execute SQL
            await pool.query(sql);

            console.log(`✓ ${migration} completed successfully\n`);
        } catch (error) {
            console.error(`✗ Error running ${migration}:`);
            console.error(error.message);
            console.error('\nMigration failed. Please fix the error and try again.\n');
            process.exit(1);
        }
    }

    console.log('All migrations completed successfully!');
    process.exit(0);
}

// Run migrations
runMigrations().catch(error => {
    console.error('Migration runner error:', error);
    process.exit(1);
});
