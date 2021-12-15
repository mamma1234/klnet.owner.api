'use strict';
const createError = require('http-errors');
const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();
//const cookieSession = require('cookie-session');
const SwaggerParser = require("swagger-parser");
const authRouter = require('./routes/auth');
const passportConfig = require('./passport');
const bodyParser = require("body-parser");
const dao = require('./database/');
const swaggerUi = require('swagger-ui-express');
const apiService = require('./apiService/openApi');
const uniPassApiService = require('./apiService/uniPassOpenApi');
const jusoroApiService = require('./apiService/JusoroApi');
const Request = require('request');
const { isLoggedIn, isNotLoggedIn, isVerifyToken, isLoggedPass } = require('./middleware/middlewares');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();
passportConfig(passport);
const sUser = require('./models/sessionUser');
const useragent = require('express-useragent');
const pgsqlPool = require("./database/pool.js").pgsqlPool
const oracledb = require('./database/pool.js').oracledb;
app.set('view engine','ejs')
app.set('trust proxy',true);
app.use(useragent.express());
app.set('views', path.join(__dirname, 'views')); //템플리트 엔진을 사용 1
app.use(morgan('dev')); //morgan: 요청에 대한 정보를 콘솔에 기록
app.use(express.static(path.join(__dirname, 'public'))); //static: 정적인 파일을 제공, public 폴더에 정적 폴더를 넣는다.
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({ limit:"50mb",extended: false }));

app.use(cookieParser('nodebirdsecret')); //cookie-parser: 요청에 동봉된 쿠키를 해석

const swaggerOption = {
    definition: {
        openapi:'3.0.0',
        info: {
            title:'Plism Plus API',
            version: '1.0.0',
            termsOfService: 'booking.plism.com',
            description: 'Plism Plus Open API'
        },
        contact: {
            name:'PLISMPLUS',
            url:'booking.plism.com',
        },
    },
    servers: [
        {
            url: "http://localhost:5005/",
        }
    ],
    basePath : '/',
    schemes: ['http','https'],
    apis: ['./*.js', './swaggerDoc.yaml','./model.yaml']
}

const specs = swaggerJsdoc(swaggerOption);

app.use(flash()); //connect-flash: 일회성 메시지들을 웹 브라우저에 나타낼 때 사용한다. cookie-parser와 express-session 뒤에 위치해야한다.
app.use(passport.initialize());
app.use(cors({
	origin:true,credentials:true
}));

app.use('/auth', authRouter);

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));


app.get('/', (req, res) => {
    

    // console.log('client_id:', req.query['client_id']); //Profile page api key bWFtbWEgTTAwMDAwMA==
    // console.log('redirect_uri:', req.query['redirect_uri']); //https://dev.plismplus.com/auth/klnet/callback
    // //http://localhost:5000/auth/klnet/callback
    // console.log('response_type:', req.query['response_type']); //code
    // console.log('state:', req.query['state']); //12345
    // let client_id = req.query['client_id'];
    // let redirect_uri = req.query['redirect_uri'];
    // let response_type = req.query['response_type'];
    // let state = req.query['state'];
    let klnetUrl= (process.env.PRODUCTION === 'LOCAL' ? 'http://localhost:3000' : (process.env.PRODUCTION === 'DEV' ? 'https://devbooking.plism.com' : 'https://booking.plism.com' ));

    res.render('login', {
        title: '로그인',
        // client_id: client_id,
        // redirect_uri: redirect_uri,
        // response_type: response_type,
        // state: state,
        message: req.query['message'],
        klnetUrl: klnetUrl,
    });
});
app.route(/^((?!\/auth\/|\/api\/|\/oauth\/).)*$/s).all(isVerifyToken,function(req, res, next) {    
     next();
});






app.use(bodyParser.json()); //요청의 본문을 해석해주는 미들웨어 1
app.use(bodyParser.urlencoded({ extended: true })); //요청의 본문을 해석해주는 미들웨어 2



app.post('/auth/login',(request,response) => {

    oracledb.getConnection(function (error, conn) {
        
        conn.execute("select * from do_comp_user_tbl where user_id=:1 and user_pwd = DAMO.HASH_SHA256_J(UPPER(:2))", {1:req.body.id, 2:req.body.pw}, {outFormat:oracledb.OBJECT},(err, result) => {
            if (err) {
                console.log(err);
                conn.close(function(er) { 
                    if (er) {
                        console.log('Error closing connection', er);
                    } else {
                        console.log('Connection closed');
                    }
                });                                       
                response.status(400).send(err);
            } else {
                if (result.rows.length < 1) {
                    conn.close(function(er) { 
                        if (er) {
                            console.log('Error closing connection', er);
                        } else {
                            console.log('Connection closed');
                        }
                    });
                } else {
                    res.render('main', {
                        title: 'PLISM PLUS API',
                        userId: result.rows[0].USER_ID
                    });
                }
            }
        });
    })
})


app.get("/web/login", (req, res) => {
    res.render('login');
});
app.get("/web/main", (req, res) => {
    try{
    console.log('req.query === ,',req.query)
    const sql = {

        text:   "select user_no, token_local,local_id ,user_type,user_email,to_char(insert_Date,'YYYY/MM/DD hh24:mi:ss') as insert_date, \n" +
                " user_phone,user_name,social_link_yn,to_char(social_link_date,'YYYY/MM/DD hh24:mi:ss') as social_link_date, \n"+
                " kakao_id,to_char(kakao_login_date,'YYYY/MM/DD hh24:mi:ss') as kakao_login_date,naver_id, \n" +
                " to_char(naver_login_date,'YYYY/MM/DD hh24:mi:ss') as naver_login_date,face_id, to_char(face_login_date,'YYYY/MM/DD hh24:mi:ss') as face_login_date, \n"+
                "  google_id,to_char(google_login_date,'YYYY/MM/DD hh24:mi:ss') as google_login_date, api_service_key,user_gender, user_birth, \n"+
                " to_char(pwd_modify_date,'YYYY/MM/DD hh24:mi:ss') as pwd_modify_date \n" +
                "  from own_comp_user where user_no = $1 limit 1",
        values: [req.query.userno],
            //rowMode: 'array',
        }
    console.log(sql);
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const response = await client.query(sql);
            res.render('main',{user:response.rows});
    		
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {
        res.render('main',{user:[]});
    }))
    }catch(e) {
        console.log(e)
    }
    
});


app.post("/web/setting",(req,res) => {
    let sql = "";
    sql += " select * from own_api_service " ;

    ;(async () => {
        const client = await pgsqlPool.connect();
    	  try {
    		  const result = await client.query(sql);
    		  response.status(200).json();
              res.render('setting',{data:{status:200,result:result.rows}})
    	  } finally {
    		  client.release();
    	  }
      })().catch(err =>res.render('setting',{data:{status:400,result:err}}));
    
})

/**
 * @swagger
 *  components:
 *    securitySchemes:
 *      ApiKeyAuth:
 *        type: apiKey
 *        in: header
 *        name: X-API-KEY
 *  security:
 *  - basicAuth: []
 */
/**
 * @swagger
 *  /api/createApiKey:
 *    post:
 *      tags:
 *      - Key
 *      description: API 키 생성 요청
 *      produces:
 *      - application/json
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/createkey'
 *            example:
 *              id: TEST0 
 *              no: M000008
 *            required: [id,no]
 *      responses:
 *       200:
 *        description: CREATE KEY SUCCESS
 *       400:
 *        description: BAD REQUEST 
 */

app.post("/api/createApikey", dao.pgcodes.createApiKey);




/**
 * @swagger
 *  /com/selectGroupbkg:
 *    post:
 *      tags:
 *      - BOOKING
 *      description: MY BOOKING LIST
 *      produces:
 *      - application/json
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/bookinglist'
 *            example:
 *              token: AccessToken
 *              toDate: 2021-01-01
 *              endDate: 2021-12-31
 *            required: [apikey]
 *      responses:
 *       200:
 *        description: 조회 성공
 */

app.post("/com/selectGroupbkg", dao.weidongsql.selectGroupBkg);

/**
 * @swagger
 *  /api/getToken:
 *    post:
 *      tags:
 *      - Key
 *      description: Token발급요청
 *      produces:
 *      - application/json
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/get-token'
 *            example:
 *              apikey: apikey
 *            required: [apikey]
 *      responses:
 *       200:
 *        description: SUCCESS
 *       400:
 *        description: BAD REQUEST 
 */
app.post("/api/getToken", (req, res)=> {
    console.log(req.body.apikey)
    console.log(req.body.id)
    try {
        Request({
            url: 'http://localhost:5002/oauth/keyauthorize',
            method: 'POST',
            body:{
                "id":req.body.id,
                "apiKey":req.body.apikey
            },
            json:true
        }, (error, response, data) => {
            console.log(response.statusCode, data)
            if(error) {
                console.log('error : ', error);
                res.send([]);
            }else {
                
                if(response.statusCode === 200) {
                    if(data.length !== 0) {
                        res.status(200).send(data);
                    }else {
                         res.status(200).send(null);
                    }
                }else {
                     res.status(400).send([]);
                }
            }
        })
    }catch(e) {
        res.status(400).send(e);
        console.log('error : ', e);
    }

})


app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));