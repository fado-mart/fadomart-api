import { toJSON } from "@reis/mongoose-to-json";
import { model, Schema, Types } from "mongoose";


export const cartSchema = Schema({
    product: {
        type: Types.ObjectId, 
        ref: 'Product', 
        required: true
    },

    quantity: {
        type: Number, 
        required: true, 
        default: 1
    },

    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

cartSchema.plugin(toJSON);

export const cartModel = model('Cart', cartSchema);