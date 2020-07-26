'use strict';

const path = require('path')
require('dotenv').config({path: path.resolve(__dirname,'.env')})
const mysql = require('mysql')
console.log(__dirname);
console.log(process.env.DB_HOST);
console.log(process.env.DB_USER);

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'photomap'
});
con.connect((err)=>{
    if(err) throw err;
    console.log('Connected!');
});

let markers = [];

con.query('SELECT * FROM markers',(err,rows)=>{
    if(err) throw err;
    //console.log(rows);
    markers = rows;
})

//express

const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = 3000;

app.use(express.static(__dirname+'/public'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname+'/public/index.html')));
app.get('/test', (req, res) => res.send("test"));

app.listen(port, () => console.log(`app listening at http://localhost:${port}`));

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

app.get('/get-markers', async (req,res)=>{
    res.json(JSON.stringify(markers));
});

app.post('/add-marker', (req,res)=>{
    console.log("inserting marker into the database..");
    let received_data = req.body;
    console.log(received_data);
    
    con.query("INSERT INTO markers VALUES ("+con.escape(received_data.id)+","+con.escape(received_data.name)+","+con.escape(received_data.description)+","+con.escape(received_data.lat)+","+con.escape(received_data.lng)+")",(err)=>{
        if(err) throw err;
    });
    
    update_markers();
    
    res.sendStatus(200); 
});

app.post('/delete-marker', (req,res)=>{
    console.log("deleting marker from the database..");
    let received_data = req.body;
    console.log(received_data);
    
    con.query("DELETE FROM markers WHERE id="+con.escape(received_data.id),(err)=>{
        if(err) throw err;
    });
    update_markers();

    res.sendStatus(200); 
});

app.post('/modify-marker', (req,res)=>{
    console.log("modifying marker in the database..");
    let received_data = req.body;
    console.log(received_data);

    con.query("UPDATE markers SET "+received_data.modify_type+"="+con.escape(received_data.modify_to)+" WHERE id="+con.escape(received_data.id),(err)=>{
        if(err) throw err;
    });
    update_markers();
    res.sendStatus(200); 
});

//image upload

const multer = require('multer');
let upload = multer({ dest: 'public/uploads/' })

app.post('/post-photo', upload.single('photo') , function (req, res, next) {
    if(req.file) {
        console.log("received photo:"+req.file.filename);
        var marker = req.body.marker;
        var name = "name";
        con.query("INSERT INTO photos VALUES ("+con.escape(req.file.filename)+", "+con.escape(name)+", "+marker+")",(err)=>{
            if(err) throw err;
        });
        res.sendStatus(200); 
    }
    else throw 'error';
  })

app.get('/get-photos', function(req,res){
    //console.log("get photos");
    con.query('SELECT * FROM photos',(err,rows)=>{
        if(err) throw err;
        res.json(JSON.stringify(rows));
    })
})

app.get('/listview', (req, res) => res.sendFile(path.join(__dirname+'/public/listview.html')));

app.get('/id', (req, res) => {
    res.sendFile(path.join(__dirname+'/public/page.html'));
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that! 404 xc")
  });

function update_markers(){
    con.query('SELECT * FROM markers',(err,rows)=>{
        if(err) throw err;
        console.log(rows);
        markers = rows;
    })
}