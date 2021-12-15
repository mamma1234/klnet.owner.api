const sUser = require('../models/sessionUser');

const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const pgSql = require('../database/postgresql/users');
require('dotenv').config();



exports.isLoggedIn = (req, res, next) => { //console.log(">>>>>>",req);
   // console.log("(middlewares.js) isLoggedIn:req.isAuthenticated():".req.isAuthenticated());
	//console.log("(isLoggedIn middlewares.js)req.session.sUser:", req.session.sUser);
    if(req.isAuthenticated()) {
        console.log("로그인 완료");
        next();
    }
    else {
    //    res.redirect('/login');
        console.log("로그인 필요");
        res.status(403).send('로그인 필요');
    }
};
 
exports.isNotLoggedIn = (req, res, next) => {
    console.log("(middlewares.js) isNotLoggedIn:req.isAuthenticated():",req.isAuthenticated());
    console.log("(isNotLoggedIn middlewares.js) req.session.sUser:", req.session.sUser);
    if(!req.isAuthenticated()) {
        next();
    }
    else {
    	console.log(" no login");
        //res.redirect('/');
        next();
    }
};


exports.isLoggedPass = (req, res, next) => {
    // console.log("A.(middlewares.js) isLoggedPass:req.isAuthenticated():",req.isAuthenticated());
    console.log("(middlewares.js) isLoggedPass");
    next();
};




exports.isVerifyToken = (req, res, next) => {
    try { 
        //console.log("req:",req);
        //console.log("req:",req.headers['authorization']);
        //console.log("req:",req.cookies['x_auth']);
        // var AUTH_HEADER = "authorization",
        // LEGACY_AUTH_SCHEME = "JWT", 
        // BEARER_AUTH_SCHEME = 'bearer';
        
        // var extractors = {};
        let authorization;
        //let refreshToken = req.cookies['plismplus.com']?req.cookies['plismplus.com']:'';
        // console.log(req)
        if(req.body.token) {
            authorization = req.body.token;
            
        //	console.log("authorization:",authorization);
        //if (req.headers['authorization']) {
        //   authorization = req.headers['authorization'];
            //console.log("authorization:",authorization);
            //const re = /(\S+)\s+(\S+)/;
            //const matches = authorization.match(re);
        // const clientToken = matches[2];
        // const decoded = jwt.verify(clientToken, JWT_SECRET_KEY);
            const decoded = jwt.verify(authorization, JWT_SECRET_KEY);
            console.log("(middlewares.js) decoded", decoded);

            
            if (decoded && (decoded.userno != undefined)) {
                //console.log("(middlewares.js) decoded.userno", decoded.userno)
                sUser.userno = decoded.userno;
                //req.session.sUser = sUser;
                //req.user=decoded.userno;
                next();
            } else {
                console.log("(middlewares.js) isVerifyToken unauthorized");
                res.status(401).json({ errorcode: 401, error: 'unauthorized' });
            }
        } else {
            console.log("(middlewares.js) token not logged in");
            res.status(403).json({ errorcode: 403, error: 'no logged in' });
        }
    
    } catch (err) {console.log(err);
        if(err.name === 'TokenExpiredError') {
            console.log("(middlewares.js) isVerifyToken token expired");
            res.status(419).json({ errorcode: 419, error: 'token expired' });
        } else {
            console.log("(middlewares.js) isVerifyToken unauthorized");
            res.status(401).json({ errorcode: 401, error: 'unauthorized' });
        }

    }

};
    
    