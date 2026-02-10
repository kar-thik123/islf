const express = require('express');
const pool = require('../db');
const router = express.Router();
const { getUsernameFromToken } = require('../utils/context-helper');

async function findMappingByContext(code_type, company_code, branch_code, department_code, service_type_code) {
    try {
        const configResult = await pool.query(
            "SELECT value FROM settings WHERE key = $1",
            [`validation_${code_type.toLowerCase().replace('code', '')}_filter`]
        );

        const filter = configResult.rows[0]?.value || '';
        let whereClauses = ['code_type = $1'];
        let params = [code_type];
        let idx = 2;

        if (filter.includes('C') && company_code) {
            whereClauses.push(`(company_code = $${idx} OR company_code IS NULL)`);
            params.push(company_code);
            idx++;
        }

        if (filter.includes('B') && branch_code) {
            whereClauses.push(`(branch_code = $${idx} OR branch_code IS NULL)`);
            params.push(branch_code);
            idx++;
        }

        if (filter.includes('D') && department_code) {
            whereClauses.push(`(department_code = $${idx} OR department_code IS NULL)`);
            params.push(department_code);
            idx++;
        }

        if (filter.includes('ST') && service_type_code) {
            whereClauses.push(`(service_type_code = $${idx} OR service_type_code IS NULL)`);
            params.push(service_type_code);
            idx++;
        }

        const query = `
      SELECT mapping FROM mapping_relations 
      WHERE ${whereClauses.join(' AND ')}
      ORDER BY 
        CASE WHEN company_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN branch_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN department_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        CASE WHEN service_type_code IS NOT NULL THEN 1 ELSE 0 END DESC,
        id DESC
      LIMIT 1`;

        const result = await pool.query(query, params);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (err) {
        console.error('Error finding mapping by context:', err);
        return null;
    }
}

// GET all airlines
router.get('/', async (req, res) => {
    try {
        const { company_code, branch_code, department_code, service_type_code } = req.query;
        let query = `SELECT * FROM master_airline WHERE 1=1`;
        const params = [];
        let paramIndex = 1;

        if (company_code) {
            query += ` AND (company_code = $${paramIndex} OR company_code IS NULL)`;
            params.push(company_code);
            paramIndex++;
        }
        if (branch_code) {
            query += ` AND (branch_code = $${paramIndex} OR branch_code IS NULL)`;
            params.push(branch_code);
            paramIndex++;
        }

        query += ` ORDER BY id ASC`;
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching airlines:', err);
        res.status(500).json({ error: 'Failed to fetch airlines' });
    }
});

// CREATE new airline
router.post('/', async (req, res) => {
    let { seriesCode, code, airline_name, airline_no, active, company_code, branch_code, department_code, Service_type_code } = req.body;

    try {
        if (!seriesCode) {
            const mapping = await findMappingByContext('AIRLINE_MASTER', company_code, branch_code, department_code, Service_type_code);
            if (mapping) seriesCode = mapping.mapping;
        }

        if (seriesCode) {
            const seriesResult = await pool.query('SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1', [seriesCode]);
            if (seriesResult.rows.length > 0) {
                const series = seriesResult.rows[0];
                if (series.is_manual) {
                    if (!code || (typeof code === 'string' && code.trim() === '') || code === 'AUTO') {
                        return res.status(400).json({ error: 'Manual code entry required for this series' });
                    }
                    const exists = await pool.query('SELECT 1 FROM master_airline WHERE code = $1', [code]);
                    if (exists.rows.length > 0) {
                        return res.status(400).json({ error: 'Airline code already exists' });
                    }
                } else {
                    const client = await pool.connect();
                    try {
                        await client.query('BEGIN');
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
                        let nextNo = rel.last_no_used === 0 ? Number(rel.starting_no) : Number(rel.last_no_used) + Number(rel.increment_by);
                        code = `${rel.prefix || ''}${nextNo}`;
                        await client.query('UPDATE number_relation SET last_no_used = $1 WHERE id = $2', [nextNo, rel.id]);
                        await client.query('COMMIT');
                        client.release();
                    } catch (error) {
                        await client.query('ROLLBACK');
                        client.release();
                        throw error;
                    }
                }
            } else if (!code || code === 'AUTO') {
                code = 'AIR-' + Date.now();
            }
        } else if (!code || code === 'AUTO') {
            code = 'AIR-' + Date.now();
        }

        const created_by = getUsernameFromToken(req);
        const result = await pool.query(
            `INSERT INTO master_airline (code, airline_name, airline_no, active, company_code, branch_code, department_code, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [code, airline_name, airline_no, active, company_code, branch_code, department_code, created_by]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating airline:', err);
        res.status(500).json({ error: 'Failed to create airline' });
    }
});

// UPDATE airline
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { airline_name, airline_no, active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE master_airline SET airline_name = $1, airline_no = $2, active = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
            [airline_name, airline_no, active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Airline not found' });

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating airline:', err);
        res.status(500).json({ error: 'Failed to update airline' });
    }
});

// DELETE airline
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
        const result = await pool.query('DELETE FROM master_airline WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Airline not found' });

        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting airline:', err);
        res.status(500).json({ error: 'Failed to delete airline' });
    }
});

module.exports = router;
