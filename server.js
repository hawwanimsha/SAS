var express = require("express");
var https = require("https");
var path = require("path");
var fs = require("fs");

var app = express();
var PORT = process.env.PORT || 3000;
var API_KEY = process.env.ANTHROPIC_API_KEY || "";

app.use(express.json({ limit: "20mb" }));

// Serve index.html from the SAME directory as server.js
var INDEX_PATH = path.join(__dirname, "index.html");

// Check file exists on startup
if (!fs.existsSync(INDEX_PATH)) {
  console.error("ERROR: index.html not found at " + INDEX_PATH);
  console.error("Files in directory:", fs.readdirSync(__dirname).join(", "));
} else {
  console.log("index.html found: OK (" + Math.round(fs.statSync(INDEX_PATH).size / 1024) + " KB)");
}

// Serve the main page
app.get("/", function (req, res) {
  res.sendFile(INDEX_PATH);
});

// Proxy to Anthropic API
app.post("/api/claude", function (req, res) {
  if (!API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set. Go to Railway > Variables and add it." });
  }
  var body = req.body;
  var payload = JSON.stringify({
    model: body.model || "claude-sonnet-4-20250514",
    max_tokens: body.max_tokens || 4000,
    system: body.system || "",
    messages: body.messages || []
  });
  var headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01"
  };
  if (body.use_pdf_beta) {
    headers["anthropic-beta"] = "pdfs-2024-09-25";
  }
  var options = {
    hostname: "api.anthropic.com",
    port: 443,
    path: "/v1/messages",
    method: "POST",
    headers: headers
  };
  var apiReq = https.request(options, function (apiRes) {
    var chunks = [];
    apiRes.on("data", function (c) { chunks.push(c); });
    apiRes.on("end", function () {
      res.status(apiRes.statusCode).set("Content-Type", "application/json").send(Buffer.concat(chunks).toString());
    });
  });
  apiReq.on("error", function (err) {
    res.status(500).json({ error: "Failed to reach Anthropic API: " + err.message });
  });
  apiReq.write(payload);
  apiReq.end();
});

// Health check
app.get("/api/health", function (req, res) {
  res.json({ status: "ok", hasKey: !!API_KEY, indexExists: fs.existsSync(INDEX_PATH) });
});

app.listen(PORT, function () {
  console.log("SAS Assessment System running on port " + PORT);
  console.log("API key configured: " + (API_KEY ? "YES" : "NO — set ANTHROPIC_API_KEY in Railway Variables"));
});
