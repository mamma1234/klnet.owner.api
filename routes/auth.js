var express = require('express');
var router = express.Router();
var passport = require('passport')
var { isLoggedPass } = require('../middleware/middlewares');
let requestIp = require('request-ip')
var auth = require('../database/postgresql/users');




router.get('/local/callback', isLoggedPass, (req, res, next) => {
    const url = require('url');
    var url_value;
    
    if(req.headers && req.headers.referer.indexOf('localhost') > 0) { console.log("connect >>>>>>>>>>>localhost");
    	url_value = req.headers.referer;
    } else {
    	url_value = "https://"+req.headers.host;
    }
    
    //console.log("res:",res.body);
    //console.log("req:",req.query);
    //console.log("req:",req);
    console.log("(auth.js) /local/callback");
    console.log("host:",url_value);
    //console.log('1.', req.body);
    
    // const accessToken = req.cookies['accessToken'];
    // const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
    // console.log("decoded:", decoded);
    // req.body['userno'] = userno;
    // req.body['accessToken'] = accessToken;
    
    // console.log('2.', req.body);
    if(req.query && req.query.errcode) { 
    	
    	return res.redirect(url.format({
	    	pathname:url_value,//.slice(0,-1),
	    	query:{code:req.query.errcode}
    	}));
    }

    passport.authenticate('local', (authError, user, info) => {
        console.log("authError:",authError,",user:",user,",info:",info);
        if(authError) {
            console.error("authError", authError);
            return next(authError);
        }
        if(info) {
        	//res.cookie("x_auth",{user:user});
        	//return res.redirect('http://localhost:3000/landing');
        	return res.redirect(url.format({
    	    	pathname:url_value,//.slice(0,-1),
    	    	query:{code:info.errcode}
        	}));
        }
        if(!user){
            console.log("!user", user);
            // req.flash('loginError', info.message);
            // return res.redirect('/');
            // return res.status(200).json(info);
            //return res.status(405).json({ errorcode: 405, error: 'unauthorized' });
        	return res.redirect(url.format({
    	    	pathname:url_value,//referer.slice(0,-1),
    	    	query:{code:'E1002'}
        	}));
            
        }        
        return req.login(user, (loginError) => {
            
            if(loginError) {
                console.error("loginError", loginError);
              //  return next(loginError);
            }
            //console.log("http://localhost:3000 redirect");
            //return res.redirect('http://localhost:3000');
            // res.status(200).json(user);
            // return;

            // const token = jwt.sign(user.userid, process.env.JWT_SECRET_KEY);

            // const token = jwt.sign({userno:user.userno}, process.env.JWT_SECRET_KEY, { expiresIn : '1h', });
            //토큰 저장
            // res.cookie("socialKey",{user:user, token:token});
            //res.cookie("socialKey",{user:user, token:user.accessToken});
            //res.cookie("x_auth",user.accessToken,{domain:'plismplus.com',httpOnly: true});
            if(req.headers && req.headers.referer.indexOf('localhost') > 0) {
            	res.cookie("x_auth",user.accessToken,{httpOnly: true});
            } else {
            	res.cookie("x_auth",user.accessToken,{domain:'plismplus.com',httpOnly: true});
            }
            //res.cookie("x_auth",user.accessToken,{httpOnly: true});
            //res.cookie("x_auth",user.accessToken,{domain:'plismplus.com',httpOnly: true});
            // pgSql.setSocialLoginInfo(user.provider,user.userid, token , user.accessToken);
            //var ipaddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            var ipaddr = requestIp.getClientIp(req);
            auth.setLoginHistory(user.userno,'I',req.useragent, ipaddr);
            //res.json({user:user, token:token});
            //res.json({user:user, token:user.accessToken});
            //console.log("res:",res);
           // return res.redirect('http://localhost:3000/authpage?auth=social');
            //return res.redirect('http://localhost:3000');
            //res.cookie("connect.sid",token);
            // res.cookie("connect.user",user);
            //res.cookie("connect.userno",user.userno);
            //return res.redirect('http://localhost:3000/landing?provider=kakao');
             //res.json({user:user, token:token});
           // return res.redirect('/landing');
           // console.log("req.headers.host:",req)
            return res.redirect(url_value);
        });
    })(req, res,next)  //미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
});





router.get('/verify', isLoggedPass, (req, res, next) => {

    try{
    console.log("(auth.js) req.isAuthenticated():", req.isAuthenticated());

    passport.authenticate('re-jwt',(authError, user, info) => {
        //console.log("2. JWT authenticate Return Val (authError:",authError,",user:",user,",info:",info);

        console.log("(auth.js) authError:", authError, ',user', user, ',info', info);

        if(authError) {
            console.error("authError", authError);
            return next(err);
        }
        if(!user){
        	if(info && info.name === 'TokenExpiredError') {
        		res.clearCookie('x_auth',{ path: '/' });
        		return res.status(419).json({ isAuth:false, errorcode: 401, error: info });
        	} else {
        		return res.status(401).json({ isAuth:false, errorcode: 401, error: info });
        	}
        }

        req.login(user,async (loginError) => {
           // console.log("user", user);
        	
            if(loginError) {
                console.error("loginError", loginError);
                return next(loginError);
            }
            // const userInfo = {
            //     'user_no':user.user_no,
            //     'user_name':user.user_name,
            //     'role':user.user_type,
            //     'bkg_recipient': user.bkg_recipient,
            //     'sr_recipient': user.sr_recipient,
            //     'declare_recipient': user.declare_recipient,
            //     'vgm_recipient': user.vgm_recipient,

            // };
            const userInfo = Object.assign({}, user);
            console.log("userInfo:",userInfo);
            return res.json({'isAuth':true,'user':userInfo});
        });

    })(req, res, next)  //미들웨어 내의 미들웨어에는 (req, res, next)를 붙인다.
    }catch(e){
        console.log(e)
    }
});




router.post('/logout',  function (req, res) {
	console.log(">>>>>>>>>LOG OUT");
  //let authorization;
  let clientToken;
  try {
	  /*if (req.headers['authorization']) {
	      authorization = req.headers['authorization'];
	  }
	  console.log("authorization", authorization);
	  const re = /(\S+)\s+(\S+)/;
	  const matches = authorization.match(re);
	  const clientToken = matches[2];
	  const decoded = jwt.verify(clientToken, process.env.JWT_SECRET_KEY);*/
	  
	  if(req.cookies['x_auth']) {
		  clientToken = req.cookies['x_auth'];
	  }
	  const decoded = jwt.verify(clientToken, process.env.JWT_SECRET_KEY);

	  var ipaddr = requestIp.getClientIp(req);
	  if(decoded && decoded.user != undefined) {
            auth.setUserToken(decoded);
            auth.setLoginHistory(decoded.userno,'O',req.useragent,ipaddr);
	  }
	    req.logout();
	    if(req.headers && req.headers.referer.indexOf('localhost') > 0) { 
	    	res.clearCookie('socialKey',{ path: '/'});
	    	res.clearCookie('x_auth',{ path: '/' });
	    } else {
	    	res.clearCookie('socialKey',{ path: '/'});
			res.clearCookie('x_auth',{ path: '/',domain:'.plismplus.com' });
	    }
	  //res.clearCookie('express:sess.sig',{ path: '/' });
	  res.send(false);
  } catch (e) {
	    req.logout();
	    if(req.headers && req.headers.referer.indexOf('localhost') > 0) { console.log("connect >>>>>>>>>>>localhost");
	    	res.clearCookie('socialKey',{ path: '/'});
	    	res.clearCookie('x_auth',{ path: '/' });
	    } else {
	    	res.clearCookie('socialKey',{ path: '/'});
			res.clearCookie('x_auth',{ path: '/',domain:'.plismplus.com' });
	    }
	   
		//res.clearCookie('express:sess.sig',{ path: '/' });
		res.send(false);
  }
    
});

module.exports = router;
