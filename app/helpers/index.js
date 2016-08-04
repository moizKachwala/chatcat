'use strict';

const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

//iterater through the routes object and mount the routes.
let _registerRoutes = (routes, method) => {
    for (let key in routes) {
        if (typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
            _registerRoutes(routes[key], key);
        } else {
            if (method === 'get') {
                router.get(key, routes[key]);
            } else if (method === 'post') {
                router.post(key, routes[key]);
            } else {
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
            if (error) {
                reject(error);
            } else {
                resolve(newChatUser);
            }
        });
    });
}

// The ES6 promisified version of findById
let findById = id => {
    return new Promise((resolve, reject) => {
        db.userModel.findById(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        });
    });
}

// A middleware that checks to see if the user is authenticated & logged in
let isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
}

//find a chatroom by given name
let findRoomByName = (allrooms, room) => {
    let findRoom = allrooms.findIndex((element, index, array) => {
        if (element.room === room) {
            return true;
        } else {
            return false;
        }
    });

    return findRoom > -1 ? true : false;
}

//A function that generates a unique roomID
let randomHex = () => {
    return crypto.randomBytes(24).toString('hex');
}

let findRoomById = (allrooms, roomID) => {
    return allrooms.find((element, index, array) => {
        if (element.roomID === roomID) {
            return true;
        } else {
            return false;
        }
    });
}

let addUserToRoom = (allrooms, data, socket) => {

    // get the room object.
    let getRoom = findRoomById(allrooms, data.roomID);
    if (getRoom !== undefined) {
        //GET the active user's ID (objectID as used in the session)
        let userID = socket.request.session.passport.user;

        // Check to ses if this user already exists in the chatroom.
        let checkUser = getRoom.users.findIndex((element, index, array) => {
            if (element.userID === userID) {
                return true;
            } else {
                return false;
            }
        });

        // if the user is already present in the room, remove him first.
        if(checkUser > -1){
            getRoom.users.splice(checkUser, 1);
        }

        // push the user into the room.
        getRoom.users.push({
            socketID: socket.id,
            userID,
            user: data.user,
            userPic: data.userPic
        });

        // join the room channel.
        socket.join(data.roomID);

        // return the updated room object.
        return getRoom;
    }


}

module.exports = {
    route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated,
    findRoomByName,
    randomHex,
    findRoomById,
    addUserToRoom
}
