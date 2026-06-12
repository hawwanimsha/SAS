const express = require("express");
const https = require("https");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY || "";

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Proxy endpoint — forwards requests to Anthropic API
app.post("/api/claude", function (req, res) {
  if (!API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not set on server." });
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
      var responseBody = Buffer.concat(chunks).toString();
      res.status(apiRes.statusCode).set("Content-Type", "application/json").send(responseBody);
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
  res.json({ status: "ok", hasKey: !!API_KEY });
});

// Fallback — serve index.html for any non-API route
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, function () {
  console.log("SAS Assessment System running on port " + PORT);
  console.log("API key configured: " + (API_KEY ? "YES" : "NO — set ANTHROPIC_API_KEY env variable"));
});
