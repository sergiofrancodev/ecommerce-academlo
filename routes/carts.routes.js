const express = require('express');

// Controllers
const {
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
  getUserCart,
} = require('../controllers/carts.controller');

// Middlewares
const { cartExists } = require('../middlewares/carts.middleware');
const { productExists } = require('../middlewares/products.middleware');

const { protectSession } = require('../middlewares/auth.middleware');

const cartsRouter = express.Router();

cartsRouter.use(protectSession);
cartsRouter.get('/', getUserCart)
cartsRouter.post('/add-product', addProductToCart);
cartsRouter.patch('/update-cart', cartExists, productExists, updateProductInCart);
cartsRouter.delete('/:productId', cartExists, removeProductFromCart);
cartsRouter.post('/purchase', purchaseCart);

module.exports = { cartsRouter };
