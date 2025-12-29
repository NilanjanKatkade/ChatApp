import User from "../models/UserModel.js";
import  jwt  from "jsonwebtoken";
import {renameSync,unlinkSync} from "fs";


const maxAge=3*24*60*60*1000;
const createToken= (email,userId)=>{
    return jwt.sign({email,userId},process.env.JWT_KEY,{expiresIn:maxAge})
};
export const signup = async (req,res,next)=>{
    try {
        const {email,password} = req.body;
        if(!email||!password){
            return res.status(400).json({error:"Please enter both email and password"});

        }
        const user= await User.create({email,password});
        res.cookie("jwt",createToken(email,user.id),{
            maxAge,
            secure: true,
            sameSite:"None"
        });
        return res.status(201).json({
            user:{
                id:user.id,
                email:user.email,

                profileSetup:user.profileSetup,
            },
        });

    }
    catch(error){
        console.log({error});
        return res.status(500).send("Internal Server Error")
    }
}

export const login = async (req,res,next)=>{
    try {
        const {email,password} = req.body;
        if(!email||!password){
            return res.status(400).json({error:"Please enter both email and password"});
        }
        const user= await User.findOne({email});
        if(!user){
            return res.status(404).json({error:"User with given email found"});
        }
        const auth = await user.comparePassword(password);

        if(!auth){
            return res.status(404).json({error:"Invalid email or password"});
        }
        res.cookie("jwt",createToken(email,user.id),{
            maxAge,
            secure: true,
            sameSite:"None"
        });
        return res.status(200).json({
            user:{
                id:user.id,
                email:user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                profileSetup:user.profileSetup,
                color: user.color,
            },
        });

    }
    catch(error){
        console.log({error});
        return res.status(500).send("Internal Server Error")
    }
}


export const getUserInfo = async(req,res,next)=>{
    try{
        const userData= await User.findById(req.userId);
        if(!userData){
            return res.status(404).json({error:"User not found"});
        }
        console.log(req.userId);
        return res.status(200).json({
                id:userData.id,
                email:userData.email,
                firstName: userData.firstName,
                lastName:userData.lastName,
                image: userData.image,
                profileSetup:userData.profileSetup,
                color: userData.color,
        });

    }
    catch(error){
        console.log(error);
    }
}

export const updateProfile = async(req,res,next)=>{
    try{
        const {userId} = req;
        const {firstName,lastName,color} = req.body;
        if(!firstName||!lastName){
            return res.status(400).json({error:"Please fill in all fields"});
        }
        const userData = await User.findByIdAndUpdate(userId,{firstName,lastName,color,profileSetup:true,}, {new:true,runValidators:true});
        return res.status(200).json({
            id:userData.id,
            email:userData.email,
            firstName: userData.firstName,
            lastName:userData.lastName,
            image: userData.image,
            profileSetup:userData.profileSetup,
            color: userData.color,
    });
    }
    catch(error){
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
}


export const addProfileImage = async(req,res,next)=>{
    try{
        if(!req.file){
            return res.status(400).send("Please upload an image");
        }
        const date=Date.now();
        let fileName="uploads/profiles/"+date+req.file.originalname;
        renameSync(req.file.path,fileName);

        const updatedUser= await User.findByIdAndUpdate(req.userId,{image:fileName},{new:true, runValidators:true});
        console.log("Updated User Data:", updatedUser);
        return res.status(200).json({
            id:updatedUser.id,
            email:updatedUser.email,
            image: updatedUser.image,
        })

    }
    catch(error){
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const removeProfileImage= async(req,res,next)=>{
    try{
        const userData = await User.findById(req.userId);
        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if image exists
        if (userData.image) {
            try {
                unlinkSync(userData.image); // ✅ Remove file before updating DB
                console.log("Deleted file:", userData.image);
            } catch (err) {
                console.error("Error deleting file:", err);
            }
        }
        userData.image=null;
        await userData.save();

        // const DeletedData = await User.findByIdAndUpdate(req.userId,{ $unset: { image: "" } }, {new:true,runValidators:true});
        // return res.status(200).json({
        //     id:DeletedData.id,
        //     email:DeletedData.email,
        //     firstName: DeletedData.firstName,
        //     lastName:DeletedData.lastName,
        //     image: DeletedData.image,
        //     profileSetup:DeletedData.profileSetup,
        //     color: DeletedData.color,
        // })  
        return res.status(200).json({ message: "Profile image removed successfully" });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const logout = async (req, res, next) => {
    try {
      res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
      return res.status(200).send("Logout successful");
    } catch (err) {
      return res.status(500).send("Internal Server Error");
    }
  };