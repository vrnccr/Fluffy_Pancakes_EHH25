// Express server to handle API requests
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database('CKD_train_unlocked.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

app.get('/patients', (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Default to page 1
    const limit = parseInt(req.query.limit) || 50;  // Default to 50 patients per page
    const offset = (page - 1) * limit;  // Calculate offset for pagination

    const query = `
        SELECT p.patient, 
            CASE 
                WHEN p.sex = 'M' THEN 'Man' 
                WHEN p.sex = 'F' THEN 'Female' 
                ELSE 'Other' 
            END AS sex,
            strftime('%Y', 'now') - strftime('%Y', p.DateOfBirth) - 
            (strftime('%m-%d', 'now') < strftime('%m-%d', p.DateOfBirth)) AS age,
            r.eGFR, 
            r.uACR,
            -- Assign CKD risk category based on eGFR and uACR values
            CASE 
                WHEN r.eGFR >= 90 AND r.uACR < 30 THEN 'Low Risk (G1-A1)'
                WHEN r.eGFR >= 90 AND r.uACR BETWEEN 30 AND 300 THEN 'Moderate Risk (G1-A2)'
                WHEN r.eGFR >= 90 AND r.uACR > 300 THEN 'High Risk (G1-A3)'
                WHEN r.eGFR BETWEEN 60 AND 89 AND r.uACR < 30 THEN 'Low Risk (G2-A1)'
                WHEN r.eGFR BETWEEN 60 AND 89 AND r.uACR BETWEEN 30 AND 300 THEN 'Moderate Risk (G2-A2)'
                WHEN r.eGFR BETWEEN 60 AND 89 AND r.uACR > 300 THEN 'High Risk (G2-A3)'
                ELSE 'Unknown Risk'
            END AS risk_category
        FROM patients p 
        LEFT JOIN uACR_eGFR_latest r ON p.patient = r.patient
        LIMIT ? OFFSET ?;
    `;

    db.all(query, [limit, offset], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ patients: rows, currentPage: page, limit: limit });
    });
});


// ✅ Endpoint to fetch patient details (by ID) including test results & reports
app.get('/patient/:id', (req, res) => {
    const patientId = req.params.id;

    const query = `
        SELECT p.id, p.age, p.gender, 
               e_eGFR.value AS eGFR_result, e_eGFR.test_date AS eGFR_date, e_eGFR.category AS eGFR_category,
               e_uACR.value AS uACR_result, e_uACR.test_date AS uACR_date, e_uACR.category AS uACR_category,
               t.organs AS transplanted_organ, t.entryDate AS transplantation_date,
               r.reportId, r.reportType, r.entryDate AS report_date, r.clinic
        FROM patients p 
        LEFT JOIN eGFR_uACR_results e_eGFR ON p.id = e_eGFR.patient_id AND e_eGFR.test_type = 'eGFR'
        LEFT JOIN eGFR_uACR_results e_uACR ON p.id = e_uACR.patient_id AND e_uACR.test_type = 'uACR'
        LEFT JOIN transplantations t ON p.id = t.patient_id
        LEFT JOIN reports r ON p.id = r.patient
        WHERE p.id = ?
    `;

    db.get(query, [patientId], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json({
            patient_id: row.id,
            age: row.age,
            gender: row.gender,
            eGFR_result: row.eGFR_result,
            eGFR_category: row.eGFR_category,
            eGFR_date: row.eGFR_date,
            uACR_result: row.uACR_result,
            uACR_category: row.uACR_category,
            uACR_date: row.uACR_date,
            transplanted_organ: row.transplanted_organ,
            transplantation_date: row.transplantation_date,
            reportId: row.reportId,
            reportType: row.reportType,
            report_date: row.report_date,
            clinic: row.clinic
        });
    });
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
