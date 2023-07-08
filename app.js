const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));

const port = 3000;
const path = require("path");
const {
    log
} = require('console');

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {
    useNewUrlParser: true
});
const UserSchema = {
    email: String,
    password: String,
    name: String,
    sid: Number,
    hostel: String,
    room: Number,
    branch: String,
    complaint: Array,
    selectedValue: String
};
const User = new mongoose.model("User", UserSchema);

//------------ Get ----------------------//

app.get("/", function (req, res) {
    res.render("login");
})
app.get("/warden", (req, res) => {
    res.render('warden')
})

//------------ Post ---------------------//
app.post('/student', async (req, res) => {
    try {
        const sid = req.body.studentid;
        const complaint = req.body.complaint;
        const data = await User.findOne({
            sid: sid
        });
        data.complaint.push(complaint);
        data.save()
        res.render("student", {
            name: data.name,
            sid: data.sid,
            branch: data.branch,
            hostel: data.hostel,
            room: data.room
        });
    } catch {
        console.log("Error");
    }

});
app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save()
        .then(() => {
            console.log("fuck off");
        })
    res.render("login");
})
app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const selectedValue = req.body.Positions;
        const data = await User.findOne({
            email: username
        });

        if (useremail.password === password && useremail.selectedValue === selectedValue) {
            if (useremail.selectedValue == 'Student') {
                res.render("student", {
                    name: data.name,
                    sid: data.sid,
                    branch: data.branch,
                    hostel: data.hostel,
                    room: data.room
                });
            } else if (useremail.selectedValue == 'Warden') {
                res.redirect("warden");
            }
        }
    } catch (error) {
        console.log("chud gya bro");
    }
});

app.listen(port, function () {
    console.log(`Weather app listening on port ${port}`);
<<<<<<< HEAD
});
=======
});
>>>>>>> 9abc659a8f028b37a7cfd87a9e0a97044712e5ab
