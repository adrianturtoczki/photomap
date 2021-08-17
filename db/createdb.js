var mysql = require('mysql');

const path = require('path')
console.log(path.resolve(__dirname,'../.env'));
require('dotenv').config({path: path.resolve(__dirname,'../.env')})

var con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE IF NOT EXISTS "+process.env.DB_DATABASE_NAME, function (err, result) {
    if (err) throw err;
    con.query("USE "+process.env.DB_DATABASE_NAME, (error, results, fields) => {
      con.query("CREATE TABLE IF NOT EXISTS markers(id int(10) primary key auto_increment, name varchar(150), description text, lat float(10,6), lon float(10,6), user int(10)  )", function (err, result) {
        if (err) throw err;
        console.log("markers created");
      });
      con.query("CREATE TABLE IF NOT EXISTS photos(id varchar(100), name varchar(100), marker int(10), user int(10) )", function (err, result) {
        if (err) throw err;
        console.log("photos created");
      });
      con.query("CREATE TABLE IF NOT EXISTS ratings(id int(10) primary key auto_increment, marker int(10), rating int(10), user int(10))", function (err, result) {
        if (err) throw err;
        console.log("ratings created");
      });
      con.query("CREATE TABLE IF NOT EXISTS users(id int(10) primary key auto_increment, username varchar(10), password binary(60))", function (err, result) {
        if (err) throw err;
        console.log("users created");
      });
    });
    console.log("Database created");
  });
});
