"use strict";

/**
 * blah
 **/

let log4js = require("log4js");
let logger = log4js.getLogger("db.index");

let use_mongodb = require("./use_mongodb");
let use_mongoose = require("./use_mongoose");

let supported_drivers = ["mongoose", "mongodb"];

module.exports.connect = function connect(option) {
    // option is the string for which DB driver to use
    // ["mongoose" | "mongodb"]

    if(!supported_drivers.includes(option)) {
        logger.warn("Driver: " + option + "NOT supported");
        return;
    }
};

module.exports.ntokens = function(callback) {
    callback(undefined, 7);
};

module.exports.dbstats = function(callback) {
    callback(undefined, 7);
};


