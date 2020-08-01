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
    database: process.env.DB_DATABASE_NAME
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
app.listen(port, () => console.log(`app listening at http://localhost:${port}`));

app.get('/', (req, res) => res.sendFile(path.join(__dirname+'/public/index.html')));

app.use(function(req, res, next) {
    console.log('handling request for: ' + req.url);
    next();
  });

//login

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    console.log("serialize called");
    console.log(user);
    done(null, user);
});

// used to deserialize the user
passport.deserializeUser(function(username, done) {
    console.log("deserialize called");
    console.log(username);
        con.query("select * from users where username = "+con.escape(username),function(err,rows){
        done(err, rows[0]);
    });
});

var session = require('express-session');
var bcrypt = require('bcrypt')

app.use(express.urlencoded({extended:false}));
app.use(session({ secret: process.env.EXPRESS_SECRET,
                  name: 'login-cookie',
                  resave : true,
                  saveUninitialized: true          
                })); // session
app.use(passport.initialize());
app.use(passport.session());

passport.use('signup',new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
},
  function(req,username, password, done) {
      console.log("passport signup..");
      console.log(username);
      console.log(password);
      console.log("users:");

      let exists = false;
      con.query("select username from users",function(err,rows){	
          console.log("select");
        console.log(rows);
        for (let i = 0; i < rows.length;i++){
            if (rows[i].username==username){
                exists=true;
            }
        }
        if (!exists){
            con.query("INSERT INTO users(username,password) VALUES ("+con.escape(username)+","+con.escape(bcrypt.hashSync(password,10))+")",(err)=>{
                if(err) throw err;
            });
            console.log("signup complete");
            return done(null,username);
        } else {
            console.log("Username already exists!");
            return done(null,false);
        }
    });
  }));
passport.use('login',new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
},
  function(req,username, password, done) {
      console.log("passport login..");
            con.query("SELECT * FROM users WHERE username="+con.escape(username),(err,rows)=>{
                if(err) throw err;
                let accepted_pw = bcrypt.compareSync(password,rows[0].password.toString());
                console.log(password,rows[0].password.toString());
                console.log("select result: ",accepted_pw);

                console.log(accepted_pw);
                if (accepted_pw){
                    console.log("good password");
                    return done(null,username);
                } else {
                    console.log("wrong password");
                    return done(null,false);
                }
            });
  }));

app.post('/login', passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/login-page'
}));

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
    });

app.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/signup-page'
}));

app.get('/login-page', (req, res) => res.sendFile(path.join(__dirname+'/public/login.html')));
app.get('/signup-page', (req, res) => res.sendFile(path.join(__dirname+'/public/signup.html')));

app.get('/api/user-data', function(req, res) {

    if (req.user === undefined) {
        // The user is not logged in
        res.json({username: {}});
    } else {
        res.json({
            username: req.user.username,
            id: req.user.id
        });
    }
});



app.get('/user/*',(req,res)=>res.sendFile(path.join(__dirname+'/public/user.html')));

//

app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());

app.get('/get-markers', async (req,res)=>{
    res.json(JSON.stringify(markers));
});

app.post('/add-marker', (req,res)=>{
    console.log("inserting marker into the database..");
    let received_data = req.body;
    console.log(received_data);

    console.log(req.user);
    
    con.query("INSERT INTO markers(name,description,lat,lon,user) VALUES ("+con.escape(received_data.name)+","+con.escape(received_data.description)+","+con.escape(received_data.lat)+","+con.escape(received_data.lng)+","+req.user.id+")",(err)=>{
        if(err) throw err;
    });
    
    update_markers();
    
    res.redirect('/');
});

app.post('/delete-marker', (req,res)=>{
    console.log("deleting marker from the database..");
    let received_data = req.body;
    console.log(received_data);
    
    con.query("DELETE FROM markers WHERE id="+con.escape(received_data.id),(err)=>{
        if(err) throw err;
    });
    update_markers();

    res.redirect('/');
});

app.post('/modify-marker', (req,res)=>{
    console.log("modifying marker in the database..");
    let received_data = req.body;
    console.log(received_data);

    con.query("UPDATE markers SET "+received_data.modify_type+"="+con.escape(received_data.modify_to)+" WHERE id="+con.escape(received_data.id),(err)=>{
        if(err) throw err;
    });
    update_markers();
    res.redirect('/');
});

//image upload

const multer = require('multer');
let upload = multer({ dest: 'public/uploads/' })

app.post('/post-photo', upload.single('photo') , function (req, res, next) {
    if(req.file&&req.user!=null) {
        console.log("received photo:"+req.file.filename);
        var marker = req.body.marker;
        var name = "name";
        con.query("INSERT INTO photos VALUES ("+con.escape(req.file.filename)+", "+con.escape(name)+", "+marker+","+req.user.id+")",(err)=>{
            if(err) throw err;
        });
        res.redirect('/id?id='+req.body.marker);
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

app.get('/get-ratings', async (req,res)=>{
    con.query('SELECT * FROM ratings',(err,rows)=>{
        if(err) throw err;
        //console.log(rows);
        res.json(JSON.stringify(rows));
    })
});

app.post('/post-ratings', async (req,res)=>{
    
    if (req.body.rating>=1&&req.body.rating<=5&&req.user!=null){
        console.log(req.user.id);
        console.log(req.user.username);
        con.query('INSERT INTO ratings(marker, user,rating) VALUES ('+con.escape(req.body.marker)+','+req.user.id+','+req.body.rating+')',(err,rows)=>{
            if(err) throw err;
            //console.log(rows);
        })
    }
    
    console.log(req.body);
    res.redirect('/id?id='+req.body.marker);
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that! 404 xc")
  });

function update_markers(){
    con.query('SELECT * FROM markers',(err,rows)=>{
        if(err) throw err;
        //console.log(rows);
        markers = rows;
    })
}