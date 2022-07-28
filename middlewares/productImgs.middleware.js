// Models
const { ProductImg } = require('../models/productImg.model');

// Utils
const { AppError } = require('../utils/appError.util');
const { catchAsync } = require('../utils/catchAsync.util');

const productImgExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const productImg = await ProductImg.findOne({
    where: { id, status: 'active' },
  });

  if (!productImg) {
    return next(new AppError('ProductImg not found', 404));
  }

  req.productImg = productImg;
  next();
});

module.exports = { productImgExists };
