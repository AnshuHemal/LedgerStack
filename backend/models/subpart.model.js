import mongoose from 'mongoose';

const subpartSchema = new mongoose.Schema({
  subpartName: {
    type: String,
    required: [true, 'Subpart name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Subpart name cannot exceed 100 characters']
  },
  producedByMachineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: [true, 'Machine ID is required']
  },
  stockQty: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
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
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pieces', 'kg', 'meters', 'liters'],
    default: 'pieces'
  },
  costPerUnit: {
    type: Number,
    min: [0, 'Cost per unit cannot be negative'],
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for faster queries
subpartSchema.index({ subpartName: 1, producedByMachineId: 1 });

// Virtual for checking if stock is low
subpartSchema.virtual('isLowStock').get(function() {
  return this.stockQty <= this.minStockLevel;
});

// Virtual for stock percentage
subpartSchema.virtual('stockPercentage').get(function() {
  if (this.maxStockLevel === 0) return 0;
  return Math.round((this.stockQty / this.maxStockLevel) * 100);
});

// Ensure virtual fields are serialized
subpartSchema.set('toJSON', { virtuals: true });
subpartSchema.set('toObject', { virtuals: true });

const Subpart = mongoose.model('Subpart', subpartSchema);

export default Subpart;
