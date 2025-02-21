import {User} from "../models/user.model.js";
import bcryptjs from "bcryptjs"
import  crypto from "crypto";
import {generateTokenAndSetCookie} from "../utils/generateTokenAndSetCookie.js";
import {
    sendResetPasswordEmail, sendResetSuccessEmail,
    sendVerificationEmail,
    sendWelcomeEmail
} from "../mailtrap/emails.js";


export const registerController = async(req,res)=>{
    const {email,password,name} = req.body;
    try{
        //validation
        if(!email || !name || !password){
            throw new Error("All fields are required")
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({success : false, message : "User already exists"})
        }

        const hashedPassword = await bcryptjs.hash(password,10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = new User({
            email,
            password : hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt : Date.now() + 24 * 60 * 60 *1000, //24 hrs
        });

        await newUser.save();

        generateTokenAndSetCookie(res,newUser._id)

        await sendVerificationEmail(newUser.email,verificationToken);

        res.status(201).json({
            success : true,
            message : "User Created Successfully",
            user : {
                ...newUser._doc,
                password : undefined
            }
        })

    }catch(e){
        console.log("Error in Signup Controller:",e)
        res.status(500).json({
            success : false,
            message : e.message
        })
    }
}

export const verifyEmail = async(req,res) =>{
    const {code} = req.body;
    try{
        const user = await User.findOne({
            verificationToken : code,
            verificationTokenExpiresAt : { $gt : Date.now()},
        })

        // console.log("user:",user);

        if(!user){
            return res.status(400).json({
                success : false,
                message : "Invalid Verification code"
            })
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();

        await sendWelcomeEmail(user.email,user.name);

        res.status(200).json({
            success : true,
            message : "Email Verified successfully",
            user : {
                ...user._doc,
                password : undefined
            }
        })

    }catch(e){
        console.log("Error in Verifying email",e);
        res.status(500).json({
            success : false,
            message : e.message
        })
    }
}

export const loginController = async(req,res) =>{
    const {email,password} = req.body;
    try{
        const user = await  User.findOne({email});

        if(!user){
            return res.status(400).json({
                success : false,
                message : "Invalid Credentials"
            })
        }

        const isPasswordInvalid = await bcryptjs.compare(password,user.password);

        if(!isPasswordInvalid){
            return res.status(400).json({
                success : false,
                message : "Invalid credentials"
            })
        }

        generateTokenAndSetCookie(res,user._id)

        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success : true,
            message : "User LoggedIn successful",
            user : {
                ...user._doc,
                password : undefined
            }
        })

    }catch(e){
        console.log("Error in Login Controller:",e)
        res.status(500).json({
            success : false,
            message : e.message
        })
    }
}

export const logoutController = async(req,res) =>{
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

export const forgotPassword = async(req,res) =>{
    const {email} = req.body;
    try{
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({
                success : false,
                message : "User not found"
            })
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hr

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        await sendResetPasswordEmail(user.email,`${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({
            success : true,
            message : "Password Reset link sent successfully",
        })
    }catch (e){
        console.log("Error in Forgot password Controller:",e)
        res.status(500).json({
            success : false,
            message : e.message
        })
    }
}

export const resetPassword = async(req,res) =>{
    const {password} = req.body;
    const {token} = req.params;
    try{
        const user = await User.findOne({
            resetPasswordToken : token,
            resetPasswordExpiresAt : { $gt : Date.now()},
        });

        if(!user){
            return res.status(400).json({
                success : false,
                message : "Invalid or Reset token has expired"
            })
        }

        const hashedPassword = await bcryptjs.hash(password,10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await  user.save();

        await sendResetSuccessEmail(user.email);

        res.status(200).json({
            success : true,
            message : "Password Reset successfully",
            user : {
                ...user._doc,
                password : undefined
            }
        })


    }catch (e){
        console.log("Error in Reset Password Controller:",e)
        res.status(500).json({
            success : false,
            message : e.message
        })
    }
}

export const checkAuth = async(req,res) =>{
    try {
        // console.log("req.userId:",req.userId);
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({ success: false, message: error.message });
    }
}