// Models
const { ProductInCart } = require('../models/productInCart.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const productInCartExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const productInCart = await ProductInCart.findOne({
    where: { id, status: 'active' },
  });

  if (!productInCart) {
    return next(new AppError('ProductInCart not found', 404));
  }

  req.productInCart = productInCart;
  next();
});

module.exports = { productInCartExists };
