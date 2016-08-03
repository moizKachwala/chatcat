'use strict';

const router = require('express').Router();
const db = require('../db');

//iterater through the routes object and mount the routes.
let _registerRoutes = (routes, method) => {
    for(let key in routes){
        if(typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)){
            _registerRoutes(routes[key], key);
        }else{
            if(method === 'get'){
                router.get(key, routes[key]);
            }else if(method === 'post'){
                router.post(key, routes[key]);
            }else {
                router.use(routes[key]);
            }
        }
    }
}

let route = routes => {
    _registerRoutes(routes);
    return router;
}

//find a single user based on key
let findOne = profileID => {
    return db.userModel.findOne({
        'profileId': profileID
    });
}

//create new user and return that instance 
let createNewUser = profile => {
    return new Promise((resolve, reject) => {
        let newChatUser = db.userModel({
            profileId: profile.id,
            fullName: profile.displayName,
            profilePic: profile.photos[0].value || ''
        });

        newChatUser.save(error => {
            if(error){
                reject(error);
            }else{
                resolve(newChatUser);
            }
        });
    });
}

// The ES6 promisified version of findById
let findById = id => {
    return new Promise((resolve, reject) => {
        db.userModel.findById(id, (error, user) => {
            if(error){
                reject(error);
            }else{
                resolve(user);
            }
        });
    });
}

// A middleware that checks to see if the user is authenticated & logged in
let isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }else{
        res.redirect('/');
    }
}


module.exports = {
    route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated
}
