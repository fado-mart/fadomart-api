import { toJSON } from "@reis/mongoose-to-json";
import { Schema, model } from "mongoose";
import crypto from 'crypto';

const userSchema = new Schema({
    avatar: {
        type: String,
        required: false
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    timestamps: true
});

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = token;
    this.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    return token;
};

// Check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function(token) {
    return this.passwordResetToken === token && 
           this.passwordResetExpires > Date.now();
};

const blacklistSchema = new Schema({
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

blacklistSchema.index({createdAt: 1}, {expireAfterSeconds: 300});

userSchema.plugin(toJSON);

export const UserModel = model('User', userSchema);
export const BlacklistModel = model("Blacklist", blacklistSchema);
