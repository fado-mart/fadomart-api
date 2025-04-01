import { toJSON } from "@reis/mongoose-to-json";
import { model, Schema, Types } from "mongoose";


export const orderSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User',
    },

    products: [
        {
            product: {type: Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required: true},
        },
    ],

    totalPrice: {
        type: Number, 
        required: true,
        get: (value) => (value / 100).toFixed(2), //Convert back to Ghs for readability
        set: (value) => Math.round(value * 100) // Store in pesewas
    },
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },

    paymentRef: {type: String},
}, {
    timestamps: true
});

orderSchema.plugin(toJSON);

export const orderModel = model('Order', orderSchema);