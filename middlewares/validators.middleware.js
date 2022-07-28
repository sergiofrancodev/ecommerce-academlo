const { body, validationResult } = require('express-validator');

const { AppError } = require('../utils/appError.util');

const checkResult = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Array has errors
    const errorMsgs = errors.array().map((err) => err.msg);

    const message = errorMsgs.join('. ');

    return next(new AppError(message, 400));
  }

  next();
};

const createUserValidators = [
  body('username')
    .notEmpty()
    .withMessage('Username cannot be empty')
    .isString()
    .withMessage('Username is not a string'),
  body('email').isEmail().withMessage('Must provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .isAlphanumeric()
    .withMessage('Password must contain letters and numbers'),
  body('role')
    .notEmpty()
    .withMessage('Role cannot be empty')
    .isString()
    .withMessage('Role is not a string'),
  checkResult,
];

const createOrderValidators = [
  body('userId')
    .notEmpty()
    .withMessage('userId cannot be empty')
    .isNumeric()
    .withMessage('userId is not a number'),
  body('cartId')
    .notEmpty()
    .withMessage('cartId cannot be empty')
    .isNumeric()
    .withMessage('cartId is not a number'),
  body('totalPrice')
    .notEmpty()
    .withMessage('totalPrice cannot be empty')
    .isNumeric()
    .withMessage('totalPrice is not a number'),
  checkResult,
];

const createProductValidators = [
  body('title')
    .notEmpty()
    .withMessage('title cannot be empty')
    .isString()
    .withMessage('title is not a string'),
  body('description')
    .notEmpty()
    .withMessage('description cannot be empty')
    .isString()
    .withMessage('description is not a string'),
  body('quantity')
    .notEmpty()
    .withMessage('quantity cannot be empty')
    .isNumeric()
    .withMessage('quantity is not a number'),
  body('price')
    .notEmpty()
    .withMessage('price cannot be empty')
    .isNumeric()
    .withMessage('price is not a number'),
  body('categoryId')
    .notEmpty()
    .withMessage('categoryId cannot be empty')
    .isNumeric()
    .withMessage('categoryId is not a number'),
  checkResult,
];

const createCartValidators = [
  body('userId')
    .notEmpty()
    .withMessage('userId cannot be empty')
    .isNumeric()
    .withMessage('userId is not a number'),
  checkResult,
];

const createCategoriesValidators = [
  body('name')
    .notEmpty()
    .withMessage('name cannot be empty')
    .isString()
    .withMessage('name is not a string'),
  checkResult,
];

const createProductsInCartValidators = [
  body('cartId')
    .notEmpty()
    .withMessage('cartId cannot be empty')
    .isNumeric()
    .withMessage('cartId is not a number'),
  body('productId')
    .notEmpty()
    .withMessage('productId cannot be empty')
    .isNumeric()
    .withMessage('productId is not a number'),
  body('quantity')
    .notEmpty()
    .withMessage('quantity cannot be empty')
    .isNumeric()
    .withMessage('quantity is not a number'),
  checkResult,
];

const createImgUrlValidators = [
  body('imgUrl')
    .notEmpty()
    .withMessage('imgUrl cannot be empty')
    .isString()
    .withMessage('imgUrl is not a string'),
  body('productId')
    .notEmpty()
    .withMessage('productId cannot be empty')
    .isNumeric()
    .withMessage('productId is not a number'),
  checkResult,
];

module.exports = {
  createUserValidators,
  createOrderValidators,
  createProductValidators,
  createCartValidators,
  createCategoriesValidators,
  createProductsInCartValidators,
  createImgUrlValidators,
};
