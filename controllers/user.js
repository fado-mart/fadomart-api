import { BlacklistModel, UserModel } from "../models/user.js";
import { loginUserValidator, registerUserValidator, updateUserValidator } from "../validators/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { mailTransporter } from "../utils/mail.js";
import { generateEmailTemplate } from "../utils/template.js";
import { sendPasswordResetEmail, sendPasswordResetConfirmation } from "../utils/emailService.js";

// Register user
export const registerUser = async (req, res, next) => {
    try {
        const { error, value } = registerUserValidator.validate(req.body, { avatar: req.file?.filename });
        if (error) {
            return res.status(422).json(error);
        }

        // Check if user already exists
        const user = await UserModel.findOne({ email: value.email });
        if (user) {
            return res.status(409).json('User already exists!');
        }

        // Hash password
        const hashPassword = bcrypt.hashSync(value.password, 10);

        // Create new user
        await UserModel.create({
            ...value,
            password: hashPassword
        });

        // Send welcome email
        const emailContent = `
        <p> Dear ${value.userName}, </p>
        <h4>You have been registered successfully!</h4>
        <p>Login to enjoy the wonderful packages that awaits you...</p>
        `;

        await mailTransporter.sendMail({
            from: `FADOMART MALL <${process.env.MAIL_ADDRESS}>`,
            to: value.email,
            subject: "User Account Registration",
            html: generateEmailTemplate(emailContent)
        });

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        next(error);
    }
};

// Request password reset
export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save();

        await sendPasswordResetEmail(user.userName, user.email, resetToken);

        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        next(error);
    }
};

// Reset password
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        const user = await UserModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashPassword = bcrypt.hashSync(password, 10);
        // console.log('Reset Password - New Hash:', hashPassword);
        
        user.password = hashPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        await sendPasswordResetConfirmation(user.userName, user.email);

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        next(error);
    }
};

// Login users
export const userLogin = async (req, res, next) => {
    try {
        const { error, value } = loginUserValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }

        const user = await UserModel.findOne({
            email: value.email
        });
        if (!user) {
            return res.status(404).json('User does not exist')
        }

        // console.log('Login - Stored Hash:', user.password);
        // console.log('Login - Attempting with password:', value.password);
        
        const correctPassword = bcrypt.compareSync(value.password, user.password);
        // console.log('Login - Password match:', correctPassword);

        if (!correctPassword) {
            return res.status(401).json('Invalid credentials!');
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_PRIVATE_KEY,
            { expiresIn: '24h' }
        )

        res.json({
            message: 'Login Successful',
            accessToken: token
        });
    } catch (error) {
        next(error);
    }
}

// Get User Profile
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.auth.id).select({ password: false });

        res.json(user);
    } catch (error) {
        next(error);
    }
}

// Update User Profile
export const getUserProfiles = async (req, res, next) => {
    try {
        const { filter = '{}', sort = '{}', limit = 100, skip = 0 } = req.query

        const users = await UserModel
            .find(JSON.parse(filter))
            .sort(JSON.parse(sort))
            .limit(limit)
            .skip(skip);

        res.json(users);
    } catch (error) {
        next(error);
    }
}

export const updateUserProfile = async (req, res, next) => {
    try {
        const { error, value } = updateUserValidator.validate({
            ...req.body,
            avatar: req.file?.filename
        });
        if (error) {
            return res.status(422).json(error);
        }

        await UserModel.findByIdAndUpdate(req.auth.id, value);

        res.json('User profile updated successfully')

    } catch (error) {
        next(error);
    }
}

// Logout Users
export const userLogout = async(req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({message: 'No token provided.'});
        }

        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000)

        await BlacklistModel.create({token, expiresAt});

        res.json({message: 'Successfully logged out!'})
    } catch (error) {
        next(error);
    }
}