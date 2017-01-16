"use strict";

/**
 * this program is for trying mongodb driver directly vs using mongoose.
 **/

let log4js = require("log4js");
let commandLineArgs = require('command-line-args');
let express = require("express");

let db = require("./db");
let ppobj = require("./utils").ppobj;


let loggerConfig = {
    "appenders": [
        {"type": "console"},
        {
            "type": "file",
            "filename": "check_conn.log",
            "maxLogSize": 1000000,
            "backups": 10
        }
    ]
};

log4js.configure(loggerConfig);
let logger = log4js.getLogger("main");

// cla => command line arguments
let claDefinitions = [
    {name: "driver", alias: "d", type: String}
];

let clas = commandLineArgs(claDefinitions);

logger.info("using driver: " + clas.driver);
db.connect(clas.driver);

let app = express();

app.get("/ntokens", function (req, res) {
    logger.info("return how many tokens in the push_notification database");
    db.ntokens(function(err,nt) {
        return res.status(200).json({"nTokens": nt});
    });
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

