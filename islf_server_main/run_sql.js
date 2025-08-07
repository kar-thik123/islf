const fs = require('fs');
const pool = require('./db');

async function runSQL() {
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./schema/add_mapping_relations_table.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await pool.query(statement);
      }
    }
    
    console.log('SQL script executed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error executing SQL script:', error);
    process.exit(1);
  }
}

runSQL();
