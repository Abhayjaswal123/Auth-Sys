import userModel from "../models/usermodel.js";

export const getUserData = async (req, res) => {

    try{
        const userId = req.userId;

        const userData = await userModel.findById(userId);
        if(!userData){
            return res.json({ success: false, message: "User not found" });
        }

        res.json({
            success: true,
            userData: {
                name: userData.name,
                isAccountVerified: userData.isAccountVerified
            }
        });
    }
    catch(error){
        res.json({ success: false,  message: error.message });
    }
}
