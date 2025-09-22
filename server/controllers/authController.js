import bcrypt from 'bcryptjs';
import  Jwt  from 'jsonwebtoken';
import userModel from '../models/usermodel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE} from '../config/emailTemplate.js';

// Register user
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false , message: "All fields are required" });
    }

    try {

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = Jwt.sign({id : user._id}, 
            process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, { httpOnly: true,
          sameSite: 'None',
secure: true ,
            maxAge: 1 * 60 * 60 *1000 // 1 hour
         });
//sending welcome email
         const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our Platform',
            text: `Hello ${name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`
        };

        await transporter.sendMail(mailOptions);

         return res.json({success : true});

    }

    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required" });
    }

    try{
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

         const token = Jwt.sign({id : user._id}, 
            process.env.JWT_SECRET, {expiresIn: '1h'});

        res.cookie('token', token, { httpOnly: true,
             sameSite: 'None',
secure: true ,
            maxAge: 1 * 60 * 60 *1000 // 1 hour
         });

         return res.json({ success: true });

    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Logout user
export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({ success: true, message: "Logged Out" });
    }
     catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Send verification OTP
export const sendVerifyOtp = async (req, res) => {
    try {
        const userId  = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified" });
        }
       const otp = String(Math.floor(100000 + Math.random() * 900000));
       user.verifyOtp = otp;
       user.verifyOtpExpiry = Date.now() + 20 * 60 * 1000; // 20 minutes
       await user.save();

       const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Your Account Verification OTP',
        //text: `Hello ${user.name},\n\nYour OTP for account verification is: ${otp}\nThis OTP is valid for 20 minutes.\n\nBest regards,\nThe Team`,
        html : EMAIL_VERIFY_TEMPLATE.replace("{{otp}}",otp).replace("{{email}},user.email")
    }
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to your email" });
}
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Verify email with OTP
export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const userId = req.userId;

    if (!userId || !otp) {
        return res.json({ success: false, message: "User ID and OTP are required" });
    }

    try{
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if( user.verifyOtp==="" || user.verifyOtp !== otp){
            return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpiry < Date.now()) {
        return res.json({ success: false, message: "OTP has expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiry = 0;
    await user.save();
    return res.json({ success: true, message: "Account verified successfully" });
}
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// verify user authentication status
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: "User is authenticated" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

//send reset password otp
export const sendResetPasswordOtp = async (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.json({ success: false, message: "Email is required" });
    }

    try{
        const user = await userModel.findOne({ email});
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

       user.resetPasswordOtp = otp;
       user.isResetPasswordOtpExpire = Date.now() + 20 * 60 * 1000; // 20 minutes

       await user.save();

       const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Your Account Verification OTP',
        // text: `your OTP for password reset is: ${otp}\nThis OTP is valid for 20 minutes.\n\nBest regards,\nThe Team`,
        html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}",otp).replace("{{email}},user.email")
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to your email" });
    }

    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// reset password
export const resetPassword =  async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if(!email || !otp || !newPassword){
        return res.json({success: false, message: "All fields are required"});
    }

    try{
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if( user.resetPasswordOtp==="" || user.resetPasswordOtp !== otp){
            return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.isResetPasswordOtpExpire < Date.now()) {
        return res.json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordOtp = "";
    user.isResetPasswordOtpExpire = 0;
    await user.save();
    return res.json({ success: true, message: "Password reset successfully" });
}
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
//verify reset otp controller
export const verifyResetOtp =  async (req, res) => {
    const { email, otp } = req.body;

    if(!email || !otp ){
        return res.json({success: false, message: "All fields are required"});
    }

    try{
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if( user.resetPasswordOtp==="" || user.resetPasswordOtp !== otp){
            return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.isResetPasswordOtpExpire < Date.now()) {
        return res.json({ success: false, message: "OTP has expired" });
    }

    return res.json({ success: true, message: "Otp Verified" });
}
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}