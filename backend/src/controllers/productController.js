import Product from '../models/Product.js';

// @desc   Get all products
// @route  GET /api/v1/products
export const getProducts = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const filter = { removed: false };

    if (category) {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      result: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single product
// @route  GET /api/v1/products/:id
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, removed: false });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.json({
      success: true,
      result: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Create product
// @route  POST /api/v1/products
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, taxRate, category } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required fields',
      });
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      taxRate: Number(taxRate) || 0,
      category: category || 'General',
      createdBy: req.admin._id,
    });

    res.status(201).json({
      success: true,
      result: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Update product
// @route  PUT /api/v1/products/:id
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, removed: false });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const { name, description, price, taxRate, category, enabled } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (taxRate !== undefined) product.taxRate = Number(taxRate);
    if (category !== undefined) product.category = category;
    if (enabled !== undefined) product.enabled = enabled;

    const updatedProduct = await product.save();

    res.json({
      success: true,
      result: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete product (soft delete)
// @route  DELETE /api/v1/products/:id
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, removed: false });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product.removed = true;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
