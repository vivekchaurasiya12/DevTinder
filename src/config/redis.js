
const { createClient } = require("redis");

const client = createClient({
  username: "default",
  password: "7kfiCcLJnpGuNSdLlXztefHjEA1UpMtu",
  socket: {
    host: "redis-13061.crce217.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 13061,
  },
});

client.on("error", (err) => console.log("❌ Redis Client Error:", err));

async function connectRedis() {
  await client.connect();
  console.log("✅ Connected to Redis Cloud");
}

connectRedis();

 module.exports = client;
