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

// ✅ Endpoint to fetch all patients with their risk category
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

const getEGRFData = (patientId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT ValueNumber AS eGFR_value, EntryDate AS eGFR_date, "GFR Category" AS eGFR_category
            FROM labs
            WHERE Patient = ? 
            AND LOWER(Analyte) = 'ckd-epi'
            ORDER BY EntryDate DESC;  -- Get ALL values, not just the latest
        `;
        db.all(query, [patientId], (err, rows) => {  // Fetch all CKD-EPI values
            if (err) reject(err);
            resolve(rows || []); // Return empty array if no data found
        });
    });
};

const getSKreatininData = (patientId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT ValueNumber AS s_kreatinin_value, EntryDate AS s_kreatinin_date
            FROM labs
            WHERE Patient = ? 
            AND LOWER(Analyte) = 's_kreatinin'
            ORDER BY EntryDate DESC;  -- Get ALL values, not just the latest
        `;
        db.all(query, [patientId], (err, rows) => {  // Fetch all s_kreatinin values
            if (err) reject(err);
            resolve(rows || []);
        });
    });
};

const getUACRData = (patientId) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT ValueNumber AS uACR_value, EntryDate AS uACR_date
            FROM labs
            WHERE Patient = ? 
            AND LOWER(Analyte) = 'uacr'
            ORDER BY EntryDate DESC;  -- Get ALL values, not just the latest
        `;
        db.all(query, [patientId], (err, rows) => {  // Fetch all uACR values
            if (err) reject(err);
            resolve(rows || []); // Return empty array if no data found
        });
    });
};


// ✅ Endpoint to fetch patient details (by ID) including test results & reports
app.get('/patient/:id', async (req, res) => {
    const patientId = req.params.id;

    try {
        // Step 1: Fetch patient info
        const patientQuery = `
            SELECT p.patient, 
                CASE 
                    WHEN p.sex = 'M' THEN 'Male' 
                    WHEN p.sex = 'F' THEN 'Female' 
                    ELSE 'Other' 
                END AS sex,
                strftime('%Y', 'now') - strftime('%Y', p.DateOfBirth) - 
                (strftime('%m-%d', 'now') < strftime('%m-%d', p.DateOfBirth)) AS age,
                CKD.eGFR AS eGFR_result, 
                CKD.EntryDate_eGFR AS eGFR_date, 
                CKD."GFR Category" AS eGFR_category, 
                CKD.UACR AS uACR_result, 
                CKD.EntryDate_UACR AS uACR_date, 
                CKD."Albuminaria Category" AS uACR_category,
                t.Organs AS transplanted_organ,
                t.EntryDate AS transplantation_date,
                r.ReportId, r.ReportType, r.EntryDate AS report_date, r.Clinic
            FROM patients p 
            LEFT JOIN uACR_eGFR_latest CKD ON p.patient = CKD.patient
            LEFT JOIN transplantations t ON p.patient = t.patient
            LEFT JOIN reports r ON p.patient = r.patient
            WHERE p.patient = ?
        `;

        db.get(patientQuery, [patientId], async (err, row) => {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Patient not found' });
            }

            let patient = {
                patient_id: row.Patient,
                age: row.age,
                gender: row.sex,
                eGFR_results: [],
                uACR_results: [],
                transplanted_organ: row.transplanted_organ,
                transplantation_date: row.transplantation_date ? row.transplantation_date.toString() : null,
                reportId: row.ReportId,
                reportType: row.ReportType,
                report_date: row.report_date ? row.report_date.toString() : null,
                clinic: row.Clinic,
                recommendations: [] // 🆕 Store recommendations here
            };

            try {
                const eGFRData = await getEGRFData(patientId);
                const sKreatininData = await getSKreatininData(patientId);
                const uACRData = await getUACRData(patientId);

                eGFRData.forEach(data => {
                    patient.eGFR_results.push({
                        value: data.eGFR_value,
                        date: data.eGFR_date ? data.eGFR_date.toString() : null,
                        category: data.eGFR_category || "Unknown",
                        source: "Measured (CKD-EPI)"
                    });
                });

                // Compute eGFR using CKD-EPI formula if needed
                sKreatininData.forEach(data => {
                    let scr_micromol = data.s_kreatinin_value;
                    let scr = scr_micromol / 88.4;
                    let age = patient.age;
                    let gender = patient.gender;
                    let computed_eGFR = null;
                    let category = "Unknown";

                    if (gender === "Female") {
                        computed_eGFR = scr <= 0.7
                            ? 144 * Math.pow((scr / 0.7), -0.329) * Math.pow(0.993, age)
                            : 144 * Math.pow((scr / 0.7), -1.209) * Math.pow(0.993, age);
                    } else if (gender === "Male") {
                        computed_eGFR = scr <= 0.9
                            ? 141 * Math.pow((scr / 0.9), -0.411) * Math.pow(0.993, age)
                            : 141 * Math.pow((scr / 0.9), -1.209) * Math.pow(0.993, age);
                    }

                    if (computed_eGFR) {
                        computed_eGFR = parseFloat(computed_eGFR.toFixed(2));

                        if (computed_eGFR >= 90) {
                            category = "G1 (Normal)";
                        } else if (computed_eGFR >= 60) {
                            category = "G2 (Mildly Decreased)";
                        } else if (computed_eGFR >= 45) {
                            category = "G3a (Mild to Moderate)";
                        } else if (computed_eGFR >= 30) {
                            category = "G3b (Moderate to Severe)";
                        } else if (computed_eGFR >= 15) {
                            category = "G4 (Severely Decreased)";
                        } else {
                            category = "G5 (Kidney Failure)";
                        }

                        patient.eGFR_results.push({
                            value: computed_eGFR,
                            date: data.s_kreatinin_date ? data.s_kreatinin_date.toString() : null,
                            category: category,
                            source: "Computed (from s_kreatinin)"
                        });
                    }
                });

                // Sort eGFR results
                patient.eGFR_results.sort((a, b) => new Date(b.date) - new Date(a.date));

                uACRData.forEach(data => {
                    let uACR_value = data.uACR_value;
                    let category = "Unknown";

                    if (uACR_value < 3) {
                        category = "A1 (Normal to Mild)";
                    } else if (uACR_value >= 3 && uACR_value <= 30) {
                        category = "A2 (Moderate)";
                    } else if (uACR_value > 30) {
                        category = "A3 (Severe)";
                    }

                    patient.uACR_results.push({
                        value: uACR_value,
                        date: data.uACR_date ? data.uACR_date.toString() : null,
                        category: category,
                        source: "Measured (Lab)"
                    });
                });

                // Sort uACR results
                patient.uACR_results.sort((a, b) => new Date(b.date) - new Date(a.date));

                // 🛠 **Generate Recommendations**
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

                // Check if the latest eGFR test is missing or outdated
                if (patient.eGFR_results.length === 0) {
                    patient.recommendations.push("❗ eGFR test is missing. Consider ordering a new one.");
                } else {
                    const latestEGFR = new Date(patient.eGFR_results[0].date);
                    if (latestEGFR < oneYearAgo) {
                        patient.recommendations.push("⚠️ eGFR test is outdated (>1 year). Consider rechecking.");
                    }
                }

                // Check if the latest uACR test is missing or outdated
                if (patient.uACR_results.length === 0) {
                    patient.recommendations.push("❗ uACR test is missing. Consider ordering a new one.");
                } else {
                    const latestUACR = new Date(patient.uACR_results[0].date);
                    if (latestUACR < oneYearAgo) {
                        patient.recommendations.push("⚠️ uACR test is outdated (>1 year). Consider rechecking.");
                    }
                }

                console.log('Patient data:', patient);
                res.json(patient);
            } catch (error) {
                console.error('Error fetching additional data:', error);
                res.status(500).json({ error: 'Error fetching lab results' });
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected server error' });
    }
});


app.get('/alerts', (req, res) => {
    console.log('Fetching alerts...');
    const query = `
        WITH LatestResults AS (
        SELECT 
            p.patient, l.Analyte, l.ValueNumber, l.EntryDate, p.sex, 
            strftime('%Y', 'now') - strftime('%Y', p.DateOfBirth) - 
            (strftime('%m-%d', 'now') < strftime('%m-%d', p.DateOfBirth)) AS age
        FROM labs l
        LEFT JOIN patients p ON l.Patient = p.patient
        WHERE l.EntryDate >= datetime('now', '-3 day')  -- Last 3 days
        AND (LOWER(l.Analyte) = 'ckd-epi' OR LOWER(l.Analyte) = 'uacr')
    )
    SELECT DISTINCT patient, sex, age, Analyte, ValueNumber, EntryDate
    FROM LatestResults
    ORDER BY EntryDate DESC;
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const alerts = rows.map(row => {
            let riskLevel = "Low";
            let reason = "";

            let formattedValue = row.ValueNumber ? parseFloat(row.ValueNumber.toFixed(1)) : null; // ✅ Round to 1 decimal

            if (row.Analyte.toLowerCase() === "ckd-epi") {
                if (formattedValue <= 30) {
                    riskLevel = "Critical";
                    reason = `eGFR is very low`;
                } else if (formattedValue <= 60) {
                    riskLevel = "Moderate";
                    reason = `eGFR is decreased`;
                }
            }

            if (row.Analyte.toLowerCase() === "uacr") {
                if (formattedValue > 300) {
                    riskLevel = "Critical";
                    reason = `UACR is severely elevated`;
                } else if (formattedValue > 30) {
                    riskLevel = "Moderate";
                    reason = `UACR is moderately elevateds`;
                }
            }

            return {
                patient_id: row.patient,
                age: row.age,
                gender: row.sex === "M" ? "Male" : "Female",
                analyte: row.Analyte,
                value: formattedValue,  // ✅ Rounded ValueNumber
                entry_date: row.EntryDate,
                risk_level: riskLevel,
                reason: reason
            };
        }).filter(alert => alert.risk_level !== "Low"); // Exclude low-risk patients

        res.json(alerts);
    });
});




// ✅ Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});