require('dotenv').config();
console.log(process.env.MONGO_URL);
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// const jwt = require('jsonwebtoken');
// JWT_SECRET = "0815";

//import
const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const{ adminRouter } = require("./routes/admin");

// createUserRoutes(app);
// createCourseRoutes(app);


app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/admin", adminRouter);

async function main(){
    //dotenv
    await mongoose.connect(process.env.MONGO_URL);
    app.listen(3000);
}

main();
