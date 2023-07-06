const mongoose =require("mongoose");
mongoose.connect("mongodb://localhost:27017/akshat");
const LoginSchema=new mongoose.Schema({
    username:{
        type:String,required:true
    },
    password:{
        type:String,required:true
    }
})
const Collection1=mongoose.model("Collection1",LoginSchema)
nodule.exports=Collection1;