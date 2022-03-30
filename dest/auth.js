"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authorizeSecret = (secret) => {
    return (req, res, next) => {
        if (req.body && req.body.secret === secret) {
            next();
        }
        else {
            res.status(401).send("Unauthorized");
        }
    };
};
module.exports = { authorizeSecret };
