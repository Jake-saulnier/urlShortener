const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3000;

const {Pool} = require('pg');
const pool = new Pool({
    user:       process.env.DB_USERNAME,
    host:       process.env.DB_HOST,
    database:   process.env.DB_NAME,
    password:   process.env.DB_PASSWORD,
    port:       process.env.DB_PORT,
});


pool.query('SELECT NOW()', (error, result) => {
    if (error) {
        console.error('Database connection failed:', error);
    } else {
        console.log('Database connected:', result.rows[0]);
    }
});

app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok" 
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/api/urls", (req, res) => {
    const originalUrl = req.body && req.body.url;
    const name = req.body && req.body.name;

    if (!originalUrl) {
        console.log("Missing 'url' in request body");
        return res.status(400).json({ error: "Missing 'url' in request body" });
    }
    if (!name) {
        console.log("Missing 'name' in request body");
        return res.status(400).json({ error: "Missing 'name' in request body" });
    }

    try {
        const parsed = new URL(originalUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            console.log('URL must use http or https protocol');
            return res.status(400).json({ error: 'URL must use http or https protocol' });
        }
    } catch (err) {
        console.log('Invalid URL');
        return res.status(400).json({ error: 'Invalid URL' });
    }

    const shortCode = Math.random()
        .toString(36)
        .substring(2, 8);

 /* no longer useful since we are using a database to store the short codes  
    while (urls.has(shortCode)) {
        shortCode = Math.random()
            .toString(36)
            .substring(2, 8);  
    }
*/

    const query = 'INSERT INTO urls (short_code, url, name) VALUES ($1, $2, $3)';
    const values = [shortCode, originalUrl, name];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting URL:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

    res.json({
        shortCode: shortCode,
        name: name
    })
});

app.get("/:shortCode", (req, res) => {
    const shortCode = req.params.shortCode;

    const query = 'SELECT url FROM urls WHERE short_code = $1';
    const values = [shortCode];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting URL:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        const originalUrl = result.rows[0]?.url;

        if (!originalUrl) {
            return res.status(404).send({ error: "URL not found" });
        }
        res.redirect(originalUrl);
    });    
});