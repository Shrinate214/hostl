
const express = require('express');
const bodyParser = require('body-parser');
const ejs=require("ejs");
const mongoose=require("mongoose");
const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const port = 3000;
const path= require("path");

mongoose.connect("mongodb://127.0.0.1:27017/userDB",{useNewUrlParser:true});
const UserSchema={
    email:String,
    password:String,
    name: String,
    sid: Number,
    hostel: String,
    room: Number,
     selectedValue:String 
};
const User= new mongoose.model("User",UserSchema)
app.get("/home",function(req,res){
    res.render("home");
});


app.post("/register",function(req,res){
    const newUser=new User({
        email:req.body.username,
        password:req.body.password,
           selectedValue:req.body.Positions
    });
newUser.save()
.then(()=>{
    console.log(newUser);
})
res.redirect("login");}
);

app.get("/home",function(req,res){
    res.render("home");
});
app.get("/register",function(req,res){
    res.render("register");
})
app.get("/",function(req,res){
    res.render("login");
})
app.post("/login",async (req,res)=>{
    try{ const username= req.body.username;
    const password= req.body.password;
    const selectedValue=req.body.Positions;
   const useremail=await User.findOne({email:username});

    if (useremail.password===password && useremail.selectedValue===selectedValue)
    { 
        if (useremail.selectedValue=='Student') 
    {
        res.redirect("secrets");
    }
         else if  (useremail.selectedValue=='Warden') 
    {   res.redirect("submit");
    }
    }

    else{  console.log(useremail);
     console.log(useremail);
}
}
catch(error){
    console.log(error);
}}
);
app.get("/secrets",function(req,res){
    res.render("secrets");
});

app.listen(port, function()  {
    console.log(`Weather app listening on port ${port}`);
  });
