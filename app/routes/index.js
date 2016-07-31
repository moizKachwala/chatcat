'use strict';

const h = require('../helpers');

module.exports = () => {
    let routes = {
        'get':{
            '/': (req, res, next) => {
                res.render('login');
            },
            '/rooms': (req, res, next) => {
                res.render('rooms');
            },
            '/chat': (req, res, next) => {
                res.render('chatroom');
            },
            '/getSession': (req, res, next) => {
                res.send('My Fav color ' + req.session.favColor);
            },
            '/setSession': (req, res, next) => {
                req.session.favColor = "red";
                res.send('setting session');
            }
        },
        'post': {
            // post routes
        },
        'NA': (req, res, next) => {
            res.status(404).sendFile(process.cwd() + '/views/404.htm');
        }
    }
    
    return h.route(routes);
}