"use strict";

function ppobj(obj) {
    if (typeof obj === "object") {
        return JSON.stringify(obj, null, 4);
    } else {
        return obj;
    }
}

module.exports.ppobj = ppobj;

