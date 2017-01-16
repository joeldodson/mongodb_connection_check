"use strict";

/**
 * blah
 **/

let mongo = require("mongodb");
let mongoClient = require("mongodb").MongoClient;
let mongoLogger = require("mongodb").Logger;

let log4js = require("log4js");
let logger = log4js.getLogger("db.use_mongodb");

let ppobj = require("../utils").ppobj;


mongoLogger.setLevel("debug");
mongoLogger.setCurrentLogger(function (msg, context) {
    logger.debug("MongoDBLog: " + ppobj(context));
});

let dbUrl = process.env.CHECK_CONN_DB_URL;

