const dns = require('dns');

console.log("Checking DNS for MongoDB SRV record...");

dns.resolveSrv('_mongodb._tcp.cluster0.s3dt9ni.mongodb.net', (err, addresses) => {
  if (err) {
    console.error("❌ DNS ERROR: Your network is blocking MongoDB SRV records.");
    console.error("Error Code:", err.code);
    console.log("\n👉 DIAGNOSIS: Your ISP or router is preventing the '+srv' connection format.");
    console.log("👉 SOLUTION: You MUST use the 'Standard Connection String' (the long one starting with 'mongodb://') from your Atlas dashboard.");
  } else {
    console.log("✅ DNS SUCCESS: Found addresses:", addresses);
    console.log("\n👉 DIAGNOSIS: DNS is working. If you still can't connect, check your password or IP Whitelist (0.0.0.0/0) in Atlas.");
  }
});
