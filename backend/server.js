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

app.post("api/urls", (req, res) => {
    const originalUrl = req.body.url;

    const shortCode = Math.random().toString(36).substring(2, 8);
    urls.set(shortCode, originalUrl);

    res.json({
        shortCode: shortCode,
    });
});