const { Router } = require('express');
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const jwt = require('jsonwebtoken');
const { JWT_ADMIN_PASSWORD } = require("../config");
const z = require('zod');
const bcrypt = require('bcrypt');
const { adminMiddleware } = require('../middleware/admin');

adminRouter.post("/signup", async function(req,res){
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
        await adminModel.create({
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


adminRouter.post("/signin", async function(req,res){
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
        const admin = await adminModel.findOne({
            email:email
        });
        if(!admin){
            return res.status(400).json({message: "User not found"});
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);
        if(!passwordMatch){
            return res.status(403).json({message: "Incorrect password"});
        }

        const token = jwt.sign({
            id:admin._id
        },JWT_ADMIN_PASSWORD);

        //Do cookie logic later 

        res.json({
            message: "Login successfull",
            token
        });
    }catch (err){
        console.error(err)
        res.status(500).json({message: "Internal server error"});
    }
})
adminRouter.post("/course", adminMiddleware, async function(req,res){

    const adminId = req.userId;
    const { title, description, imageUrl, price } = req.body;

    const course = await courseModel.create({
        title,
        description,
        imageUrl,
        price,
        creatorId : adminId
    })

    res.json({
        message: "Course created",
        courseId: course._id
    })
})
adminRouter.put("/courses", adminMiddleware, async function(req,res){

    const adminId = req.userId;
    const { title, description, imageUrl, price, courseId } = req.body;

    const course = await courseModel.updateOne({
        _id: courseId,
        creatorId: adminId
    },
    {
        title,
        description,
        imageUrl,
        price,
    })
    res.json({
        message: "Course updated",
        courseId: course._id
    })
})

adminRouter.get("/course/bulk", adminMiddleware, async function(req,res){
 console.log("✅ Reached /course/bulk route");

    const adminId = req.userId;
    console.log("Admin ID:", adminId);

    try {
        const courses = await courseModel.find({creatorId: adminId});

        console.log("Courses found:", courses.length);

        res.json({
            message: "Courses fetched",
            courses
        });
    } catch (err) {
        console.error("Error fetching courses:", err);
        res.status(500).json({ message: "Internal server error" });
    }
})
module.exports = {
    adminRouter: adminRouter
}