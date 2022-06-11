const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const indexRouter = require('./routes');
const BaseModel = require('./models/base');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Establishing a DB connection
(async ()=>{
    await BaseModel.connectDB();
})();

//Routes setup
app.use('/', indexRouter);

module.exports = app;
