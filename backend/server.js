const express = require('express');
const app = express();
app.use(express.json());
const PORT = 3000;
const urls = new Map();

app.get("/api/health", (req, res) => {
    res.json({ 
        status: "ok" 
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post("/api/urls", (req, res) => {
    const originalUrl = req.body && req.body.url;

    if (!originalUrl) {
        return res.status(400).json({ error: "Missing 'url' in request body" });
        console.log("Missing 'url' in request body");
    }

    try {
        const parsed = new URL(originalUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return res.status(400).json({ error: 'URL must use http or https protocol' });
            console.log('URL must use http or https protocol');
        }
    } catch (err) {
        return res.status(400).json({ error: 'Invalid URL' });
        console.log('Invalid URL');
    }

    const shortCode = Math.random()
        .toString(36)
        .substring(2, 8);

    while (urls.has(shortCode)) {
        shortCode = Math.random()
            .toString(36)
            .substring(2, 8);  
    }

    urls.set(shortCode, originalUrl);

    res.json({
        shortCode: shortCode,
    });
});

app.get("/:shortCode", (req, res) => {
    const shortCode = req.params.shortCode;
    const originalUrl = urls.get(shortCode);

    if (!originalUrl) {
        return res.status(404).send({ error: "URL not found" });
    }

    res.redirect(originalUrl);
});