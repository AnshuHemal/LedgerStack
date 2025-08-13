import Category from '../models/category.model.js';
import InventoryProduct from '../models/inventory-product.model.js';
import Subpart from '../models/subpart.model.js';
import Machine from '../models/machine.model.js';
import Order from '../models/order.model.js';

// ==================== CATEGORY CONTROLLERS ====================

export const createCategory = async (req, res) => {
  try {
    const { categoryName, description } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      categoryName,
      description
    });

    const savedCategory = await category.save();
    res.status(201).json({
      success: true,
      data: savedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ categoryName: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName, description } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if new name conflicts with existing category
    if (categoryName && categoryName !== existingCategory.categoryName) {
      const nameConflict = await Category.findOne({ 
        categoryName, 
        _id: { $ne: id } 
      });
      if (nameConflict) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { categoryName, description },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is being used by any products
    const productsUsingCategory = await InventoryProduct.findOne({ categoryId: id });
    if (productsUsingCategory) {
      return res.status(400).json({ 
        message: 'Cannot delete category. It is being used by products.' 
      });
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// ==================== MACHINE CONTROLLERS ====================

export const createMachine = async (req, res) => {
  try {
    const { machineName, description, status, location, capacity } = req.body;

    // Check if machine already exists
    const existingMachine = await Machine.findOne({ machineName });
    if (existingMachine) {
      return res.status(400).json({ message: 'Machine already exists' });
    }

    const machine = new Machine({
      machineName,
      description,
      status,
      location,
      capacity
    });

    const savedMachine = await machine.save();
    res.status(201).json({
      success: true,
      data: savedMachine
    });
  } catch (error) {
    console.error('Error creating machine:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating machine',
      error: error.message
    });
  }
};

export const getAllMachines = async (req, res) => {
  try {
    const machines = await Machine.find().sort({ machineName: 1 });
    res.status(200).json({
      success: true,
      count: machines.length,
      data: machines
    });
  } catch (error) {
    console.error('Error fetching machines:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching machines',
      error: error.message
    });
  }
};

export const updateMachine = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedMachine = await Machine.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMachine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedMachine
    });
  } catch (error) {
    console.error('Error updating machine:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating machine',
      error: error.message
    });
  }
};

export const deleteMachine = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if machine is being used by any subparts
    const subpartsUsingMachine = await Subpart.findOne({ producedByMachineId: id });
    if (subpartsUsingMachine) {
      return res.status(400).json({ 
        message: 'Cannot delete machine. It is being used by subparts.' 
      });
    }

    const deletedMachine = await Machine.findByIdAndDelete(id);
    if (!deletedMachine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Machine deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting machine:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting machine',
      error: error.message
    });
  }
};

// ==================== SUBPART CONTROLLERS ====================

export const createSubpart = async (req, res) => {
  try {
    const { subpartName, producedByMachineId, stockQty, minStockLevel, maxStockLevel, unit, costPerUnit, description } = req.body;

    // Check if subpart already exists
    const existingSubpart = await Subpart.findOne({ subpartName });
    if (existingSubpart) {
      return res.status(400).json({ message: 'Subpart already exists' });
    }

    // Verify machine exists
    const machine = await Machine.findById(producedByMachineId);
    if (!machine) {
      return res.status(400).json({ message: 'Machine not found' });
    }

    const subpart = new Subpart({
      subpartName,
      producedByMachineId,
      stockQty,
      minStockLevel,
      maxStockLevel,
      unit,
      costPerUnit,
      description
    });

    const savedSubpart = await subpart.save();
    
    // Populate machine details
    await savedSubpart.populate('producedByMachineId', 'machineName status');

    res.status(201).json({
      success: true,
      data: savedSubpart
    });
  } catch (error) {
    console.error('Error creating subpart:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subpart',
      error: error.message
    });
  }
};

export const getAllSubparts = async (req, res) => {
  try {
    const subparts = await Subpart.find()
      .populate('producedByMachineId', 'machineName status location')
      .sort({ subpartName: 1 });

    res.status(200).json({
      success: true,
      count: subparts.length,
      data: subparts
    });
  } catch (error) {
    console.error('Error fetching subparts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subparts',
      error: error.message
    });
  }
};

export const updateSubpartStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQty, minStockLevel, maxStockLevel, costPerUnit } = req.body;

    const updatedSubpart = await Subpart.findByIdAndUpdate(
      id,
      { stockQty, minStockLevel, maxStockLevel, costPerUnit },
      { new: true, runValidators: true }
    ).populate('producedByMachineId', 'machineName status');

    if (!updatedSubpart) {
      return res.status(404).json({ message: 'Subpart not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedSubpart
    });
  } catch (error) {
    console.error('Error updating subpart stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subpart stock',
      error: error.message
    });
  }
};

export const deleteSubpart = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if subpart is being used by any products
    const productsUsingSubpart = await InventoryProduct.findOne({
      'subpartsRequired.subpartId': id
    });
    if (productsUsingSubpart) {
      return res.status(400).json({ 
        message: 'Cannot delete subpart. It is being used by products.' 
      });
    }

    const deletedSubpart = await Subpart.findByIdAndDelete(id);
    if (!deletedSubpart) {
      return res.status(404).json({ message: 'Subpart not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Subpart deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subpart:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subpart',
      error: error.message
    });
  }
};

// ==================== INVENTORY PRODUCT CONTROLLERS ====================

export const createProduct = async (req, res) => {
  try {
    const { 
      productName, 
      categoryId, 
      sizes, 
      subpartsRequired, 
      boxCapacity, 
      minStockLevel, 
      maxStockLevel, 
      price, 
      description 
    } = req.body;

    // Check if product already exists
    const existingProduct = await InventoryProduct.findOne({ productName });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product already exists' });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    // Verify all subparts exist
    if (subpartsRequired && subpartsRequired.length > 0) {
      for (const subpart of subpartsRequired) {
        const subpartExists = await Subpart.findById(subpart.subpartId);
        if (!subpartExists) {
          return res.status(400).json({ 
            message: `Subpart with ID ${subpart.subpartId} not found` 
          });
        }
      }
    }

    const product = new InventoryProduct({
      productName,
      categoryId,
      sizes,
      subpartsRequired,
      boxCapacity,
      minStockLevel,
      maxStockLevel,
      price,
      description
    });

    const savedProduct = await product.save();
    
    // Populate category and subparts details
    await savedProduct.populate([
      { path: 'categoryId', select: 'categoryName' },
      { path: 'subpartsRequired.subpartId', select: 'subpartName stockQty unit' }
    ]);

    res.status(201).json({
      success: true,
      data: savedProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await InventoryProduct.find({ isActive: true })
      .populate('categoryId', 'categoryName')
      .populate('subpartsRequired.subpartId', 'subpartName stockQty unit minStockLevel')
      .sort({ productName: 1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // If updating subparts, verify they exist
    if (updateData.subpartsRequired && updateData.subpartsRequired.length > 0) {
      for (const subpart of updateData.subpartsRequired) {
        const subpartExists = await Subpart.findById(subpart.subpartId);
        if (!subpartExists) {
          return res.status(400).json({ 
            message: `Subpart with ID ${subpart.subpartId} not found` 
          });
        }
      }
    }

    const updatedProduct = await InventoryProduct.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'categoryId', select: 'categoryName' },
      { path: 'subpartsRequired.subpartId', select: 'subpartName stockQty unit minStockLevel' }
    ]);

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, minStockLevel, maxStockLevel } = req.body;

    const updatedProduct = await InventoryProduct.findByIdAndUpdate(
      id,
      { stock, minStockLevel, maxStockLevel },
      { new: true, runValidators: true }
    ).populate([
      { path: 'categoryId', select: 'categoryName' },
      { path: 'subpartsRequired.subpartId', select: 'subpartName stockQty unit minStockLevel' }
    ]);

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product stock',
      error: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product is being used by any orders
    const ordersUsingProduct = await Order.findOne({ productId: id });
    if (ordersUsingProduct) {
      return res.status(400).json({ 
        message: 'Cannot delete product. It is being used by orders.' 
      });
    }

    // Soft delete by setting isActive to false
    const deletedProduct = await InventoryProduct.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// ==================== INVENTORY STATUS ====================

export const getInventoryStatus = async (req, res) => {
  try {
    // Get all products with their subparts and calculate inventory status
    const products = await InventoryProduct.find({ isActive: true })
      .populate('categoryId', 'categoryName')
      .populate('subpartsRequired.subpartId', 'subpartName stockQty unit minStockLevel')
      .sort({ productName: 1 });

    // Calculate inventory status for each product
    const inventoryStatus = products.map(product => {
      const productData = product.toObject();
      
      // Calculate boxes ready based on available subparts
      let boxesReady = product.stock;
      let subpartsAvailability = [];
      let canProduce = true;
      let limitingFactor = null;

      if (product.subpartsRequired && product.subpartsRequired.length > 0) {
        product.subpartsRequired.forEach(subpart => {
          if (subpart.subpartId && typeof subpart.subpartId === 'object') {
            const availableQty = subpart.subpartId.stockQty;
            const requiredQty = subpart.quantityPerBox;
            const possibleBoxes = Math.floor(availableQty / requiredQty);
            
            subpartsAvailability.push({
              subpartName: subpart.subpartId.subpartName,
              availableQty,
              requiredQty,
              possibleBoxes,
              unit: subpart.unit,
              isLowStock: availableQty <= subpart.subpartId.minStockLevel
            });

            if (possibleBoxes < boxesReady) {
              boxesReady = possibleBoxes;
              limitingFactor = subpart.subpartId.subpartName;
            }

            if (availableQty < requiredQty) {
              canProduce = false;
            }
          }
        });
      }

      return {
        ...productData,
        boxesReady: Math.max(0, boxesReady),
        subpartsAvailability,
        canProduce,
        limitingFactor,
        stockStatus: product.stock <= product.minStockLevel ? 'low' : 
                    product.stock >= product.maxStockLevel ? 'high' : 'normal'
      };
    });

    // Get summary statistics
    const totalProducts = inventoryStatus.length;
    const lowStockProducts = inventoryStatus.filter(p => p.stockStatus === 'low').length;
    const productsWithLowSubparts = inventoryStatus.filter(p => 
      p.subpartsAvailability.some(sp => sp.isLowStock)
    ).length;

    res.status(200).json({
      success: true,
      data: {
        products: inventoryStatus,
        summary: {
          totalProducts,
          lowStockProducts,
          productsWithLowSubparts,
          totalCategories: await Category.countDocuments(),
          totalMachines: await Machine.countDocuments(),
          totalSubparts: await Subpart.countDocuments()
        }
      }
    });
  } catch (error) {
    console.error('Error fetching inventory status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory status',
      error: error.message
    });
  }
};

// ==================== ORDER CONTROLLERS ====================

export const createOrder = async (req, res) => {
  try {
    const { 
      productId, 
      size, 
      quantityOrdered, 
      priority, 
      customerName, 
      customerContact, 
      deliveryDate, 
      notes 
    } = req.body;

    // Verify product exists and size is valid
    const product = await InventoryProduct.findById(productId).populate('subpartsRequired.subpartId');
    if (!product) {
      return res.status(400).json({ message: 'Product not found' });
    }

    const validSize = product.sizes.find(s => s.size === size);
    if (!validSize) {
      return res.status(400).json({ message: 'Invalid size for this product' });
    }

    // Calculate required subparts for this order
    const subpartsReserved = [];
    let canFulfill = true;
    let limitingFactor = null;

    if (product.subpartsRequired && product.subpartsRequired.length > 0) {
      for (const subpart of product.subpartsRequired) {
        const requiredQty = subpart.quantityPerBox * quantityOrdered;
        const availableQty = subpart.subpartId.stockQty;
        
        if (availableQty < requiredQty) {
          canFulfill = false;
          limitingFactor = subpart.subpartId.subpartName;
          break;
        }

        subpartsReserved.push({
          subpartId: subpart.subpartId._id,
          quantityReserved: requiredQty,
          quantityUsed: 0
        });
      }
    }

    if (!canFulfill) {
      return res.status(400).json({ 
        message: `Cannot fulfill order. Insufficient subparts: ${limitingFactor}` 
      });
    }

    // Create order
    const order = new Order({
      productId,
      size,
      quantityOrdered,
      priority,
      customerName,
      customerContact,
      deliveryDate,
      notes,
      subpartsReserved
    });

    const savedOrder = await order.save();
    
    // Populate product details
    await savedOrder.populate('productId', 'productName categoryId');

    res.status(201).json({
      success: true,
      data: savedOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, priority } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const orders = await Order.find(filter)
      .populate('productId', 'productName categoryId')
      .populate('subpartsReserved.subpartId', 'subpartName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, productionStartDate, productionEndDate, actualQuantityProduced } = req.body;

    const updateData = { status };
    if (productionStartDate) updateData.productionStartDate = productionStartDate;
    if (productionEndDate) updateData.productionEndDate = productionEndDate;
    if (actualQuantityProduced !== undefined) updateData.actualQuantityProduced = actualQuantityProduced;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('productId', 'productName categoryId');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};
