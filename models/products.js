import { toJSON } from "@reis/mongoose-to-json";
import { model, Schema, Types } from "mongoose";


export const productSchema = new Schema({
    productName: {type: String, required: true},

    description: {type: String},

    stockStatus: {
        type: String,
        default: 'In Stock',
        enum: ['In Stock', 'Out of Stock']
       
    },

    image: {type: String},

    price: {type: Number, required: true},
    
    category: {type: Types.ObjectId, ref: 'Category'}
}, {
    timestamps: true
})

productSchema.plugin(toJSON);

export const productModel = model('product', productSchema);