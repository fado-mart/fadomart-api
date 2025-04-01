import { toJSON } from "@reis/mongoose-to-json";
import { model, Schema, Types } from "mongoose";

export const inventorySchema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    required: true,
    default: 10
  },
  location: {
    type: String,
    required: true,
    default: 'Main-Shop'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add index for faster queries
inventorySchema.index({ product: 1, location: 1 }, { unique: true });

// Add plugin for JSON transformation
inventorySchema.plugin(toJSON);

// Export the model
export const inventoryModel = model('Inventory', inventorySchema);

// Method to check if stock is low
inventorySchema.methods.isLowStock = function() {
  return this.quantity <= this.lowStockThreshold;
}; 