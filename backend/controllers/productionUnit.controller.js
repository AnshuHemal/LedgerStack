import ProductionUnit from "../models/productionUnit.model.js";
import Unit from "../models/unit.model.js";
import { Product, ProductGroup } from "../models/user.model.js";
import Subpart from "../models/subpart.model.js";

// Get all production units
export const getProductionUnits = async (req, res) => {
  try {
    const productionUnits = await ProductionUnit.find()
      .populate("productGroup", "name")
      .populate("product", "name")
      .populate("part", "parts")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: productionUnits,
    });
  } catch (error) {
    console.error("Error fetching production units:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching production units",
      error: error.message,
    });
  }
};

// Get single production unit
export const getProductionUnit = async (req, res) => {
  try {
    const productionUnit = await ProductionUnit.findById(req.params.id)
      .populate("productGroup", "name")
      .populate("product", "name")
      .populate("part", "parts");

    if (!productionUnit) {
      return res.status(404).json({
        success: false,
        message: "Production unit not found",
      });
    }

    res.status(200).json({
      success: true,
      data: productionUnit,
    });
  } catch (error) {
    console.error("Error fetching production unit:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching production unit",
      error: error.message,
    });
  }
};

// Create production unit
export const createProductionUnit = async (req, res) => {
  try {
    const {
      unitName,
      productGroup,
      product,
      part,
      selectedPartIndex,
      quantity,
      date,
    } = req.body;

    // Fetch product details to auto-fill type and category
    const productDetails = await Product.findById(product)
      .populate("productGroupId", "name")
      .populate("categoryId", "name")
      .populate("productTypeId", "name");

    if (!productDetails) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productionUnit = new ProductionUnit({
      unitName,
      productGroup,
      product,
      productType: productDetails.productTypeId?.name || "",
      category: productDetails.categoryId?.name || "",
      part,
      selectedPartIndex: selectedPartIndex || 0,
      quantity,
      date: date || new Date(),
    });

    const savedProductionUnit = await productionUnit.save();

    // Populate the saved production unit
    const populatedProductionUnit = await ProductionUnit.findById(savedProductionUnit._id)
      .populate("productGroup", "name")
      .populate("product", "name")
      .populate("part", "parts");

    res.status(201).json({
      success: true,
      message: "Production unit created successfully",
      data: populatedProductionUnit,
    });
  } catch (error) {
    console.error("Error creating production unit:", error);
    res.status(500).json({
      success: false,
      message: "Error creating production unit",
      error: error.message,
    });
  }
};

// Update production unit
export const updateProductionUnit = async (req, res) => {
  try {
    const {
      unitName,
      productGroup,
      product,
      part,
      selectedPartIndex,
      quantity,
      date,
    } = req.body;

    // Fetch product details to auto-fill type and category
    const productDetails = await Product.findById(product)
      .populate("productGroupId", "name")
      .populate("categoryId", "name")
      .populate("productTypeId", "name");

    if (!productDetails) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updatedProductionUnit = await ProductionUnit.findByIdAndUpdate(
      req.params.id,
      {
        unitName,
        productGroup,
        product,
        productType: productDetails.productTypeId?.name || "",
        category: productDetails.categoryId?.name || "",
        part,
        selectedPartIndex: selectedPartIndex || 0,
        quantity,
        date,
      },
      { new: true }
    ).populate("productGroup", "name")
     .populate("product", "name")
     .populate("part", "parts");

    if (!updatedProductionUnit) {
      return res.status(404).json({
        success: false,
        message: "Production unit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Production unit updated successfully",
      data: updatedProductionUnit,
    });
  } catch (error) {
    console.error("Error updating production unit:", error);
    res.status(500).json({
      success: false,
      message: "Error updating production unit",
      error: error.message,
    });
  }
};

// Delete production unit
export const deleteProductionUnit = async (req, res) => {
  try {
    const productionUnit = await ProductionUnit.findByIdAndDelete(req.params.id);

    if (!productionUnit) {
      return res.status(404).json({
        success: false,
        message: "Production unit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Production unit deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting production unit:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting production unit",
      error: error.message,
    });
  }
};

// Get all units (for dropdown)
export const getUnits = async (req, res) => {
  try {
    const units = await Unit.find({ status: "active" }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    console.error("Error fetching units:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching units",
      error: error.message,
    });
  }
};

// Create new unit
export const createUnit = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if unit already exists
    const existingUnit = await Unit.findOne({ name: name.trim() });
    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: "Unit with this name already exists",
      });
    }

    const unit = new Unit({
      name: name.trim(),
      description,
    });

    const savedUnit = await unit.save();

    res.status(201).json({
      success: true,
      message: "Unit created successfully",
      data: savedUnit,
    });
  } catch (error) {
    console.error("Error creating unit:", error);
    res.status(500).json({
      success: false,
      message: "Error creating unit",
      error: error.message,
    });
  }
};

// Get products by group
export const getProductsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const products = await Product.find({ productGroupId: groupId })
      .populate("productGroupId", "name")
      .populate("categoryId", "name")
      .populate("productTypeId", "name")
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products by group:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products by group",
      error: error.message,
    });
  }
};

// Get subparts by product
export const getSubpartsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const subparts = await Subpart.find({ product: productId })
      .populate("product", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: subparts,
    });
  } catch (error) {
    console.error("Error fetching subparts by product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subparts by product",
      error: error.message,
    });
  }
};