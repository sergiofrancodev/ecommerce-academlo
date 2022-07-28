const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Models
const { User } = require('../models/user.model');
const { Order } = require('../models/order.model');
const { Product } = require('../models/product.model');
const { Cart } = require('../models/cart.model');
const { ProductInCart } = require('../models/productInCart.model');
const { Category } = require('../models/category.model');
const { ProductImg } = require('../models/productImg.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { Email } = require('../utils/email.util');

dotenv.config({ path: './config.env' });

const createUser = catchAsync(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  // Hash password
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username: username,
    email,
    password: hashPassword,
    role,
  });

  // Remove password from response
  newUser.password = undefined;

  // Send welcome email
	await new Email(email).sendWelcome(username);

  res.status(201).json({
    status: 'success',
    newUser,
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate credentials (email)
  const user = await User.findOne({
    where: {
      email,
      status: 'active',
    },
  });

  if (!user) {
    return next(new AppError('Credentials invalid', 400));
  }

  // Validate password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return next(new AppError('Credentials invalid', 400));
  }

  // Generate JWT (JsonWebToken) ->
  const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Send response
  res.status(200).json({
    status: 'success',
    token,
  });
});

const getAllUsers = catchAsync(async (req, res, next) => {
  const { sessionUser } = req
  const role = sessionUser.role

  if(role === 'admin'){

    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'status', 'role'],
    });
    
    res.status(201).json({
      status: 'success',
      users,
    });
  } else {
    return next(new AppError('Admin permission required', 400));
  }
});

const updateUser = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { username, email } = req.body;

  await user.update({ username, email });

  res.status(201).json({ status: 'success', user });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const { user } = req;

  await user.update({ status: 'inactive' });

  res.status(201).json({ status: 'success', user });
});

const getAllProductsMe = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  
  const product = await Product.findAll({
    where: { userId: sessionUser.id },
    attributes: ['id', 'title', 'description', 'price', 'quantity', 'categoryId', 'userId', 'status'],
    include: [
      {
        model: Category,
        required: false,
        where: { status: 'active' },
        attributes: ['id', 'name', 'status']
      },
      {
        model: ProductImg,
        required: false,
        where: { status: 'active' },
        attributes: ['id', 'imgUrl', 'productId', 'status']
      }
    ]
  })

  if(product === undefined) {
    return next(new AppError('This user not has products', 400));
  } else {
    res.status(201).json({
      status: 'success',
      product,
    });
  }
});

const getAllShoppingMe = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const order = await Order.findAll({
    where: { status: 'active', id: sessionUser.id },
    attributes: ['id', 'userId', 'cartId', 'totalPrice', 'status'],
    include: [
      {
        model: Cart,
        required: false,
        where: { status: 'active' },
        attributes: ['id', 'userId', 'status'],
        include: [
          {
            model: ProductInCart,
            required: false,
            where: { status: 'purchased' },
            attributes: ['id', 'cartId', 'productId', 'quantity', 'status']
          }
        ]
      }
    ]
  })

  res.status(201).json({
    status: 'success',
    order,
  });
});

const getOrderById = catchAsync(async (req, res, next) => {
  const { order } = req;

  const orderId = await Order.findOne({
    where: { status: 'active', id: order.id},
    attributes: ['id', 'userId', 'cartId', 'totalPrice', 'status'],
    include: [
      {
        model: Cart,
        required: false,
        where: { status: 'active' },
        attributes: ['id', 'userId', 'status'],
        include: [
          {
            model: ProductInCart,
            required: false,
            where: { status: 'purchased' },
            attributes: ['id', 'cartId', 'productId', 'quantity', 'status']
          }
        ]
      }
    ]
  })

  res.status(201).json({
    status: 'success',
    orderId,
  });
});

module.exports = {
  createUser,
  login,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllProductsMe,
  getAllShoppingMe,
  getOrderById,
};
