import ProductionUnit from "../models/productionUnit.model.js";
import Unit from "../models/unit.model.js";
import { Product, ProductGroup } from "../models/user.model.js";
import Subpart from "../models/subpart.model.js";
import Sku from "../models/sku.model.js";

// Helper function to update or create SKU entry for warehouse management
const updateWarehouseSku = async (
  productId,
  groupId,
  partId,
  partName,
  color,
  quantity,
  userId
) => {
  try {
    // Find existing SKU with this product and part combination
    const existingSku = await Sku.findOne({
      createdBy: userId,
      products: {
        $elemMatch: {
          productId: productId,
          parts: {
            $elemMatch: {
              subpartId: partId,
              partName: partName,
              color: color,
            },
          },
        },
      },
    });

    if (existingSku) {
      // Update existing SKU - increment quantity for the specific part
      const updatedSku = await Sku.findOneAndUpdate(
        {
          _id: existingSku._id,
          "products.productId": productId,
          "products.parts.subpartId": partId,
          "products.parts.partName": partName,
          "products.parts.color": color,
        },
        {
          $inc: { "products.$[product].parts.$[part].quantity": quantity },
        },
        {
          arrayFilters: [
            { "product.productId": productId },
            { "part.subpartId": partId, "part.partName": partName, "part.color": color },
          ],
          new: true
        }
      );

      return {
        success: true,
        isNew: false,
        message: "Quantity updated in warehouse",
        sku: updatedSku
      };
    } else {
      // Try to reuse an existing "Unallocated" SKU for this user and group
      let unallocatedSku = await Sku.findOne({
        createdBy: userId,
        location: "Unallocated",
        group: groupId,
      });

      if (!unallocatedSku) {
        // Create new SKU entry with "Unallocated" location
        try {
          unallocatedSku = await Sku.create({
            location: "Unallocated",
            group: groupId,
            products: [
              {
                productId: productId,
                parts: [
                  {
                    subpartId: partId,
                    partName: partName,
                    quantity: quantity,
                    color: color,
                  },
                ],
              },
            ],
            unit: "pieces",
            createdBy: userId,
          });
        } catch (err) {
          // Handle duplicate Unallocated location (global unique). Fallback to user-specific label
          if (err.code === 11000) {
            unallocatedSku = await Sku.create({
              location: `Unallocated-${String(userId).slice(-6)}`,
              group: groupId,
              products: [
                {
                  productId: productId,
                  parts: [
                    {
                      subpartId: partId,
                      partName: partName,
                      quantity: quantity,
                      color: color,
                    },
                  ],
                },
              ],
              unit: "pieces",
              createdBy: userId,
            });
          } else {
            throw err;
          }
        }

        return {
          success: true,
          isNew: true,
          message: "New unallocated warehouse entry created",
          sku: unallocatedSku,
        };
      }

      // We have an Unallocated SKU. Check if product exists in it
      const productExists = unallocatedSku.products?.some(
        (p) => String(p.productId) === String(productId)
      );

      if (productExists) {
        // Push new part under the existing product
        const updatedSku = await Sku.findOneAndUpdate(
          { _id: unallocatedSku._id },
          {
            $push: {
              "products.$[product].parts": {
                subpartId: partId,
                partName: partName,
                quantity: quantity,
                color: color,
              },
            },
          },
          {
            arrayFilters: [{ "product.productId": productId }],
            new: true,
          }
        );

        return {
          success: true,
          isNew: true,
          message: "New unallocated warehouse entry created",
          sku: updatedSku,
        };
      } else {
        // Push a new product with the part
        const updatedSku = await Sku.findOneAndUpdate(
          { _id: unallocatedSku._id },
          {
            $push: {
              products: {
                productId: productId,
                parts: [
                  {
                    subpartId: partId,
                    partName: partName,
                    quantity: quantity,
                    color: color,
                  },
                ],
              },
            },
          },
          { new: true }
        );

        return {
          success: true,
          isNew: true,
          message: "New unallocated warehouse entry created",
          sku: updatedSku,
        };
      }
    }
  } catch (error) {
    console.error("Error updating warehouse SKU:", error);
    return {
      success: false,
      message: "Failed to update warehouse",
      error: error.message
    };
  }
};

// Get all production units
export const getProductionUnits = async (req, res) => {
  try {
    const productionUnits = await ProductionUnit.find({ createdBy: req.user.userId })
      .populate("productGroup", "name")
      .populate("product", "name")
      .populate("part", "parts")
      .sort({ date: -1 });

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
    const productionUnit = await ProductionUnit.findOne({ _id: req.params.id, createdBy: req.user.userId })
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

    // Check if a production unit already exists for the same date, unit, product, and part
    const existingProductionUnit = await ProductionUnit.findOne({
      unitName,
      productGroup,
      product,
      part,
      date: date || new Date(),
      createdBy: req.user.userId,
    });

    let savedProductionUnit;
    let isUpdate = false;

    if (existingProductionUnit) {
      // Update existing production unit by adding the new quantity
      existingProductionUnit.quantity += parseInt(quantity);
      savedProductionUnit = await existingProductionUnit.save();
      isUpdate = true;
    } else {
      // Create new production unit
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
        createdBy: req.user.userId,
      });

      savedProductionUnit = await productionUnit.save();
    }

    // Update warehouse SKU (use provided selectedPartIndex instead of splitting)
    const subpartId = part;
    const partIndex = Number.isInteger(selectedPartIndex)
      ? selectedPartIndex
      : parseInt(selectedPartIndex || 0);
    const subpartDetails = await Subpart.findById(subpartId);
    let partName = "Unknown Part";
    let color = "Default";
    
    if (subpartDetails && subpartDetails.parts && subpartDetails.parts[partIndex]) {
      partName = subpartDetails.parts[partIndex].partName;
      color = subpartDetails.parts[partIndex].color || "Default";
    }

    const warehouseResult = await updateWarehouseSku(
      product,
      productGroup,
      subpartId,
      partName,
      color,
      quantity,
      req.user.userId
    );

    // Populate the saved production unit
    const populatedProductionUnit = await ProductionUnit.findById(savedProductionUnit._id)
      .populate("productGroup", "name")
      .populate("product", "name")
      .populate("part", "parts");

    res.status(201).json({
      success: true,
      message: isUpdate ? "Production unit quantity updated successfully" : "Production unit created successfully",
      data: populatedProductionUnit,
      warehouse: warehouseResult,
      isUpdate: isUpdate
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

    const updatedProductionUnit = await ProductionUnit.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
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

    // Update warehouse SKU for the updated production unit
    const subpartId = part;
    const partIndex = Number.isInteger(selectedPartIndex)
      ? selectedPartIndex
      : parseInt(selectedPartIndex || 0);
    const subpartDetails = await Subpart.findById(subpartId);
    let partName = "Unknown Part";
    let color = "Default";
    
    if (subpartDetails && subpartDetails.parts && subpartDetails.parts[partIndex]) {
      partName = subpartDetails.parts[partIndex].partName;
      color = subpartDetails.parts[partIndex].color || "Default";
    }

    const warehouseResult = await updateWarehouseSku(
      product,
      productGroup,
      subpartId,
      partName,
      color,
      quantity,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Production unit updated successfully",
      data: updatedProductionUnit,
      warehouse: warehouseResult
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
    const productionUnit = await ProductionUnit.findOneAndDelete({ _id: req.params.id, createdBy: req.user.userId });

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