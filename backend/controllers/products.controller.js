import {
  Product,
  ProductCategory,
  ProductGroup,
  ProductType,
} from "../models/user.model.js";

// Add Product Group
export const addProductGroup = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await ProductGroup.findOne({
      name,
      createdBy: req.user.userId,
    });
    if (existing) {
      return res.status(400).json({ message: "Product Group already exists" });
    }

    const newType = new ProductGroup({ name, createdBy: req.user.userId });
    await newType.save();

    res
      .status(201)
      .json({ message: "Product Group created successfully", data: newType });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Product Groups
export const getProductGroup = async (req, res) => {
  try {
    const types = await ProductGroup.find({ createdBy: req.user.userId });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Product Group by ID
export const getProductGroupById = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await ProductGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Group not found" });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Product Group by Id
export const updateProductGroup = async (req, res) => {
  const { name } = req.body;
  const groupId = req.params.id;

  try {
    const group = await ProductGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Group not found" });
    }

    group.name = name || group.name;

    await group.save();
    res.status(200).json({ message: "Product Group updated..", data: group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Product Group by ID
export const deleteProductGroup = async (req, res) => {
  const groupId = req.params.id;

  try {
    const group = await ProductGroup.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Group not found" });
    }
    res.status(200).json({ message: "Product Group deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add Product Category
export const addProductCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await ProductCategory.findOne({
      name,
      createdBy: req.user.userId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Product Category already exists" });
    }

    const newType = new ProductCategory({ name, createdBy: req.user.userId });
    await newType.save();

    res.status(201).json({
      message: "Product Category created successfully",
      data: newType,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Product Categories
export const getProductCategory = async (req, res) => {
  try {
    const types = await ProductCategory.find({ createdBy: req.user.userId });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Product Category by ID
export const getProductCategoryById = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await ProductCategory.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Category not found" });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Product Category by Id
export const updateProductCategory = async (req, res) => {
  const { name } = req.body;
  const groupId = req.params.id;

  try {
    const group = await ProductCategory.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Category not found" });
    }

    group.name = name || group.name;

    await group.save();
    res
      .status(200)
      .json({ message: "Product Category updated..", data: group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Product Category by ID
export const deleteProductCategory = async (req, res) => {
  const groupId = req.params.id;

  try {
    const group = await ProductCategory.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Category not found" });
    }
    res.status(200).json({ message: "Product Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add Product Type
export const addProductType = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await ProductType.findOne({
      name,
      createdBy: req.user.userId,
    });
    if (existing) {
      return res.status(400).json({ message: "Product Type already exists" });
    }

    const newType = new ProductType({ name, createdBy: req.user.userId });
    await newType.save();

    res
      .status(201)
      .json({ message: "Product Type created successfully", data: newType });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get All Product Type
export const getProductType = async (req, res) => {
  try {
    const types = await ProductType.find({ createdBy: req.user.userId });
    res.json(types);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get Product Type by ID
export const getProductTypeById = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await ProductType.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Type not found" });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Product Type by Id
export const updateProductType = async (req, res) => {
  const { name } = req.body;
  const groupId = req.params.id;

  try {
    const group = await ProductType.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Type not found" });
    }

    group.name = name || group.name;

    await group.save();
    res.status(200).json({ message: "Product Type updated..", data: group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Product Type by ID
export const deleteProductType = async (req, res) => {
  const groupId = req.params.id;

  try {
    const group = await ProductType.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product Type not found" });
    }
    res.status(200).json({ message: "Product Type deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add Product
export const addProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Products
export const getProduct = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user.userId })
      .populate("productGroupId", "name")
      .populate("categoryId", "name")
      .populate("productTypeId", "name");

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch products", error: err });
  }
};

// Get Product by ID
export const getProductById = async (req, res) => {
  const groupId = req.params.id;
  try {
    const group = await Product.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Product by Id
export const updateProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Product by ID
export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
