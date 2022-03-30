import express, { Application, Request, Response, NextFunction } from "express";

const authorizeSecret = (secret: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.body && req.body.secret === secret) {
            next();
        }
        else {
            res.status(401).send("Unauthorized");
        }
    }  
}

module.exports = { authorizeSecret }