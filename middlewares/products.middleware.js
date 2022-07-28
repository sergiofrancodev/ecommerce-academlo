// Models
const { Product } = require('../models/product.model');
const { ProductImg } = require('../models/productImg.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const productExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { productId } = req.body;

  const product = await Product.findOne({
    where: { id: productId || id, status: 'active' },
    include: { model: ProductImg }
  });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }

  req.product = product;
  next();
});

module.exports = { productExists };
