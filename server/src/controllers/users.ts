// server/src/controllers/user.ts
import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user";
import bcrypt from "bcrypt";
import sendEmail from '../util/sendEmail';
import crypto from "crypto";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.session.userId).select("+email").exec();
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

interface SignUpBody {
    username?: string;
    email?: string;
    password?: string;
    vip?: boolean;
}

export const signUp: RequestHandler = async (req, res, next) => {
    const { username, email, password: passwordRaw, vip } = req.body as SignUpBody;
    try {
        if (!username || !email || !passwordRaw) {
            throw createHttpError(400, "Parameters missing");
        }

        const existingUsername = await UserModel.findOne({ username }).exec();
        if (existingUsername) {
            throw createHttpError(409, "Username already taken. Please choose a different one or log in instead.");
        }

        const existingEmail = await UserModel.findOne({ email }).exec();
        if (existingEmail) {
            throw createHttpError(409, "A user with this email address already exists. Please log in instead.");
        }

        const passwordHashed = await bcrypt.hash(passwordRaw, 10);
        const newUser = await UserModel.create({ username, email, password: passwordHashed, vip });
        req.session.userId = newUser._id;
        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

interface LoginBody {
    username?: string;
    password?: string;
}

export const login: RequestHandler = async (req, res, next) => {
    const { username, password } = req.body as LoginBody;

    if (typeof password !== 'string') {
        return res.status(400).send('Password is required');
    }

    try {
        const user = await UserModel.findOne({ username }).select("+password").exec();
        if (!user) {
            throw createHttpError(401, "Invalid credentials - User not found.");
        }

        if (typeof user.password !== 'string') {
            throw createHttpError(500, "An unexpected error occurred.");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw createHttpError(401, "Invalid credentials - Password does not match.");
        }

        req.session.userId = user._id;
        res.status(200).json({ message: "Login successful!" });
    } catch (error) {
        next(error);
    }
};




export const logout: RequestHandler = (req, res, next) => {
    req.session.destroy((error) => {
        if (error) {
            return next(error);
        }
        res.sendStatus(200);
    });
};

export const updatePassword: RequestHandler = async (req, res) => {
    const userId = req.session.userId;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    const { newPassword } = req.body as any;
    if (!newPassword) {
        throw createHttpError(400, "New password required");
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    await UserModel.findByIdAndUpdate(userId, { password: hashedPassword });
    res.status(200).json({ message: "Password updated successfully" });
};

export const requestPasswordReset: RequestHandler = async (req, res, next) => {
    const { email } = req.body;
    let user;
    try {
        user = await UserModel.findOne({ email }).select('+email +passwordResetToken +passwordResetExpires');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please go to the following URL to reset your password: \n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });

        res.status(200).json({ message: 'Token sent to email!' });
    } catch (error) {
        if (user) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }
        next(error);
    }
};


export const resetPassword: RequestHandler = async (req, res, next) => {
    console.log("Reset password called with token:", req.params.token);

    const { token } = req.params;
    const { password } = req.body;
    console.log("Request URL:", req.originalUrl);
    console.log("Request Method:", req.method);

    if (!password) {
        return res.status(400).send({ message: "Password is required." });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        const user = await UserModel.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(404).send('Token is invalid or has expired');
        }


        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.status(200).send('Password has been reset successfully');
    } catch (error) {
        console.error('Reset password error:', error);
        next(error);
    }
};