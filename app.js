const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
const mysql = require("mysql2");
const app = express();
const moment = require('moment');
app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
const fs = require('fs')
const multer = require('multer')
const csv = require('fast-csv');
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
    branch: String,
    complaint: Array,
    selectedValue: String
};
const complaintSchema = {
    complaint: Array
}
const User = new mongoose.model("User", UserSchema);
var con = mysql.createPool({
    host: "sql6.freesqldatabase.com",
    user: "sql6634222",
    password: "xGBIcrq3BP",
    database: "sql6634222",
    multipleStatements: true
});
// multer library configuration 
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './')
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
//??pass the stroage to multer library ka constructor means we store it locally for the time being
let upload = multer({
    storage: storage
});

//------------ Functions ----------------//

function uploadcsv(path, Year_chosen, res) {
    let stream = fs.createReadStream(path);
    let DataCollection = [];
    let filestream = csv
        .parse()
        .on('data', function (data) {
            DataCollection.push(data) //passes the extracted data from the stored file in uploads folder to itself 
        })
        .on('end', function () {
            DataCollection.shift(); //passes the extracted data from the stored file in uploads folder to itself 
            con.getConnection((error, connection) => {
                if (error) {
                    console.error(error);
                    return;
                } else {
                    query = `
    INSERT INTO students_to_be_alloc (timeStamps, name, email_id, SID, city_state, fees_paid, batch, branch)
    VALUES ?;
    INSERT INTO distinct_students_to_be_alloc (timeStamps, name, email_id, SID, city_state, fees_paid, batch, branch)
    SELECT timeStamps, name, email_id, SID, city_state, fees_paid, batch, branch
    FROM students_to_be_alloc
    WHERE SID NOT IN (SELECT SID FROM distinct_students_to_be_alloc);
    delete from students_to_be_alloc;
    UPDATE distinct_students_to_be_alloc AS s
    JOIN (
       SELECT
          s.SID,
          h.room_number
       FROM (
          SELECT SID,
             (ROW_NUMBER() OVER (ORDER BY RAND()) % (SELECT COUNT(*) FROM distinct_students_to_be_alloc WHERE fees_paid = 'yes')) + 1 AS rn
          FROM distinct_students_to_be_alloc
          WHERE fees_paid = 'yes' and batch =? and Room_assigned IS NULL
       ) AS s
       JOIN (
          SELECT room_number,
             ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
          FROM hostel_rooms
       ) AS h
       ON s.rn = h.rn
    ) AS dt
    ON s.SID = dt.sid
    SET s.Room_assigned = dt.room_number; 
    
       UPDATE hostel_rooms AS h
    JOIN distinct_students_to_be_alloc AS s ON s.room_assigned = h.room_number
    SET h.room_status = 'unavailable';
  delete from Saved_results;  
 insert into Saved_results (name ,email_id ,SID ,batch , room_number,floor,block)    
 SELECT distinct_students_to_be_alloc.name, distinct_students_to_be_alloc.email_id, distinct_students_to_be_alloc.SID, 
    distinct_students_to_be_alloc.batch, hostel_rooms.room_number, hostel_rooms.floor, hostel_rooms.block
    FROM distinct_students_to_be_alloc
    JOIN hostel_rooms ON distinct_students_to_be_alloc.Room_assigned = hostel_rooms.room_number and batch=?;
select * from Saved_results order by room_number  ASC;
    
       `;

                    con.query(query, [DataCollection, Year_chosen, Year_chosen], (error, results) => {

                        if (error) {
                            console.log(error);
                        } else {
                            console.log("Sexy Bancho");
                            const data = results[results.length - 1]; // Assuming the last result set contains the desired data

                            // Render the EJS template and pass the data as a variable
                            res.render('allocation_results', {
                                data: data
                            });
                        }

                    });
                }
            });
            fs.unlinkSync(path);
        });

    stream.pipe(filestream);
}

//------------ Get ----------------------//
app.get("/", (req, res) => {
    res.render("landing_page");
});
app.get("/login", function (req, res) {
    res.render("login", {
        message: "hidden",
        alert: "hidden"
    });
});

app.get("/register", function (req, res) {
    res.render("register", {
        message: "hidden",
        exist: "hidden"
    })
});

app.get("/checkAlloat", async (req, res) => {
    const data = await app.get('data');

    con.getConnection(function (err) {
        if (err) throw err;
        con.query("SELECT * FROM distinct_students_to_be_alloc WHERE SID = " + data.sid, async function (err, result, fields) {
            if (err) throw err;
            res.render("checkAlloat", {
                data: result
            });
        });
    });
});

app.get("/search", (req, res) => {
    con.getConnection(function (err) {
        if (err) throw err;
        con.query("SELECT * FROM distinct_students_to_be_alloc;", function (err, result, fields) {
            if (err) throw err;
            res.render("search", {
                data: result
            });
        });
    });
});
app.get("/searching", async (req, res) => {
    var name = req.query.name;
    var sid = req.query.sid;

    con.getConnection(async function (err) {
        if (err) throw err;
        con.query("SELECT * FROM distinct_students_to_be_alloc WHERE name like '%" + name + "%' AND SID like '%" + sid + "%';", async function (err, result, fields) {
            if (err) throw err;
            var data = result;
            res.send(data);
        });
    });
});

app.get("/api", (req, res) => {
    User.findOne({
        sid: "86664976"
    }).then((data) => {
        res.json(data.complaint);
    });
});
app.get("/list", (req, res) => {
    User.findOne({
        sid: "86664976"
    }).then((data) => {
        res.render('complaint-list');
    });
});
app.get("/landing_page", function (req, res) {
    res.render("landing_page");
});
app.get("/register", function (req, res) {
    res.render("register", {
        message: "hidden",
        exist: "hidden"
    });
});

app.get("/status_warden", function (req, res) {
    res.render("status_warden");
})
app.get("/about", function (req, res) {
    res.render("about");
});


//------------ Post ---------------------//
app.post('/complaint-x', async (req, res) => {
    res.render("complaint-list");
});
app.post('/complaint', async (req, res) => {
    try {
        const complaint = req.body.complaint;
        const date = new Date().getTime()
        const data = app.get('data');
        const sid = data.sid;
        User.findOne({
            sid: "86664976"
        }).then(async (data) => {
            data.complaint.push({
                complaint: complaint,
                timestamp: date,
                sid: sid
            });
            data.save();
        });
        res.render("student", {
            name: data.name,
            sid: data.sid,
            branch: data.branch,
            hostel: data.hostel,
            room: data.room,
            alert: ""
        });
    } catch {
        console.log("Error");
    }

});
app.post("/register", async (req, res) => {
    const data = await User.findOne({
        sid: req.body.sid
    }).then(async (data) => {
        if (data) {
            res.render("register", {
                message: "hidden",
                exist: ""
            })
        } else {
            if (req.body.password === req.body.cpassword) {
                await User.create({
                    name: req.body.username,
                    email: req.body.email,
                    sid: req.body.sid,
                    password: req.body.password,
                    selectedValue: "Student"
                });
                console.log("User Created");
                res.render("login", {
                    message: "hidden",
                    alert: ""
                });
            } else {
                res.render("register", {
                    message: "",
                    exist: "hidden"
                })
            }
        }
    })

})
app.post("/complaint-ren", (req, res) => {
    res.render("complaint");
})
app.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const selectedValue = req.body.Positions;
        const data = await User.findOne({
            email: username
        });
        app.set('data', data);
        if (data.password === password && data.selectedValue === selectedValue) {
            if (data.selectedValue == 'Student') {
                res.render("student", {
                    name: data.name,
                    sid: data.sid,
                    branch: data.branch,
                    hostel: data.hostel,
                    room: data.room,
                    email: data.email,
                    alert: "hidden"
                });
            } else if (data.selectedValue == 'Warden') {
                User.find().then((data) => {
                    res.render('warden', {
                        data: data
                    });
                })
            }
        } else {
            res.render("login", {
                message: "",
                alert: "hidden"
            });
        }
    } catch (error) {
        res.render("login", {
            message: "",
            alert: "hidden"
        });
    }
});

app.post('/import-csv', upload.single("import-csv"), (req, res) => {
    console.log(req.file.path);
    const Year_chosen = req.body.Positions;
    uploadcsv(__dirname + "/" + req.file.path, Year_chosen, res);
    var file_path = req.file.path;
});


app.post('/room_status', (req, res) => {
    var Year_chosen = req.body.room_status;
    console.log('I am the storm');
    console.log(Year_chosen);
    con.getConnection((error, connection) => {
        if (error) {
            console.error(error);
            return;
        } else {
            query = `
           
    
        select * from hostel_rooms  where room_status=? order by room_number ASC;
            
               `;

            con.query(query, [Year_chosen], (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    const data = results; // Assuming the last result set contains the desired data

                    // Render the EJS template and pass the data as a variable
                    res.render('availability_status', {
                        data: data
                    });
                }
            });
        }
    })

});

app.post("/status", (req, res) => {
    res.render("status_warden.ejs")
});


app.post('/deallocated', (req, res) => {
    var Year_chosen = req.body.deallocated;
    console.log('Reached the deallocated endpoint');
    console.log(Year_chosen);
    query = `
        delete from saved_results;
        UPDATE hostel.hostel_rooms
        SET room_status = 'available'
        WHERE room_number IN (
          SELECT Room_assigned
          FROM distinct_students_to_be_alloc
          WHERE batch = ?
        ) AND room_status = 'unavailable';
        update distinct_students_to_be_alloc set Room_assigned=null where distinct_students_to_be_alloc.batch=? ; 
        
          `;


    con.query(query, [Year_chosen, Year_chosen], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Inncents Die");
            res.render('upload', {
                message: ""
            });
        }
    })
});



app.post('/upload', (req, res) => {
    res.render("upload", {
        message: "hidden"
    })
});


//------------------ Starting Server ----------------------//

app.listen(port, function () {
    console.log(`Server listening on port ${port}`);
});