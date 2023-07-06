const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));
const port = 3000;
const path= require("path");
const collection=require("./mongodb");
app.get("/",(req,res)=>
{
res.render("login");
});
app.get("/signup",(req,res)=>
{
res.render("signup");
});
app.post("/signup",async(req,res)=>{
const data={
  username:req.body.username,
  password:req.body.password
}
await collection.insertOne([data])
res.render("login");
})
app.listen(port, function()  {
    console.log(`Weather app listening on port 3000`);
  });
  