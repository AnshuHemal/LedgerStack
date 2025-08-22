import Sku from "../models/sku.model.js";
import mongoose from "mongoose";

// Create SKU
export const createSku = async (req, res) => {
  try {
    const { location, group, products, unit, customUnit } = req.body;

    // Check if location already exists
    const existingSku = await Sku.findOne({ location });
    if (existingSku) {
      return res.status(400).json({
        message: "Location already exists. Please choose a different location.",
      });
    }

    // Server-side validation: prevent saving if any selected subpart is currently in an Unallocated location
    const selectedSubpartIds = new Set(
      (products || [])
        .flatMap((p) => p?.parts || [])
        .map((pt) => String(pt.subpartId))
        .filter(Boolean)
    );

    if (selectedSubpartIds.size > 0) {
      const unallocatedWithSelected = await Sku.aggregate([
        {
          $match: {
            createdBy: new mongoose.Types.ObjectId(req.user.userId),
            location: { $regex: /^Unallocated/i },
            products: { $exists: true, $ne: [] },
          },
        },
        { $unwind: "$products" },
        { $unwind: "$products.parts" },
        {
          $match: {
            "products.parts.subpartId": { $in: Array.from(selectedSubpartIds).map((id) => new mongoose.Types.ObjectId(id)) },
          },
        },
        {
          $group: { _id: null, subpartIds: { $addToSet: "$products.parts.subpartId" } },
        },
      ]);

      if (unallocatedWithSelected && unallocatedWithSelected.length > 0) {
        return res.status(400).json({
          message:
            "Some selected subparts are unallocated. Please allocate locations before saving.",
          data: { unallocatedSubpartIds: unallocatedWithSelected[0].subpartIds },
        });
      }
    }

    const skuData = {
      location,
      group,
      products,
      unit,
      customUnit,
      createdBy: req.user.userId,
    };

    // Generate SKU code if not provided
    if (!skuData.skuCode) {
      try {
        const lastSku = await Sku.findOne({}, {}, { sort: { skuCode: -1 } });
        let nextNumber = 1;
        if (lastSku && lastSku.skuCode) {
          const lastNumber = parseInt(lastSku.skuCode.replace("SKU-", ""));
          if (!isNaN(lastNumber)) {
            nextNumber = lastNumber + 1;
          }
        }
        skuData.skuCode = `SKU-${nextNumber.toString().padStart(6, "0")}`;
      } catch (error) {
        console.error("Controller error generating SKU code:", error);
        // Fallback: generate a timestamp-based code
        skuData.skuCode = `SKU-${Date.now().toString().slice(-6)}`;
      }
    }

    const newSku = new Sku(skuData);
    await newSku.save();

    // Populate the references for response
    await newSku.populate([
      { path: "group", select: "name" },
      { path: "products.productId", select: "name" },
      { path: "products.parts.subpartId", select: "parts" }
    ]);

    res.status(201).json({
      message: "SKU created successfully",
      data: newSku,
    });
  } catch (error) {
    console.error("Create SKU error:", error);
    res.status(500).json({
      message: "Failed to create SKU",
      error: error.message,
    });
  }
};

// Get All SKUs
export const getSkus = async (req, res) => {
  try {
    const createdBy = req.user.userId;
    const skus = await Sku.find({ createdBy })
      .populate("group", "name")
      .populate({
        path: "products.productId",
        select: "name"
      })
      .populate({
        path: "products.parts.subpartId",
        select: "parts"
      })
      .sort({ createdAt: -1 });

    res.json({
      message: "SKUs retrieved successfully",
      data: skus,
    });
  } catch (error) {
    console.error("Get SKUs error:", error);
    res.status(500).json({
      message: "Failed to retrieve SKUs",
      error: error.message,
    });
  }
};

// Get SKU by ID
export const getSkuById = async (req, res) => {
  try {
    const skuId = req.params.id;
    const createdBy = req.user.userId;

    const sku = await Sku.findOne({ _id: skuId, createdBy });

    if (!sku) {
      return res.status(404).json({ message: "SKU not found" });
    }

    res.json({
      message: "SKU retrieved successfully",
      data: sku,
    });
  } catch (error) {
    console.error("Get SKU by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve SKU",
      error: error.message,
    });
  }
};

// Update SKU
export const updateSku = async (req, res) => {
  try {
    const skuId = req.params.id;
    const createdBy = req.user.userId;
    const updateData = req.body;

    // Server-side validation: prevent saving if any selected subpart is currently in an Unallocated location
    const selectedSubpartIds = new Set(
      (updateData.products || [])
        .flatMap((p) => p?.parts || [])
        .map((pt) => String(pt.subpartId))
        .filter(Boolean)
    );

    if (selectedSubpartIds.size > 0) {
      const unallocatedWithSelected = await Sku.aggregate([
        {
          $match: {
            createdBy: new mongoose.Types.ObjectId(createdBy),
            location: { $regex: /^Unallocated/i },
            products: { $exists: true, $ne: [] },
          },
        },
        { $unwind: "$products" },
        { $unwind: "$products.parts" },
        {
          $match: {
            "products.parts.subpartId": { $in: Array.from(selectedSubpartIds).map((id) => new mongoose.Types.ObjectId(id)) },
          },
        },
        {
          $group: { _id: null, subpartIds: { $addToSet: "$products.parts.subpartId" } },
        },
      ]);

      if (unallocatedWithSelected && unallocatedWithSelected.length > 0) {
        return res.status(400).json({
          message:
            "Some selected subparts are unallocated. Please allocate locations before saving.",
          data: { unallocatedSubpartIds: unallocatedWithSelected[0].subpartIds },
        });
      }
    }

    const sku = await Sku.findOneAndUpdate(
      { _id: skuId, createdBy },
      updateData,
      { new: true, runValidators: true }
    );

    if (!sku) {
      return res.status(404).json({ message: "SKU not found" });
    }

    res.json({
      message: "SKU updated successfully",
      data: sku,
    });
  } catch (error) {
    console.error("Update SKU error:", error);
    res.status(500).json({
      message: "Failed to update SKU",
      error: error.message,
    });
  }
};

// Delete SKU
export const deleteSku = async (req, res) => {
  try {
    const skuId = req.params.id;
    const createdBy = req.user.userId;

    const sku = await Sku.findOneAndDelete({ _id: skuId, createdBy });

    if (!sku) {
      return res.status(404).json({ message: "SKU not found" });
    }

    res.json({
      message: "SKU deleted successfully",
    });
  } catch (error) {
    console.error("Delete SKU error:", error);
    res.status(500).json({
      message: "Failed to delete SKU",
      error: error.message,
    });
  }
}; 