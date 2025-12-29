const pool = require('./db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding remarks column to enquiry_vendor_cards...');
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='enquiry_vendor_cards' AND column_name='remarks') THEN 
          ALTER TABLE enquiry_vendor_cards ADD COLUMN remarks TEXT; 
        END IF; 
      END $$;
    `);
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
