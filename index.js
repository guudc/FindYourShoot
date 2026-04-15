const http = require("http");
const { MongoClient } = require("mongodb");
const dotenv = require('dotenv')
dotenv.config()
// ── Config ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "waitlist_db";
const COLLECTION = "emails";

// ── Email validation ──────────────────────────────────────────────────────────
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim().toLowerCase());
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sendJSON(res, statusCode, payload) {
    const body = JSON.stringify(payload);
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => {
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch {
                reject(new Error("Invalid JSON body"));
            }
        });
        req.on("error", reject);
    });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log("✅  Connected to MongoDB");

    const db = client.db(DB_NAME);
    const col = db.collection(COLLECTION);

    // Unique index so the DB itself also enforces no duplicates
    await col.createIndex({ email: 1 }, { unique: true });

    const server = http.createServer(async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
        const { method, url } = req;

        // ── POST /waitlist  – submit an email ─────────────────────────────────────
        if (method === "POST" && url === "/waitlist") {
            let body;
            try {
                body = await readBody(req);
            } catch {
                return sendJSON(res, 400, { error: "Invalid JSON body." });
            }

            const email = (body.email || "").trim().toLowerCase();

            if (!email) {
                return sendJSON(res, 400, { error: "email is required." });
            }
            if (!isValidEmail(email)) {
                return sendJSON(res, 422, { error: "Invalid email address." });
            }

            try {
                await col.insertOne({ email, joinedAt: new Date() });
                return sendJSON(res, 201, { message: "You're on the waitlist!", email });
            } catch (err) {
                // MongoDB duplicate-key error code
                if (err.code === 11000) {
                    return sendJSON(res, 409, { error: "This email is already on the waitlist." });
                }
                console.error(err);
                return sendJSON(res, 500, { error: "Internal server error." });
            }
        }

        // ── GET /waitlist  – return all entries ───────────────────────────────────
        if (method === "GET" && url === "/waitlist") {
            try {
                const entries = await col
                    .find({}, { projection: { _id: 0, email: 1, joinedAt: 1 } })
                    .sort({ joinedAt: 1 })
                    .toArray();

                return sendJSON(res, 200, { count: entries.length, entries });
            } catch (err) {
                console.error(err);
                return sendJSON(res, 500, { error: "Internal server error." });
            }
        }

        // ── 404 fallback ──────────────────────────────────────────────────────────
        sendJSON(res, 404, { error: "Not found." });
    });

    server.listen(PORT, () => {
        console.log(`🚀  Server running on http://localhost:${PORT}`);
        console.log(`   POST /waitlist  – join the waitlist`);
        console.log(`   GET  /waitlist  – list all members`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
        console.log("\n🛑  Shutting down…");
        await client.close();
        server.close(() => process.exit(0));
    });
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});