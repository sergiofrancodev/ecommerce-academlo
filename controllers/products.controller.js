const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Models
const { Product } = require('../models/product.model');
const { Category } = require('../models/category.model');
const { ProductImg } = require('../models/productImg.model')

// Utils
const { catchAsync } = require('../utils/catchAsync.util');
const { AppError } = require('../utils/appError.util');
const { storage } = require('../utils/firebase.util');

const getAllProductsActive = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { status: 'active' },
    attributes: ['id', 'title', 'description', 'quantity', 'price', 'categoryId', 'userId', 'status']
  });

  res.status(201).json({
    status: 'success',
    products,
  });
});

const getProductById = catchAsync(async (req, res, next) => {
  const { product } = req
  const productId = await Product.findOne({
    where: { status: 'active', id: product.id },
    attributes: ['id', 'title', 'description', 'quantity', 'price', 'categoryId', 'userId', 'status']
  });

  // Map async
	const productImgsPromises = product.productImgs.map(async productImg => {
		const imgRef = ref(storage, productImg.imgUrl);

		const imgFullPath = await getDownloadURL(imgRef);

		productImg.imgUrl = imgFullPath;
	});

	await Promise.all(productImgsPromises);

  res.status(201).json({
    status: 'success',
    productId,
  });
});

const getAllCategoriesActive = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({
    where: { status: 'active' },
    attributes: ['id', 'name', 'status']
  });

  res.status(201).json({
    status: 'success',
    categories,
  });
});

const createProduct = catchAsync(async (req, res, next) => {
  const { title, description, price, categoryId, quantity } = req.body;
  const { sessionUser } = req;

  const newProduct = await Product.create({
    title,
    description,
    price,
    categoryId,
    userId: sessionUser.id,
    quantity
  });

  if (req.files.length > 0) {
		const filesPromises = req.files.map(async file => {
			const imgRef = ref(storage, `products/${Date.now()}_${file.originalname}`);
			const imgRes = await uploadBytes(imgRef, file.buffer);

			return await ProductImg.create({
				productId: newProduct.id,
				imgUrl: imgRes.metadata.fullPath
			});
		});

		await Promise.all(filesPromises);
	}

  res.status(201).json({
    status: 'success',
    newProduct,
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { product, sessionUser } = req;
  const { title, description, price, quantity } = req.body;

  if (sessionUser.id === product.userId) {
    await product.update({ title, description, price, quantity });
  } else {
    return next(new AppError('Not authorized to update', 400))
  }

  res.status(201).json({
    status: 'success',
    product
  });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { product, sessionUser } = req;

  if (sessionUser.id === product.userId) {
    await product.update({ status: 'removed'})
  } else {
    return next(new AppError('Not authorized to update', 400))
  }

  res.status(201).json({
    status: 'success',
    product
  });
});

const createCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({
    name
  });

  res.status(201).json({
    status: 'success',
    newCategory,
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const { category } = req;
  const { name } = req.body;

    await category.update({ name });

  res.status(201).json({
    status: 'success',
    category
  });
});


module.exports = {
  getAllProductsActive,
  getProductById,
  getAllCategoriesActive,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
};
