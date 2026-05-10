require('dotenv').config();
const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

client.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
  try {
    await client.connect();
    console.log('✓ Redis connected');
  } catch (err) {
    console.error('Redis connection error:', err);
  }
})();

module.exports = client;
