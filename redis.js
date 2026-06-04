const redis = require('redis')

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379
})

client.on('error', (err) => {
  console.log('Redis error:', err.message)
})

client.on('connect', () => {
  console.log('Redis connected!')
})

module.exports = client