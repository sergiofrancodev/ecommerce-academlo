// Models
const { Cart } = require('../models/cart.model');
const { Product } = require('../models/product.model');
const { ProductInCart } = require('../models/productInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { Email } = require('../utils/email.util');

const getUserCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: [
      {
        model: ProductInCart,
        required: false,
        where: { status: 'active' },
        include: { model: Product },
      },
    ],
  });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  res.status(200).json({ status: 'success', cart });
});

const addProductToCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, quantity } = req.body;

  // Validate input qty
  const product = await Product.findOne({
    where: { id: productId, status: 'active' },
  });

  if (!product) {
    return next(new AppError('Invalid product', 404));
  } else if (quantity > product.quantity) {
    return next(
      new AppError(
        `This product only has ${product.quantity} items available`,
        400
      )
    );
  }

  // Check if cart exists
  const cart = await Cart.findOne({
    where: { status: 'active', userId: sessionUser.id },
  });

  if (!cart) {
    // Create new cart for user
    const newCart = await Cart.create({ userId: sessionUser.id });

    // Add product to newly created cart
    await ProductInCart.create({
      cartId: newCart.id,
      productId,
      quantity,
    });
  } else {
    // Cart already exists
    // Check if product already exists in cart
    const productExists = await ProductInCart.findOne({
      where: { cartId: cart.id, productId, status: 'active' },
    });

    if (productExists) {
      return next(new AppError('Product is already in the cart', 400));
    }

    await ProductInCart.create({ cartId: cart.id, productId, quantity });
  }

  res.status(200).json({ status: 'success' });
});

const updateProductInCart = catchAsync(async (req, res, next) => {
  const { cart, sessionUser } = req;
  const { productId, newQty } = req.body;

  if (cart.userId === sessionUser.id) {
    const productExistsId = await Product.findOne({ where: { id: productId } })
    const productExistsInCart = await ProductInCart.findOne({ where: { id: productId } })

    if (productExistsInCart) {
      if (productExistsId.quantity >= newQty) {
        await productExistsInCart.update({ quantity: newQty })

        if (newQty === 0) {
          await productExistsInCart.update({ status: 'removed' })
        } else if (newQty > 0 && productExistsInCart.status === 'removed') {
          await productExistsInCart.update({ status: 'active' })
        }

        res.status(201).json({
          status: 'success',
          productExistsInCart
        })

      } else {
        return next(new AppError('The quantity is greater than available', 400))
      }
    } else {
      return next(new AppError('This product not exist in the cart', 400))
    }
  } else {
    return next(new AppError('This user does not have a cart', 400))
  }
});

const purchaseCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const cart = await Cart.findOne({
    where: { userId: sessionUser.id, status: 'active' },
    include: [
      {
        model: ProductInCart,
        required: false,
        where: { status: 'active' },
        include: { model: Product },
      },
    ],
  });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  let totalPrice = 0;

  const productsPurchasedPromises = cart.productInCarts.map(
    async productInCart => {
      const newQty = productInCart.product.quantity - productInCart.quantity;

      const productPrice =
        productInCart.quantity * +productInCart.product.price;

      totalPrice += productPrice;

      await productInCart.product.update({ quantity: newQty });

      return await productInCart.update({ status: 'purchased' });
    }
  );

  await Promise.all(productsPurchasedPromises);

  await new Email(sessionUser.email).sendNewOrder(cart.productInCarts, totalPrice);

  res.status(200).json({ status: 'success' });
});

const removeProductFromCart = catchAsync(async (req, res, next) => {
  const { cart, sessionUser } = req;
  const { productId } = req.params;

  if (cart.userId === sessionUser.id) {
    const productExistsInCart = await ProductInCart.findOne({ where: { status: 'active', id: productId } })

    if (productExistsInCart) {
      await productExistsInCart.update({ status: 'removed', quantity: 0 })
    } else {
      return next(new AppError('This product not exist in the cart', 400))
    }

    res.status(201).json({
      status: 'success',
      productExistsInCart
    })
  }
});

module.exports = {
  addProductToCart,
  updateProductInCart,
  purchaseCart,
  removeProductFromCart,
  getUserCart,
};
