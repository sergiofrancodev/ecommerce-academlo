// Models
const { User } = require('./user.model');
const { Cart } = require('./cart.model');
const { Category } = require('./category.model');
const { Order } = require('./order.model');
const { Product } = require('./product.model');
const { ProductImg } = require('./productImg.model');
const { ProductInCart } = require('./productInCart.model');

const initModels = () => {
  // 1 User <----> M Order
  User.hasMany(Order, { foreignKey: 'userId' });
  Order.belongsTo(User);

  // 1 User <----> M Product
  User.hasMany(Product, { foreignKey: 'userId' });
  Product.belongsTo(User);

  // 1 Cart <----> M ProductInCart
  Cart.hasMany(ProductInCart, { foreignKey: 'cartId' });
  ProductInCart.belongsTo(Cart);

  // 1 Product <----> M ProductImg
  Product.hasMany(ProductImg, { foreignKey: 'productId' });
  ProductImg.belongsTo(Product);

  // 1 User <----> 1 Cart
  User.hasOne(Cart, { foreignKey: { name: 'userId' } });
  Cart.belongsTo(User);

  // 1 Cart <----> 1 Order
  Cart.hasOne(Order, { foreignKey: { name: 'cartId' } });
  Order.belongsTo(Cart);

  // 1 Category <----> 1 Product
  Category.hasOne(Product, { foreignKey: { name: 'categoryId' } });
  Product.belongsTo(Category);

  // 1 Product <----> 1 ProductInCart
  Product.hasOne(ProductInCart, { foreignKey: { name: 'productId' } });
  ProductInCart.belongsTo(Product);
};

module.exports = { initModels };
