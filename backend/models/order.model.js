import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: [true, 'Order number is required'],
    unique: true,
    trim: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryProduct',
    required: [true, 'Product ID is required']
  },
  size: {
    type: String,
    required: [true, 'Size is required'],
    trim: true
  },
  quantityOrdered: {
    type: Number,
    required: [true, 'Quantity ordered is required'],
    min: [1, 'Quantity ordered must be at least 1']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_production', 'ready', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  customerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerContact: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer contact cannot exceed 100 characters']
  },
  deliveryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  // Track subparts reserved for this order
  subpartsReserved: [{
    subpartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subpart'
    },
    quantityReserved: {
      type: Number,
      min: [0, 'Quantity reserved cannot be negative']
    },
    quantityUsed: {
      type: Number,
      min: [0, 'Quantity used cannot be negative'],
      default: 0
    }
  }],
  // Production tracking
  productionStartDate: {
    type: Date
  },
  productionEndDate: {
    type: Date
  },
  actualQuantityProduced: {
    type: Number,
    min: [0, 'Actual quantity produced cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
orderSchema.index({ orderNumber: 1, status: 1, createdAt: -1 });
orderSchema.index({ productId: 1, status: 1 });

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for checking if order is overdue
orderSchema.virtual('isOverdue').get(function() {
  if (!this.deliveryDate) return false;
  const now = new Date();
  return now > this.deliveryDate && this.status !== 'delivered' && this.status !== 'cancelled';
});

// Virtual for order progress percentage
orderSchema.virtual('progressPercentage').get(function() {
  const statusProgress = {
    'pending': 0,
    'confirmed': 20,
    'in_production': 50,
    'ready': 80,
    'shipped': 90,
    'delivered': 100,
    'cancelled': 0
  };
  return statusProgress[this.status] || 0;
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Pre-save middleware to generate order number if not provided
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of orders for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    const orderCount = await mongoose.model('Order').countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    this.orderNumber = `ORD-${year}${month}${day}-${String(orderCount + 1).padStart(3, '0')}`;
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
