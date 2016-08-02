'use strict';
const passport = require('passport');
const config = require('../config');
const helper = require('../helpers');

const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        // find user using the _id
        helper.findById(id)
            .then(user => done(null, user))
            .catch(error => console.log('Error when deserializing the user'));
    })


    let authProcessor = (accessToken, refreshToken, profile, done) => {
        // find a user in the local db using profile.id
        // if the user is found, return the user data using the done()
        // if the user is not found, create one in the local db and return
        helper.findOne(profile.id).then(result => {
            if (result) {
                done(null, result);
            } else {
                // create a new user and return
                helper.createNewUser(profile)
                    .then(newChatUser => done(null, newChatUser))
                    .catch(error => console.log('Error when creating new user'));
            }
        });
    }
    passport.use(new FacebookStrategy(config.fb, authProcessor));
    passport.use(new TwitterStrategy(config.twitter, authProcessor));
}
