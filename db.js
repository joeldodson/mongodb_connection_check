"use strict";

var mongoose = require('mongoose');
var log4js = require('log4js');
var logger = log4js.getLogger('check_conn.mongoose');

var url = process.env.CHECK_CONN_DB_URL;

/*
 * configure auto_reconnect to false for both replica set and single server.
 * auto reconnect doesn't work for replica set in mongoose 4.6 or 4.7.
 * auto reconnect does work for a single mongod instance though.
 * the connection closed callback is the same though for both replset and non-replset
 * so decided to disable auto reconnect in general and call the same connect logic
 * we use at startup if the connection ever closes.
 */
var connectionOptions = {
    replset: {
        auto_reconnect: true,
        read_preference: 'nearest'
    },
    server: {
        auto_reconnect: true,
        read_preference: 'nearest',
        reconnectTries: 600,
        reconnectInterval: 1000
    }
};

mongoose.set('debug', true);
var db = mongoose.connection;

db.on('connecting', function () {
    logger.info('Connecting to MongoDB at URL: ' + url);
});

db.on('connected', function () {
    logger.info('Connected to MongoDB at URL: ' + url);
});

db.on('open', function () {
    logger.info('Connection to MongoDB has been opened');
});

db.on('fullsetup', function () {
    logger.info('Connection to MongoDB - fullsetup for replica set');
});

db.on('all', function () {
    logger.info('Connection to MongoDB - all for replica set');
});

db.on('disconnecting', function (ref) {
    logger.warn('Disconnecting from MongoDB, URL: <' + url + '>, ref: ' + ref);
});

db.on('disconnected', function (ref) {
    logger.warn('Disconnected from MongoDB, URL: <' + url + '>, ref: ' + ref);
});

db.on('reconnected', function (ref) {
    logger.warn('Reconnected to MongoDB, URL: <' + url + '>, ref: ' + ref);
});

db.on('close', function () {
    logger.warn('Connection closed to MongoDB at URL: ' + url);
    // connectWithRetry();
});

db.on('error', function (err) {
    logger.fatal('Error connecting to MongoDB: ', err);
});

function connectWithRetry() {
    // return mongoose.connect(mongoUrl, function(err) {
    mongoose.connect(url, connectionOptions, function (err) {
        if (err) {
            logger.error('Failed to connect to mongo - retrying in 3 sec.  error: ' + err.message);
            setTimeout(connectWithRetry, 3000);
        } else {
            logger.info('we are connected');
        }
    });
}

connectWithRetry();

var tokenSchema = new mongoose.Schema(
    {
        name: String,
        token: String,
        os: String,
        remote_ip: String,
        app_name: String,
        production: {type: Boolean, default: false},
        overwrite: {type: Boolean, default: false}
    },
    {
        // bufferCommands: false,  // do not buffer commands for this model if there is no connection to the DB
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    }
);

var Token = db.model('Token', tokenSchema);

function getTokenCount(callback) {
    Token.count({}, function (err, count) {
        logger.debug('getTokenCount - total tokens count: ' + count);
        callback(err, count);
    });
}

module.exports.getTokenCount = getTokenCount;
