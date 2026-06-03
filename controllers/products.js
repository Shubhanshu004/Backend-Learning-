const pool = require('../Database/db')
const redisClient = require('../redis')


const getallProducts = (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const offset = (page - 1) * limit

  const cacheKey = `products:page:${page}:limit:${limit}`

  redisClient.get(cacheKey, async (err, cachedData) => {
    try {
      if (cachedData) {
        console.log('Cache hit! ')
        return res.status(200).json(JSON.parse(cachedData))
      }

      console.log('Cache miss — hitting database')

      const result = await pool.query(`
        SELECT products.id, products.name, products.price, 
               products.stock, categories.name AS category
        FROM products
        LEFT JOIN categories ON products.category_id = categories.id
        LIMIT $1 OFFSET $2
      `, [limit, offset])

      const total = await pool.query('SELECT COUNT(*) FROM products')

      const data = {
        page,
        limit,
        total: parseInt(total.rows[0].count),
        products: result.rows
      }

      redisClient.setex(cacheKey, 60, JSON.stringify(data))
      res.status(200).json(data)

    } catch (error) {
      res.status(500).json({ error: 'Something went wrong' })
    }
  })
}

const getproductbyid = async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const result = await pool.query(`
      SELECT products.id, products.name, products.price,products.stock, categories.name AS category FROM products LEFT JOIN categories ON products.category_id = categories.id
      WHERE products.id = $1
    `, [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const createProduct = async (req, res) => {
  try {
    const { name, price, stock , category_id} = req.body
    const result = await pool.query( 'INSERT INTO products (name, price, stock, category_id) VALUES ($1, $2, $3, $4) RETURNING *', [name, price, stock || 0, category_id || null]
    )
//clear all products cache
console.log('Clearning cache......')
  redisClient.keys('products:*' , (err , keys) => {
    if(keys.length > 0){
      redisClient.del(keys)
      console.log('Cache cleared!')
    }
  })

    res.status(201).json({ message: 'product created', product: result.rows[0] })
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const updateProduct = async( req , res) => {
  try{
    const id = parseInt(req.params.id)
    const{name , price , stock}  = req.body
    const result = await pool.query(
      'UPDATE products SET name = $1 , price = $2 , stock = $3 WHERE id = $4 RETURNING *',
      [name , price , stock || 0 , id]
    )
    if(result.rows.length === 0){
      return res.status(404).json({error: 'Product not found'})
    }
    res.status(200).json({message: 'product updated'})
  }catch(error){
    res.status(500).json({ error: 'Something went wrong' })
  }
}

const deleteProduct = async( req , res) => {
  try{
    const id = parseInt(req.params.id)
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    )
    if(result.rows.length === 0){
      return res.status(404).json({error: 'Product not found'})
    }
    res.status(204).json({message: 'product deleted'})
  }catch(error){
    res.status(500).json({ error: 'Something went wrong' })
  }
}


module.exports = { getallProducts, getproductbyid, createProduct , updateProduct , deleteProduct }