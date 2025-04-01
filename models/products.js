import { toJSON } from "@reis/mongoose-to-json";
import { model, Schema, Types } from "mongoose";
import { inventoryModel } from "./inventory.js";
import { inventoryHistoryModel } from "./inventoryHistory.js";



export const productSchema = new Schema({
    productName: {type: String, required: true},

    description: {type: String},

    stockStatus: {
        type: String,
        default: 'In Stock',
        enum: ['In Stock', 'Out of Stock']
       
    },

    quantity: {type: Number},

    image: {type: String},

    price: {type: Number, required: true},
    
    category: {type: Types.ObjectId, ref: 'Category'}
}, {
    timestamps: true
})

productSchema.plugin(toJSON);

export const productModel = model('Product', productSchema);

// Add a post-save middleware
productSchema.post('save', async function(doc) {
    try {
        // Check if inventory exists for this product
        const inventory = await inventoryModel.findOne({ product: doc._id });
        if (!inventory) {
            // Create initial inventory record
            await inventoryModel.create({
                product: doc._id,
                quantity: 0,
                lowStockThreshold: 10,
                location: 'Main-Shop'
            });
        }
    } catch (error) {
        console.error('Error creating inventory record:', error);
    }
});

// Add a pre-remove middleware
productSchema.pre('remove', async function(next) {
    try {
        // Remove associated inventory records
        await inventoryModel.deleteOne({ product: this._id });
        await inventoryHistoryModel.deleteMany({ product: this._id });
        next();
    } catch (error) {
        next(error);
    }
});