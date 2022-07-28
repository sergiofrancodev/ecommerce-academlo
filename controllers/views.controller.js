const path = require('path');

// Models
const { ProductInCart } = require('../models/productInCart.model');

// Utils
const { catchAsync } = require('../utils/catchAsync.util');

const renderIndex = catchAsync(async (req, res, next) => {
	const productInCart = await ProductInCart.findAll();

	res.status(200).render('index', {
		title: 'Order purchased',
		productInCart,
	});

	// Serve static html
	// const indexPath = path.join(__dirname, '..', 'public', 'index.html');

	// res.status(200).sendFile(indexPath);
});

module.exports = { renderIndex };
