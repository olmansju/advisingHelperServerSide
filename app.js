const path = require('path');
const express = require('express');
const DatastoreNEdb = require('nedb');

//mongoDB connection section
const { MongoClient } = require('mongodb');
const uriM = "mongodb://localhost:27017";
const clientM = new MongoClient(uriM);

async function run(){
    try {
        const dbM = clientM.db("AdvisorHelper");
        const students = dbM.collection("Student");
        const queryM = {};
        const optionsM = {};
        const cursorMarray = await students.find(queryM, optionsM).toArray();
        if ((await cursorMarray.length) === 0) {
            console.log("No documents found!");
        }
        return cursorMarray;
    } finally {
        await clientM.close();
    }
}


/*
const mongoDBname = 'AdvisorHelper'; //name of database
let foundDocuments;

async function mongoDBconnect(){
    await mongoDBclient.connect(); //connect to server
    const mongoDBobject = mongoDBclient.db(mongoDBname).collection('Student'); //same as db = client.db(dbName) in docs
    //const studentCollection = mongoDBobject.collection('Student');
    foundDocuments = await mongoDBobject.find({});
}

mongoDBconnect();
 */

// end mongoDB connection section

const app = express();

const databaseNEdb = new DatastoreNEdb('databaseNEdb.db');
databaseNEdb.loadDatabase();

const xfitNEdb = new DatastoreNEdb('xfitNEdb.db');
xfitNEdb.loadDatabase();

app.listen(3000, () => console.log('Up and listening on port 3000'));
app.use(express.static('public'));
app.use(express.json({ limit: '1mb' }));

app.get('/timmy', (req, res) => {
    res.send('wow timmy');
});

app.get('/time', (req, res) => {
    res.send('wow time');
});

app.get('/ggie', (req, res) => {
    res.send('wow reGIE');
});

app.post('/xfit/test', (request, response) => {
    let ob = {"greeting": "hi world", "value": 42};
    response.send(ob);
});

app.post('/api', (request, response) => {
    console.log(request.body);
    let data = request.body;
    let logTime = Date.now();
    data.timestamp = logTime;
    databaseNEdb.insert(data);
    response.json({
        status: 'success',
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp
    });
});

app.get('/xfit', (request, response) => {
    // Find all documents in the collection
    xfitNEdb.find({}, function (err, docs) {
        if (err) {
            response.end(err);
            return;
        }
        response.json(docs);
    });
});

//{'name': uName, 'email': uEmail, 'theCount': (theCount + 1)}

app.post('/xfit', (request, response) => {
    console.log(request.body);
    let data = request.body;
    xfitNEdb.update(
        { order: data.theCount },
        { $push: { dateLastCompleted: data }},
        {},
        function (err, infoUpdate){
            console.log("updated---->" + infoUpdate);

            xfitNEdb.loadDatabase();
        }
    );
    response.json({
        status: 'success',
        updatedRecord: data
    });
});

app.post('/nedb', (request, response) => {
    console.log(request.body);
    // Find all documents in the collection
    databaseNEdb.find({}, function (err, docs) {
        response.json(docs);
    });
});

app.get('/nedb', (request, response) => {
    console.log(request.body);
    // Find all documents in the collection
    databaseNEdb.find({}, function (err, docs) {
        response.json(docs);
    });
});

app.get('/students', async (req, res) => {
    let fDocs = await run(); // .catch(console.dir);
    res.send(fDocs);
});
