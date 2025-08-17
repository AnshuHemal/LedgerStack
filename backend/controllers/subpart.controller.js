import Subpart from "../models/subpart.model.js";
import { Product } from "../models/user.model.js";

// Create Subpart
export const createSubpart = async (req, res) => {
  try {
    console.log("Creating subpart with data:", req.body);
    const subpartData = {
      ...req.body,
      createdBy: req.user.userId,
    };
    console.log("Final subpart data:", subpartData);

    const newSubpart = new Subpart(subpartData);
    console.log("Subpart instance before save:", newSubpart);
    await newSubpart.save();
    console.log("Subpart saved successfully:", newSubpart);

    // Populate product for response
    await newSubpart.populate({
      path: "product",
      select: "name productGroupId productTypeId categoryId",
      populate: [
        {
          path: "productGroupId",
          select: "name"
        },
        {
          path: "productTypeId",
          select: "name"
        },
        {
          path: "categoryId",
          select: "name"
        }
      ]
    });

    res.status(201).json({
      message: "Subpart created successfully",
      data: newSubpart,
    });
  } catch (error) {
    console.error("Create subpart error:", error);
    res.status(500).json({
      message: "Failed to create subpart",
      error: error.message,
    });
  }
};

// Get All Subparts
export const getSubparts = async (req, res) => {
  try {
    const createdBy = req.user.userId;
    const subparts = await Subpart.find({ createdBy })
      .populate({
        path: "product",
        select: "name productGroupId productTypeId categoryId",
        populate: [
          {
            path: "productGroupId",
            select: "name"
          },
          {
            path: "productTypeId",
            select: "name"
          },
          {
            path: "categoryId",
            select: "name"
          }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({
      message: "Subparts retrieved successfully",
      data: subparts,
    });
  } catch (error) {
    console.error("Get subparts error:", error);
    res.status(500).json({
      message: "Failed to retrieve subparts",
      error: error.message,
    });
  }
};

// Get Subpart by ID
export const getSubpartById = async (req, res) => {
  try {
    const subpartId = req.params.id;
    const createdBy = req.user.userId;

    const subpart = await Subpart.findOne({ _id: subpartId, createdBy })
      .populate({
        path: "product",
        select: "name productGroupId productTypeId categoryId",
        populate: [
          {
            path: "productGroupId",
            select: "name"
          },
          {
            path: "productTypeId",
            select: "name"
          },
          {
            path: "categoryId",
            select: "name"
          }
        ]
      });

    if (!subpart) {
      return res.status(404).json({ message: "Subpart not found" });
    }

    res.json({
      message: "Subpart retrieved successfully",
      data: subpart,
    });
  } catch (error) {
    console.error("Get subpart by ID error:", error);
    res.status(500).json({
      message: "Failed to retrieve subpart",
      error: error.message,
    });
  }
};

// Update Subpart
export const updateSubpart = async (req, res) => {
  try {
    const subpartId = req.params.id;
    const createdBy = req.user.userId;
    const updateData = req.body;

    const subpart = await Subpart.findOneAndUpdate(
      { _id: subpartId, createdBy },
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: "product",
      select: "name productGroupId productTypeId categoryId",
      populate: [
        {
          path: "productGroupId",
          select: "name"
        },
        {
          path: "productTypeId",
          select: "name"
        },
        {
          path: "categoryId",
          select: "name"
        }
      ]
    });

    if (!subpart) {
      return res.status(404).json({ message: "Subpart not found" });
    }

    res.json({
      message: "Subpart updated successfully",
      data: subpart,
    });
  } catch (error) {
    console.error("Update subpart error:", error);
    res.status(500).json({
      message: "Failed to update subpart",
      error: error.message,
    });
  }
};

// Delete Subpart
export const deleteSubpart = async (req, res) => {
  try {
    const subpartId = req.params.id;
    const createdBy = req.user.userId;

    const subpart = await Subpart.findOneAndDelete({ _id: subpartId, createdBy });

    if (!subpart) {
      return res.status(404).json({ message: "Subpart not found" });
    }

    res.json({
      message: "Subpart deleted successfully",
    });
  } catch (error) {
    console.error("Delete subpart error:", error);
    res.status(500).json({
      message: "Failed to delete subpart",
      error: error.message,
    });
  }
};

// Get Subparts by Product
export const getSubpartsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const subparts = await Subpart.find({ 
      product: productId,
      createdBy: req.user.userId 
    })
      .populate({
        path: "product",
        select: "name productGroupId productTypeId categoryId",
        populate: [
          {
            path: "productGroupId",
            select: "name"
          },
          {
            path: "productTypeId",
            select: "name"
          },
          {
            path: "categoryId",
            select: "name"
          }
        ]
      })
      .populate({
        path: "parts",
        select: "partName quantity color"
      });

    res.status(200).json(subparts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch subparts by product", error: err });
  }
}; 