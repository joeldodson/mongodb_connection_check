"use strict";

function ppobj(obj) {
    if (typeof obj === "object") {
        return JSON.stringify(obj, null, 4);
    } else {
        return obj;
    }
}

let loggerConfig = {
    "appenders": [
        {   "type":"console"},
        {
            "type": "file",
            "filename": "check_conn.log",
            "maxLogSize": 1000000,
            "backups": 10
        }
    ]
};

let log4js = require("log4js");
log4js.configure(loggerConfig);
let logger = log4js.getLogger("main");
let mlogger = require("mongodb").Logger;
mlogger.setLevel("debug");
mlogger.setCurrentLogger(function (msg, context) {
    logger.debug("MongoDBLog: " + ppobj(context));
});

let express = require("express");
let mongo = require("mongodb");
let mongoClient = require("mongodb").MongoClient;

let dbUrl = process.env.CHECK_CONN_DB_URL;
let app = express();
let mongoDb = undefined;

app.get("/ntokens", function (req, res) {
    logger.info("return how many tokens in the push_notification database");
    return res.status(200).json({"status": "yea!!"});
});

app.get("/dbstats", function (req, res) {
    logger.info("return dbStats for push_notification database");
    mongoDb.command({"dbStats": 1}, function (err, results) {
        return res.status(200).json({"error": err, "results": results});
    });
});

let http_port = process.env.CHECK_CONN_PORT || 5788;

var server = app.listen(http_port, function () {
    logger.info("server is running on http port %d", http_port);
    logger.info("attempt to connect to MongoDB URL: ", dbUrl);

    // I'm not sure these are setup correclty, they don't seem to have any affect
    let dbOptions = {
        autoReconnect: true,
        reconnectTries: 10,
        reconnectInterval: 1000,
        readPreference: mongo.ReadPreference.NEAREST
    };

    mongoClient.connect(dbUrl, dbOptions, function (err, db) {
        if (err) {
            logger.error("error connecting to DB: ", err);
        } else {
            logger.info("connected to DB");
            mongoDb = db;
        }
    });
});

