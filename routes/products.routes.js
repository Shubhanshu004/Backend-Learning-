const express = require('express')
const router = express.Router()

const productController = require('../controllers/products')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')
const validate = require('../middleware/validator')
const {createProdcutSchema , updateProdcutSchema , deleteProdcutSchema} = require('../validators/products.validator')

router.get('/',  productController.getallProducts)
router.get('/:id', productController.getproductbyid)
router.post('/',authenticate, authorize('admin'), validate(createProdcutSchema), productController.createProduct)
router.patch('/:id',authenticate, authorize('admin'), validate(updateProdcutSchema), productController.updateProduct)
router.delete('/:id',authenticate, authorize('admin'), validate(deleteProdcutSchema), productController.deleteProduct)

module.exports = router