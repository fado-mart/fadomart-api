import { toJSON } from "@reis/mongoose-to-json";
import { Schema, model } from "mongoose";

const userSchema = new Schema({
    avatar: {type: String},
    userName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    phone: {type: Number},
    role: {
        type: String,
        default: 'user',
        enum: ['user', 'admin', 'superadmin']
    }
}, {
    timestamps: true
});

userSchema.plugin(toJSON);

export const UserModel = model('User', userSchema);