const http = require('http');
const https = require('https');

const PORT = 3000;
const API_BASE = 'https://rt.data.gov.hk/v1/transport/citybus-nwfb';

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Parse the path after /api/
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname.replace(/^\/api/, '');

    const targetUrl = `${API_BASE}${path}`;

    console.log(`[${new Date().toISOString()}] ${targetUrl}`);

    https.get(targetUrl, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.code === 422) {
                    res.writeHead(422);
                    res.end(JSON.stringify({ error: 'Invalid parameters', detail: parsed.message }));
                } else {
                    res.writeHead(200);
                    res.end(JSON.stringify(parsed));
                }
            } catch (e) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Parse error', detail: e.message }));
            }
        });
    }).on('error', (e) => {
        console.error('API Error:', e.message);
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Failed to fetch from upstream API', detail: e.message }));
    });
});

server.listen(PORT, () => {
    console.log(`\n🚌 B3A Bus ETA Proxy Server running at http://localhost:${PORT}`);
    console.log(`   API proxy: http://localhost:${PORT}/api/`);
    console.log(`   Open:      http://localhost:${PORT}/index.html\n`);
});
