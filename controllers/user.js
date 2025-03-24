import { BlacklistModel, UserModel } from "../models/user.js";
import { loginUserValidator, registerUserValidator, updateUserValidator } from "../validators/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { mailTransporter } from "../utils/mail.js";
import { generateEmailTemplate } from "../utils/template.js";

// Register user
export const registerUser = async (req, res, next) => {
    try {
        // validate user input
        const { error, value } = registerUserValidator.validate(req.body);
        if (error) {
            return res.status(422).json(error);
        }

        // check if user already exists
        const user = await UserModel.findOne({ email: value.email });
        if (user) {
            return res.status(409).json('User already exist!');
        }

        // hash user password
        const hashPassword = bcryptjs.hashSync(value.password, 10);

        // save user into database
        await UserModel.create({
            ...value,
            password: hashPassword
        });

        // send email
        const emailContent = `
        <p> Dear ${value.userName}, </p>
        <h4>You have been registered successfully!</h4>
        <p>Login to enjoy the wonderful packages that awaits you...</p>
        `;

        await mailTransporter.sendMail({
            from: `FADOMART MALL <process.env.MAIL_ADDRESS>`,
            to: value.email,
            subject: "User Account Registration",
            html: generateEmailTemplate(emailContent)
        });

        // respond to request
        res.json('User Registeration Successful')
    } catch (error) {
        next(error);
    }
}

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

        const correctPassword = bcrypt.compareSync(value.password, user.password);
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