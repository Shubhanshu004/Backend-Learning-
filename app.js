const express = require('express')
const app = express()
const productRoutes = require('./routes/products.routes')
const authRoutes = require('./routes/auth.routes')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const cors = require('cors')
const helmet = require('helmet')

//middleware
app.use(express.json())

app.use(morgan('dev'))

//rate limiter 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000 , //15 minutes
  max: 100 ,   // mac 100 requests per 15 minuts 
  message: {error: 'Too many requests , please try again later'}
})
app.use(limiter)

//security 
app.use(cors({
  origin: 'http://localhost:3000',
  methods:['GET' , 'POST' , 'PATCH' , 'DELETE'] ,
  allowedHeaders: ['Content-Type' , 'Authorization']
}))

app.use(helmet()) 

//routes 

app.use('/products', productRoutes)
app.use('/auth', authRoutes)


// catches any route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` })
})

// catches ALL unexpected errors
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.message)
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong'
  })
})



module.exports = app