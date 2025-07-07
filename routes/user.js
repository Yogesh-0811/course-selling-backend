
// const express = require('express');
// const Router = express.Router;
const bcrypt = require('bcrypt');
const { z }=require('zod');
const jwt = require('jsonwebtoken');
const { JWT_USER_PASSWORD } = require("../config");
const { userMiddleware } = require("../middleware/user");
const { Router } = require('express');
const { userModel, purchaseModel, courseModel } = require('../db');

const userRouter = Router();

userRouter.post("/signup",async function(req,res){

    const signUpSchema = z.object({
        email: z.string().email(),
        password: z.string().min(4).max(16),
        firstName: z.string().min(1).max(20),
        lastName: z.string().min(1).max(20)
    })
    const parsed = signUpSchema.safeParse(req.body);
    if(!parsed.success){
        return res.status(400).json({
            message: "Invalid Input",
            errors: parsed.error.errors
        });
    }
    const { email,password,firstName,lastName } = parsed.data;
    //put inside try catch
    try{
        const hashedPassword = await bcrypt.hash(password, 5);
        await userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        });
        res.json({ message: "Signup successfull" });
    }catch (err){
        console.error(err);
        res.status(500).json({message: "Something went wrong while signing up"});
    }
    
})


userRouter.post("/signin",async function(req,res){
    const signinSchema = z.object({
        email:z.string().email(),
        password:z.string().min(4).max(16)
    });

    const parsed = signinSchema.safeParse(req.body);
    if(!parsed.success){
        res.status(400).json({
            message:"Invalid input",
            errors: parsed.error.errors
        });
    }
    const {email,password} = parsed.data;

    try{
        const user = await userModel.findOne({
            email: email
        });
        if(!user){
            return res.status(400).json({message: "User not found"});
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(403).json({message: "Incorrect password"});
        }

        const token = jwt.sign({
            id:user._id
        },JWT_USER_PASSWORD);

        //Do cookie logic later 

        res.json({
            message: "Login successfull",
            token
        });
    }catch (err){
        console.error(err)
        res.status(500).json({message: "Internal server error"});
    }
});

userRouter.get("/purchases", userMiddleware, async function(req,res){
 const userId = req.userId;

    try {
        // Step 1: Find all courseIds this user has purchased
        const purchases = await purchaseModel.find({ userId });

        const courseIds = purchases.map(p => p.courseId);

        // Step 2: Fetch course details
        const courses = await courseModel.find({ _id: { $in: courseIds } });

        res.json({
            message: "Purchased courses fetched successfully",
            courses
        });
    } catch (err) {
        console.error("Error fetching purchases:", err);
        res.status(500).json({ message: "Failed to fetch purchased courses" });
    }
})

module.exports = {
    userRouter: userRouter
}