const express= require('express');
const app=express();

let server= require('./server');
let middleware= require('./middleware');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const MongoClient=require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017';
const dbName='hospital';
let db
MongoClient.connect(url,{useUnifiedTopology: true},(err,client) =>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});


//hospital details

app.get('/hospitaldetails',middleware.checkToken,function(req,res)  {
  var data = db.collection('hospitaldetails');
  data.find().toArray(function(err,result) {
    if(!err) {
      res.send(result);
      console.log("Success");
    }
  });
});

//ventilator details

app.get('/ventilatordetails',middleware.checkToken,function(req,res) {
  var data = db.collection('ventilatordetails');
  data.find().toArray(function(err,result) {
    if(!err) {
      res.send(result);
      console.log("Success");
    }
  });
});

//searching ventilators by status

app.post('/searchventbystatus',middleware.checkToken,function(req,res) {
  var status = req.body.status;
  var data = db.collection('ventilatordetails');
  data.find({"status":status}).toArray(function(err,result) {
    if(!err) {
      res.send(result);
      console.log("Success");
    }
  });
});

//searching ventilator by haopital name

app.post('/searchventbyname',middleware.checkToken,function(req,res) {
  var name = req.body.name;
  var data = db.collection('ventilatordetails');
  data.find({"name":new RegExp(name,'i')}).toArray(function(err,result) {
    if(!err) {
      res.send(result);
      console.log("success");
    }
  });
});

//searching hospital by hospital name

app.post('/searchhospbyname',middleware.checkToken,function(req,res) {
  var name = req.query.name;
  var data = db.collection('hospitaldetails');
  data.find({"name":new RegExp(name,'i')}).toArray(function(err,result) {
    if(!err) {
      res.send(result);
      console.log("success");
    }
  });
});

//update ventilator details

app.put(`/updateventilator`,middleware.checkToken,function(req,res){
    var ventid={ventilator_id:req.body.ventilator_id};
    console.log(ventid);
    var newvalues={$set:{status:req.body.status}};
    db.collection("ventilatordetails").updateOne(ventid,newvalues,function(err,result){
        res.json('one document updated');
        if(err)throw err;
    });
});

//add ventilator

// app.post('/addventilatorbyuser',middleware.checkToken,function(res,req) {
//   var hid = req.body.H_id;
//   var ventid = req.body.Ventilator_id;
//   var status = req.body.status;
//   var name = req.body.name;
//
//   var item = {
//     hid:hid,ventid:ventid,status:status,name:name
//   };
//   db.collection('ventilatordetails').insertOne(item,function(err,result) {
//     res.json('item inserted');
//   });
// });

//add ventilator

app.post('/addventilator',middleware.checkToken,function(req,res){
    console.log("adding data to ventilators collection");
    var v=req.body.Ventilator_id;
    var status=req.body.status;
    console.log(v);
    var h=req.body.H_id;
    var name;
    db.collection('hospitaldetails').find({H_id:h},{projection:{_id:0, name:1}}).toArray().then(result => {
    var obj={H_id:h,Ventilator_id:v,status:status,name:result}
    console.log(result);
    db.collection('ventilatordetails').insertOne(obj, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
    });
  });
    db.collection('ventilatordetails').find().toArray().then(result => res.send(result));
    res.send("data posted");
});

//delete ventilator by ventilatorID

app.delete('/deleteevent',middleware.checkToken,function(req,res){
  var ventid = req.query.Ventilator_id;
  console.log(ventid);
  var del = {"Ventilator_id":ventid};
  db.collection('ventilatordetails').deleteOne(del,function(err,obj) {
    if(err) throw err;
    res.json("1 document deleted");
  });
});

app.listen(3000);


// var express= require('express'); // requiring the express
// var app=express();
//
// const bodyParser = require("body-parser"); //requiring body parser
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
//
// const MongoClient=require('mongodb').MongoClient;
// const url='mongodb://127.0.0.1:27017';
// const dbName='hospital';
// let db
// //Connecting to the Database
// MongoClient.connect(url,{useUnifiedTopology: true},(err,client)=>{
//     if(err) return console.log(err);
//     db=client.db(dbName);
//     console.log(`Connected Database: ${url}`);
//     console.log(`Database : ${dbName}`);
// });
// //Hopistal Details
// app.get('/hospitalDetails',function(req,res) {
//   var data = db.collection('hospitaldetails');
//   data.find().toArray(function(err,result) {
//     if(!err) {
//       res.json(result);
//       console.log("Success");
//     }
//   });
// });
// //ventilator Details
// app.get('/ventilatorDetails',function(req,res) {
//   var data = db.collection('ventilatordetails');
//   data.find().toArray(function(err,result) {
//     if(!err) {
//       res.json(result);
//       console.log("Success");
//     }
//   });
// });
//
// //hospitalDetails by name
// app.get('/hospitalDetailsByName',function(req,res){
//   var data = db.collection('hospitaldetails');
//   var hosp = req.query.name;
//   data.find({name:hosp}).toArray().then(result => {res.json(result)});
// });
//
// //Update ventilator Details
// app.put('/updateVents',function(req,res){
//     console.log("updating data of ventilators collection");
//     var v={ventilatorId:req.query.vid};
//     var status={$set: {status:req.query.status}};
//     db.collection('ventilatordetails').updateOne(v,status,function(err,res){
//         console.log("updated");
//     });
//     db.collection('ventilators').find().toArray().then(result => res.send(result));
//     res.send("data updated");
// });
//
// //add ventilator
// app.post('/ad',function(req,res){
//     console.log("adding data to ventilators collection");
//     var v=req.body.vid;
//     var status=req.body.status;
//     console.log(v);
//     var h=req.body.hid;
//     var name;
//     db.collection('hospitaldetails').find({hId:h},{projection:{ _id:0, name:1 }}).toArray().then(result => {
//     var obj={hId:h,ventilatorId:v,status:status,name:result}
//     console.log(result);
//     db.collection('ventilatorDetails').insertOne(obj, function(err, res) {
//         if (err) throw err;
//         console.log("1 document inserted");
//     });
//
// });
//     db.collection('ventilators').find().toArray().then(result => res.send(result));
//     res.send("data posted");
// });
//
// //delete ventilator
// app.delete('/deleteVent',function(req,res){
//     console.log("deleting data of ventilators collection");
//     var v={ventilatorId:req.query.vid};
//     db.collection('ventilatordetails').deleteOne(v, function(err, obj) {
//         if (err) throw err;
//         console.log("1 document deleted");
//         });
//     db.collection('ventilatorDetails').find().toArray().then(result => res.send(result));
// });
//
//
// //search vents by name
// app.post('/ventilatorByStatus',function(req,res){
//   var data=db.collection('ventilatordetails');
//   var stat = req.body.status;
//   data.find({status:stat}).toArray().then(result => {res.json(result)});
// });
//
// //Listening to the port
// app.listen(3000,function() {
//   console.log("server on at 3000");
// });













// const express= require('express');
// const app=express();
//
// let server= require('./server');
// let middleware= require('./middleware');
//
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
//
// const MongoClient=require('mongodb').MongoClient;
// const url='mongodb://127.0.0.1:27017';
// const dbName='hospitalDetails';
// let db
// MongoClient.connect(url,{useUnifiedTopology: true},(err,client) =>{
//     if(err) return console.log(err);
//     db=client.db(dbName);
//     console.log(`Connected Database: ${url}`);
//     console.log(`Database : ${dbName}`);
// });
// app.get('/hospitalDetails',middleware.checkToken, function(req,res){
//     console.log("Fetching data from Hospital Collections");
//     var data=db.collection('hospitaldetails').find().toArray().then(result=>res.json(result));
// });
// app.get('/ventilatorDetails',middleware.checkToken ,function(req,res){
//     console.log("Fetching data from Ventilators Collections ");
//     var data=db.collection('ventilatordetails').find().toArray().then(result=>res.json(result));
// }
// );
// app.post(`/searchventilatorbystatus`,middleware.checkToken,function(req,res){
//     var status=req.body.status;
//     console.log(status);
//     var ventilatorDetails=db.collection('ventilatordetails').find({"status":status}).toArray().then(result=>res.json(result));
// });
// app.post(`/searchventilatorbyname`,middleware.checkToken,function(req,res){
//     var name=req.query.name;
//     console.log(name);
//     var ventilatorDetails=db.collection('ventilatorDetails').find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
// });
// app.put(`/searchhospital`,middleware.checkToken,function(req,res){
//     var name=req.query.name;
//     console.log(name);
//     var hospitalDetails=db.collection('hospitalDetails').find({'name':new RegExp(name,'i')}).toArray().then(result=>res.json(result));
// });
// app.put(`/updateventilator`,middleware.checkToken,function(req,res){
//     var vid={ventilatorID:req.body.ventilatorID};
//     console.log(vid);
//     var newvalues={$set:{status:req.body.status}};
//     db.collection("ventilatorDetails").updateOne(vid,newvalues,function(err,result){
//         re.json('one document updated');
//         if(err)throw err;
//     });
// });
// app.post(`/addventilatorbyuser`,middleware.checkToken,function(req,res){
//     var hID=req.body.hID;
//     var ventilatorID=req.body.ventilatorID;
//     var status=req.body.status;
//     var name=req.body.name;
//     var item={
//         hID:hID,ventilatorID:ventilatorID,status:status,name:name
//     };
//     db.collection('ventilatorDetails').insertOne(item,function(err,result){
//         res.json('Item has been inserted');
//     });
// });
// app.delete(`delete`,middleware.checkToken,function(req,res){
//     var myquery=req.query.ventilatorID;
//     console.log(myquery);
//     var myquery1={ventilatorID,myquery};
//     db.collection(`ventilatorDetails`).deleteOne(myquery1,function(err,obj){
//         if(err)throw err;
//         res.json("one document has been deleted");
//     });
// });
//
//
// app.listen(3000);
