import { toJSON } from "@reis/mongoose-to-json";
import { model, Schema, Types } from "mongoose";

export const orderSchema = new Schema({
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        get: (value) => (value / 100).toFixed(2),
        set: (value) => Math.round(value * 100)
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Paid', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },
    paymentRef: { type: String },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        phone: String,
        email: String
    },
    trackingNumber: String,
    notes: String,
    cancelReason: String
}, {
    timestamps: true
});

// Add index for faster queries
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ paymentRef: 1 });

orderSchema.plugin(toJSON);

export const orderModel = model('Order', orderSchema);