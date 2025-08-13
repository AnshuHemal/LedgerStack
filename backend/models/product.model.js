import mongoose from 'mongoose';

const inventoryProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category ID is required']
  },
  sizes: [{
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  subpartsRequired: [{
    subpartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subpart',
      required: [true, 'Subpart ID is required']
    },
    quantityPerBox: {
      type: Number,
      required: [true, 'Quantity per box is required'],
      min: [0, 'Quantity per box cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['pieces', 'kg', 'meters', 'liters'],
      default: 'pieces'
    }
  }],
  boxCapacity: {
    type: Number,
    required: [true, 'Box capacity is required'],
    min: [1, 'Box capacity must be at least 1']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  minStockLevel: {
    type: Number,
    min: [0, 'Minimum stock level cannot be negative'],
    default: 10
  },
  maxStockLevel: {
    type: Number,
    min: [0, 'Maximum stock level cannot be negative'],
    default: 1000
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
inventoryProductSchema.index({ productName: 1, categoryId: 1, isActive: 1 });

// Virtual for checking if stock is low
inventoryProductSchema.virtual('isLowStock').get(function() {
  return this.stock <= this.minStockLevel;
});

// Virtual for stock percentage
inventoryProductSchema.virtual('stockPercentage').get(function() {
  if (this.maxStockLevel === 0) return 0;
  return Math.round((this.stock / this.maxStockLevel) * 100);
});

// Virtual for calculating boxes ready based on subparts availability
inventoryProductSchema.virtual('boxesReady').get(function() {
  if (!this.subpartsRequired || this.subpartsRequired.length === 0) {
    return this.stock;
  }
  
  // Calculate how many boxes can be made based on available subparts
  let maxBoxes = Infinity;
  
  this.subpartsRequired.forEach(subpart => {
    // This will be populated when we populate the subpart details
    if (subpart.subpartId && typeof subpart.subpartId === 'object' && subpart.subpartId.stockQty !== undefined) {
      const possibleBoxes = Math.floor(subpart.subpartId.stockQty / subpart.quantityPerBox);
      maxBoxes = Math.min(maxBoxes, possibleBoxes);
    }
  });
  
  return maxBoxes === Infinity ? this.stock : maxBoxes;
});

// Ensure virtual fields are serialized
inventoryProductSchema.set('toJSON', { virtuals: true });
inventoryProductSchema.set('toObject', { virtuals: true });

const InventoryProduct = mongoose.model('InventoryProduct', inventoryProductSchema);

export default InventoryProduct;
