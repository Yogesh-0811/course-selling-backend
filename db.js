const mongoose = require('mongoose');
// mongoose.connect("mongodb+srv://yogesh:Yogesh0811@cluster15.wrgi9d7.mongodb.net/coursera-app")
//use dotenv to store the connection string
const { Schema } = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const userSchema = new Schema({
    id : {
        type: String
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
    },
    firstName: String,
    lastName: String
})

const adminSchema = new Schema({
    id : {
    type: String
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
    },
    firstName: String,
    lastName: String
})

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId
})

const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
})

const userModel = mongoose.model("user", userSchema);
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

module.exports={
    userModel,
    adminModel,
    courseModel,
    purchaseModel
}
