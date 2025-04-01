import { toJSON } from '@reis/mongoose-to-json';
import { model, Schema, Types } from 'mongoose';

export const inventoryHistorySchema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['ADD', 'REMOVE', 'ADJUST', 'ORDER', 'RETURN'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  performedBy: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

inventoryHistorySchema.plugin(toJSON);

export const inventoryHistoryModel = model('InventoryHistory', inventoryHistorySchema); 