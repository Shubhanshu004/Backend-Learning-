const joi = require('joi')

const createProdcutSchema = joi.object({
    name: joi.string().required(),
    price: joi.number().positive().required(),
    stock: joi.number().integer().min(0).default(0),
    category_id: joi.number().integer()
})

const updateProdcutSchema = joi.object({
    name: joi.string(),
    price: joi.number().positive(),
    stock: joi.number().integer().min(0),
    
})

const deleteProdcutSchema = joi.object({
    id: joi.number().required()
})

module.exports = {createProdcutSchema , updateProdcutSchema , deleteProdcutSchema}