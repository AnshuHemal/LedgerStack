import mongoose from 'mongoose';

const machineSchema = new mongoose.Schema({
  machineName: {
    type: String,
    required: [true, 'Machine name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Machine name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive', 'broken'],
    default: 'active'
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  capacity: {
    type: Number,
    min: [0, 'Capacity cannot be negative'],
    default: 0
  },
  currentLoad: {
    type: Number,
    min: [0, 'Current load cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
machineSchema.index({ machineName: 1, status: 1 });

const Machine = mongoose.model('Machine', machineSchema);

export default Machine;
