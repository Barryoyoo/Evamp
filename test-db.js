const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
    const url = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME || 'evamp';
    
    console.log(`Attempting to connect to: ${url.split('@')[1]}...`);
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        console.log("✅ SUCCESS: Connected to MongoDB Atlas Cluster.");
        
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        console.log(`✅ SUCCESS: Accessed database '${dbName}'.`);
        console.log(`Found ${collections.length} collections:`, collections.map(c => c.name).join(', '));
        
        // Check for admin user
        const admin = await db.collection('users').findOne({ username: 'admin' });
        if (admin) {
            console.log("✅ SUCCESS: Admin user found in database.");
        } else {
            console.log("⚠️ WARNING: Admin user not found. (System needs initialization)");
        }
        
    } catch (err) {
        console.error("❌ FAILURE: Could not connect to Cluster.");
        console.error("Error Detail:", err.message);
        if (err.message.includes('getaddrinfo')) {
            console.log("👉 Diagnostic: This is a DNS issue. Your computer cannot find the cluster address.");
        } else if (err.message.includes('whitelist')) {
            console.log("👉 Diagnostic: Your IP is not whitelisted in Atlas.");
        }
    } finally {
        await client.close();
    }
}

testConnection();
