const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config();

async function initDb() {
    const url = process.env.MONGO_URL;
    const dbName = process.env.DB_NAME || 'evamp';
    const password = process.env.INITIAL_PASSWORD || 'vampire2024';

    console.log("Initializing database...");
    const client = new MongoClient(url);
    
    try {
        await client.connect();
        const db = client.db(dbName);
        
        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        await db.collection('users').updateOne(
            { username: 'admin' },
            { $set: { username: 'admin', password: hashedPassword } },
            { upsert: true }
        );
        
        // Create a dummy setting to ensure collections exist
        await db.collection('settings').updateOne(
            { key: 'theme' },
            { $set: { value: 'dark' } },
            { upsert: true }
        );

        console.log(`✅ SUCCESS: Database '${dbName}' initialized with admin user.`);
        console.log("👉 You should see it in Atlas/Compass now! Refresh your view.");
        
    } catch (err) {
        console.error("❌ ERROR:", err.message);
    } finally {
        await client.close();
    }
}

initDb();
