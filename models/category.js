import { toJSON } from "@reis/mongoose-to-json";
import { Schema, model } from "mongoose";


export const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
    },

    description: { type: String }
}, {
    timestamps: true
})

categorySchema.plugin(toJSON);

export const categoryModel = model('Category', categorySchema);
