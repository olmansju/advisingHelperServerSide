const path = require('path');
const express = require('express');
const DatastoreNEdb = require('nedb');

//mongoDB connection section
const { MongoClient } = require('mongodb');
const uriM = "mongodb://localhost:27017";
let clientM = new MongoClient(uriM);
let dbM = clientM.db("AdvisorHelper");
let clientMstartTime = Math.floor(Date.now() / 1000); //get start time in seconds

async function run(collectionName, queryMpassed, optionsMpassed){
    try {
        const students = dbM.collection(collectionName);
        const cursorMarray = await students.find(queryMpassed, optionsMpassed).toArray();
        if ((await cursorMarray.length) === 0) {
            console.log("No documents found!", queryMpassed);
        }
        return cursorMarray;
    } finally {
        let currentTime = Math.floor(Date.now() / 1000); //get current time in seconds 129600 = 36 hours
        if (currentTime > (clientMstartTime + 129600)){
            await clientM.close();
            clientM = new MongoClient(uriM);
            dbM = clientM.db("AdvisorHelper");
            clientMstartTime = Math.floor(Date.now() / 1000); //get start time in seconds
        }
    }
}

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

app.get('/student', async (req, res) => {
    let fDocs;
    if (req.query.qValue){
        let theField = req.query.qField;
        let theValue = req.query.qValue;
        fDocs = await run('Student', { [theField] : theValue }, {}); // the [brackets] allow it to be a key not an array
    } else {
        fDocs = await run('Student', {}, {});
    }
    res.send(fDocs);
});

app.get('/faculty', async (req, res) => {
    let fDocs;
    if (req.query.qValue){
        let theField = req.query.qField;
        let theValue = req.query.qValue;
        fDocs = await run('Faculty', { [theField] : theValue }, {}); // the [brackets] allow it to be a key not an array
    } else {
        fDocs = await run('Faculty', {}, {});
    }
    res.send(fDocs);
});
