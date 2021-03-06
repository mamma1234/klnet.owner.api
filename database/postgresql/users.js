'use strict';
const ora = require('../../database/oracle/template');
const pgsqlPool = require("../pool.js").pgsqlPool
const basicauth = require("basic-auth");
const sUser = require('../../models/sessionUser');
const jwt = require('jsonwebtoken');

const getUserInfo = (request, response) => {
	
    const sql = {
            text: "select user_no, token_local,local_id ,user_type,user_email,to_char(insert_Date,'YYYY/MM/DD hh24:mi:ss') as insert_date, \n" +
            	  " user_phone,user_name,social_link_yn,to_char(social_link_date,'YYYY/MM/DD hh24:mi:ss') as social_link_date, \n"+
            	  " kakao_id,to_char(kakao_login_date,'YYYY/MM/DD hh24:mi:ss') as kakao_login_date,naver_id, \n" +
            	  " to_char(naver_login_date,'YYYY/MM/DD hh24:mi:ss') as naver_login_date,face_id, to_char(face_login_date,'YYYY/MM/DD hh24:mi:ss') as face_login_date, \n"+
                  "  google_id,to_char(google_login_date,'YYYY/MM/DD hh24:mi:ss') as google_login_date, api_service_key,user_gender, user_birth, \n"+
                  " to_char(pwd_modify_date,'YYYY/MM/DD hh24:mi:ss') as pwd_modify_date \n" +
            	  "  from own_comp_user where user_no = $1 limit 1",
            values: [request.body.userno],
            //rowMode: 'array',
        }
    console.log(sql);
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const res = await client.query(sql);
    		console.log(res.rows[0]);
    		response.status(200).json(res.rows);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
   
}

const getJwtSelecter = (id,user) => {

	(async () => {
        const sql = {
                text: `select user_no,user_email,user_name
, local_id,user_type as role
,(select c.recipient
 from own_company_section_user_mapping b
 ,own_company_identify c
 where b.user_no = a.user_no
 and b.company_id = c.company_id 
 AND b.section_id = c.section_id 
 AND c.work_code = 'BOOKING'
 limit 1) bkg_recipient
 ,(select c.recipient
 from own_company_section_user_mapping b
 ,own_company_identify c
 where b.user_no = a.user_no
 and b.company_id = c.company_id 
 AND b.section_id = c.section_id 
 AND c.work_code = 'SR'
 limit 1) sr_recipient
 ,(select c.recipient
 from own_company_section_user_mapping b
,own_company_identify c
 where b.user_no = a.user_no
 and b.company_id = c.company_id 
 AND b.section_id = c.section_id 
 AND c.work_code = 'DECLARE'
 limit 1) declare_recipient
,(select c.recipient
 from own_company_section_user_mapping b
,own_company_identify c
 where b.user_no = a.user_no
 and b.company_id = c.company_id 
 AND b.section_id = c.section_id 
 AND c.work_code = 'VGM'
 limit 1) vgm_recipient,
 next_pwd_modify_date,
 api_service_key,
 (select array_to_json(array_agg(company_id)) from own_company_section_user_mapping b where b.user_no = a.user_no) as company_list
 from own_comp_user a
 where user_no= $1 limit 1 `,
                values: [id.userno],
                //rowMode: 'array',
            }
        console.log("sql:",sql);
    	const client = await pgsqlPool.connect();
    	try {
    		const result =  await client.query(sql);
    		//console.log("rows length:",result.rowCount);
    		
    		if(result.rowCount > 0) {

    			return user(null,result.rows[0]);
				
    		} else {
    			return user(error,null,{message:'????????? ????????? ???????????? ????????????.'});
    		//	done(null,false,{message:'????????? ????????? ?????? ???????????????. ?????? ?????????????????????.'});
    		}
    	} finally {
    		client.release();
    	}
    })().catch(e => done(null, false, e));   
}

const getLocalUserInfo = (id,password,done) => {

    (async () => {
        const sql = {
                text: "select * from own_comp_user where local_id = $1 limit 1",
                values: [id],
                //rowMode: 'array',
            }
        //console.log("getLocalUserInfo sql:",sql.text);

    	const client = await pgsqlPool.connect();
    	try {
    		const rows =  await client.query(sql);
    		console.log(" getLocalUserInfo rows length:",rows.rowCount);
    		if(rows.rowCount > 0 && (password === rows.rows[0].local_pw.toString()) ) {
/*    		 sUser.provider = 'local';
             sUser.userno = rows.rows[0].user_no;
             sUser.username = rows.rows[0].user_name;
             sUser.displayName = 'web';
             sUser.email = rows.rows[0].user_email;
             sUser.usertype = rows.rows[0].user_type;*/
             done(null, rows.rows[0]);
    		} else {
    			console.log('????????? ?????? ??????????????? ???????????? ????????????.');
                done(null, false, { message: '????????? ?????? ??????????????? ???????????? ????????????.' });
    		}
    	} finally {
    		client.release();
    	}
    })().catch(e => done(null, false, e));   
}

/*
const getUserInfo = (request, response) => {
    const sql = {
        text: "select user_no, token_local,local_id ,user_type,user_email,to_char(insert_Date,'YYYY/MM/DD hh24:mi:ss') as insert_date, \n" +
        	  " user_phone,user_name,social_link_yn,to_char(social_link_date,'YYYY/MM/DD hh24:mi:ss') as social_link_date, \n"+
        	  " kakao_id,to_char(kakao_login_date,'YYYY/MM/DD hh24:mi:ss') as kakao_login_date,naver_id, \n" +
        	  " to_char(naver_login_date,'YYYY/MM/DD hh24:mi:ss') as naver_login_date,face_id, to_char(face_login_date,'YYYY/MM/DD hh24:mi:ss') as face_login_date, \n"+
        	  "  google_id,to_char(google_login_date,'YYYY/MM/DD hh24:mi:ss') as google_login_date, api_service_key \n"+
        	  "  from own_comp_user where user_no = $1 limit 1",
        values: [sUser.userno],
        //rowMode: 'array',
    }
console.log(sql);
    pgsqlPool.connect(function(err,conn,release) {
        if(err){
            console.log("err" + err);
            
            response.status(400).send(err);
        } else {
            conn.query(sql, function(err,result){
                release();
                if(err){
                    console.log(err);
                    
                    response.status(400).send(err);
                } else {
                    console.log(result);
                    
                    if(result != null) {
                        console.log(result.rows[0]);
                        
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }

                }
                conn.release();
            });

        }


        // conn.
        pgsqlPool.end();
    });
}
*/


const setSocialLoginInfo = (provider,providerid, token , social_token) => {
console.log(">>>>provider:",provider,"providerid:",providerid,"token:",token);
let sql ={};
if(provider == "kakao") {
    sql = {
        text: "WITH UPSERT AS ("+
              " UPDATE OWN_COMP_USER SET "+
              "  token_local=$1 , token_kakao = $2, kakao_login_date= now()"+
        	  "  WHERE kakao_id=$3 RETURNING*) "+
        	  " INSERT INTO OWN_COMP_USER (USER_NO,KAKAO_ID,TOKEN_KAKAO,TOKEN_LOCAL,KAKAO_LOGIN_DATE) "+
        	  "  SELECT 'M'||to_char(now(),'YYYYMMDDhh24miss'), $4,$5,$6 ,now() WHERE NOT EXISTS ( SELECT * FROM UPSERT)",
        values: [token, social_token, providerid, providerid,social_token,token],
        rowMode: 'array',
    }
} else if (provider == "naver") {
    sql = {
        text: "WITH UPSERT AS ("+
              " UPDATE OWN_COMP_USER SET "+
              "  token_local=$1 , token_naver=$2, naver_login_date= now()"+
        	  "  WHERE naver_id=$3 RETURNING*) "+
        	  " INSERT INTO OWN_COMP_USER (USER_NO,NAVER_ID,TOKEN_NAVER,TOKEN_LOCAL,NAVER_LOGIN_DATE) "+
        	  "  SELECT 'M'||to_char(now(),'YYYYMMDDhh24miss'), $4,$5,$6,now() WHERE NOT EXISTS ( SELECT * FROM UPSERT)",
        	  values: [token, social_token, providerid, providerid,social_token,token],
        rowMode: 'array',
    }
} else if (provider == "google") {
    sql = {
        text: "WITH UPSERT AS ("+
              " UPDATE OWN_COMP_USER SET "+
              "  token_local=$1 , token_google =$2,google_login_date= now()"+
        	  "  WHERE google_id=$3 RETURNING*) "+
        	  " INSERT INTO OWN_COMP_USER (USER_NO,google_ID,TOKEN_google,TOKEN_LOCAL,google_LOGIN_DATE) "+
        	  "  SELECT 'M'||to_char(now(),'YYYYMMDDhh24miss'), $4,$5,$6,now() WHERE NOT EXISTS ( SELECT * FROM UPSERT)",
        	  values: [token, social_token, providerid, providerid,social_token,token],
        rowMode: 'array',
    }
} else if (provider == "facebook") {
    sql = {
        text: "WITH UPSERT AS ("+
              " UPDATE OWN_COMP_USER SET "+
              "  token_local=$1 , token_case =$2, face_login_date= now()"+
        	  "  WHERE face_id=$2 RETURNING*) "+
        	  " INSERT INTO OWN_COMP_USER (USER_NO,FACE_ID,TOKEN_FACE,token_local,google_LOGIN_DATE) "+
        	  "  SELECT 'M'||to_char(now(),'YYYYMMDDhh24miss'), $4,$5,$6,now() WHERE NOT EXISTS ( SELECT * FROM UPSERT)",
        	  values: [token, social_token, providerid, providerid,social_token,token],
        rowMode: 'array',
    }
}

console.log(sql);
    pgsqlPool.connect(function(err,conn,release) {

        if(err){
            console.log("err" + err);
        } else {            
                    conn.query(sql, function(err,result){
                        //  done();
                        if(err){
                            console.log(err);
                            
                        } 
                        
                        console.log(">>>",result);
                        return result;
                    });

        }
    });
}

const setUserToken = (user,token) => {

const sql = {
        text: "UPDATE OWN_COMP_USER SET token_local=$1 , local_login_date= now() WHERE user_no=$2",
        values: [token, user.user_no],
        rowMode: 'array',
    }

console.log("db token insert:",sql);

;(async () => {
	const client = await pgsqlPool.connect();
	try {
		await client.query(sql);
		//console.log(res.rows[0]);
		//response.status(200).json(res.rows);
	} finally {
		client.release();
	}
})().catch(err => console.log(err))
}


const setUser = (email,inputpassword,phone,name,company,kakaoid,tokenkakao,naverid,tokennaver,faceid,tokenface,googleid,tokengoogle) => {
	//console.log(">>>>pro:",device,"db id:",id);
	console.log(">>>>email:",email,"inputpassword :",inputpassword);
	const sql = {
            text: "insert into own_comp_user(user_no,user_type,user_email,local_pw,insert_date,user_phone,user_name," +
                  "svc_use_yn,del_yn,user_company,kakao_id,token_kakao,naver_id,token_naver,face_id,token_face,google_id,token_google) values (replace(to_char(nextval('auth_user_id_seq'),'M000000'),' ',''),'O'," +
                  //"upper($1) ,$2,now(),$3,$4,'Y','N',$5,$6,$7,$8,$9,$10,$11,$12,$13)",
                  "$1 ,$2,now(),$3,$4,'Y','N',$5,$6,$7,$8,$9,$10,$11,$12,$13)",
            values: [email,inputpassword,phone,name,company,kakaoid,tokenkakao,naverid,tokennaver,faceid,tokenface,googleid,tokengoogle]
       }
	
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const res = await client.query(sql);
    		//console.log(res.rows[0]);
    		response.status(200).json(res.rows);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
    /*
	 pgsqlPool.connect(function(err,conn,release) {
		 if(err){
	            console.log("err" + err);
	        }
      conn.query(setsql);
      release();
	 });*/
	}


const setLocalUser = (id,password,phone,name,email,kakaoid,tokenkakao,naverid,tokennaver,faceid,tokenface,googleid,tokengoogle,linkyn) => {

	const sql = {
            text: "insert into own_comp_user(user_no,user_type,user_email,local_pw,insert_date,user_phone,user_name," +
                  "svc_use_yn,del_yn,local_id,kakao_id,token_kakao,naver_id,token_naver,face_id,token_face,google_id,token_google,social_link_yn) values (replace(to_char(nextval('auth_user_id_seq'),'M000000'),' ',''),'O'," +
                  //"$1,$2,now(),$3,$4,'Y','N',upper($5),$6,$7,$8,$9,$10,$11,$12,$13,$14)",
                  "$1,$2,now(),$3,$4,'Y','N',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)",
            values: [email,password,phone,name,id,kakaoid,tokenkakao,naverid,tokennaver,faceid,tokenface,googleid,tokengoogle,linkyn]
       }
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const res = await client.query(sql);
    		//console.log(res.rows[0]);
    		response.status(200).json(res.rows);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
    /*
	 pgsqlPool.connect(function(err,conn,release) {
		 if(err){
	            console.log("err" + err);
	        }
      conn.query(setsql);
      release();
	 });*/
	}

const setUpdateSocailUser = (kakaoid,tokenkakao,naverid,tokennaver,faceid,tokenface,googleid,tokengoogle,userId) => {
	const sql = {
	        text: "UPDATE OWN_COMP_USER SET kakao_id=$1 , token_kakao=$2, naver_id=$3, token_naver=$4, face_id=$5, token_face=$6," +
	        	 // "google_id=$7,token_google=$8,social_link_yn='Y' WHERE upper(local_id)=upper($9)",
	        	  "google_id=$7,token_google=$8,social_link_yn='Y' WHERE local_id=$9",
	        values: [kakaoid,tokenkakao,naverid,tokennaver,faceid,tokenface,googleid,tokengoogle,userId],
	        rowMode: 'array',
	    }

    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const res = await client.query(sql);
    		//console.log(res.rows[0]);
    		response.status(200).json(res.rows);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
    /*
	    pgsqlPool.connect(function(err,conn,release) {

	        if(err){
	            console.log("err" + err);
	        } else {
                conn.query(sql, function(err,result){
                	release();
                    if(err){
                        console.log(err);
                    }
                    
                    return "ok";
                });
            }

	    });*/
}


const getUserNotice = (request, response) => {
    //console.log("getUserNotice==========>", sUser);
    let sql = "select coalesce(count(*),0) as noti_cnt \n";
        sql += "from own_user_notice where user_no = '"+sUser.userno+"' and message_type ='W' \n";
        sql += "and read_yn = 'N' \n";
    
    
    
    console.log(sql);
    
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const res = await client.query(sql);
    		//console.log(res.rows);
    		response.status(200).json(res.rows);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
    /*
    pgsqlPool.connect(function(err,conn,release) {
        if(err){
            console.log("err" + err);
            
            response.status(400).send(err);
        } else {
            conn.query(sql, function(err,result){
                release();
                if(err){
                    console.log(err);
                    
                    response.status(400).send(err);
                } else {
                    // console.log(result);
                     
                     if(result != null) {
                        // console.log("data",result.rows[0]);
                         
                         response.status(200).json(result.rows);
                     } else {
                    	 
                         response.status(200).json([]);
                     }

                }
    
            });

        }


        // conn.
    });*/
}


const getUserMessage = (request, response) => {
	
	const selectSql1 = "select 1 from own_user_notice where  user_no = '"+sUser.userno+"' and message_type ='W' and read_yn='N' \n";

	let selectSql2 = "select user_no,message_type,message_seq,read_yn,read_Date,message_from,message,to_char(message_insert_date,'YYYY-MM-DD HH24:mi:ss') as message_insert_date \n";
	selectSql2 += "from own_user_notice where user_no = '"+sUser.userno+"' and message_type ='W' \n";
	selectSql2 += " order by message_insert_date desc limit 5\n";
    
    const updateSql = "update own_user_notice set read_yn='Y', read_date=now() where  user_no = '"+sUser.userno+"' and message_type ='W' and read_yn='N' \n";


    pgsqlPool.connect(function(err,conn,release) {
        if(err){
            console.log("err" + err);
            
            response.status(400).send(err);
        } else {
            conn.query(selectSql1, function(err,result){
               
                if(err){
                    console.log(err);
                    
                    response.status(400).send(err);
                } else {
               // console.log(result);
                
                    if(result.rowCount > 0) {
                        console.log("select success");
                        
                        conn.query(updateSql, function(err,result){
                            if(err){
                                console.log(err);
                                
                                response.status(400).send(err);
                            } else {
                                // console.log(result);
                                                                                                                                                                                                                                                                                                           
                                if(result.rowCount > 0) {
                                    console.log("update success");
                                    conn.query(selectSql2, function(err,result){
                                        release();
                                        if(err){
                                            console.log(err);
                                            
                                            response.status(400).send(err);
                                        } else {
                                            // console.log(result);
                                            
                                            if(result != null) {
                                               // console.log("data",result.rows);
                                                
                                                response.status(200).send(result.rows);
                                            } else {
                                            	
                                                response.status(200).send([]);
                                            }
                                        }
    
                                    });
            
                                } else { 
                                    console.log("update failed");
                                    
                                    response.status(200).send([]);
                                }

                            }

                        });
                
                    } else {
                        console.log("no select");
                        conn.query(selectSql2, function(err,result){
                        release();
                            if(err){
                                console.log(err);
                                
                                response.status(400).send(err);
                            } else {
                            // console.log(result);
                                
                                if(result != null) {
                                    //console.log("data",result.rows);
                                    
                                    response.status(200).send(result.rows);
                                } else {
                                	
                                    response.status(200).send([]);
                                }

                            }

                        });
                    }
                }

    
            });

        }


        // conn.
    });
}



const getUserMoreNotice = (request, response) => {

    let sql = "select (row_number()over(order by message_insert_date desc) )as rownum,message,message_from,to_char(message_insert_date,'YYYY-MM-DD HH24:mi:ss')as message_insert_date \n";
        sql += "from own_user_notice where user_no = '"+sUser.userno+"' and message_type ='W' \n";
        sql += "order by read_yn,message_insert_date desc \n";
    
    
    
    console.log(sql);
    
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const res = await client.query(sql);
    		//console.log(res.rows[0]);
    		response.status(200).json(res.rows);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
    /*
    pgsqlPool.connect(function(err,conn,release) {
        if(err){
            console.log("err" + err);
            
            response.status(400).send(err);
        } else {
            conn.query(sql, function(err,result){
                release();
                if(err){
                    console.log(err);
                    
                    response.status(400).send(err);
                } else {
                    // console.log(result);
                     
                     if(result != null) {
                         //console.log("data",result.rows[0]);
                         
                         response.status(200).json(result.rows);
                     } else {
                    	 
                         response.status(200).json([]);
                     }

                }
    
            });

        }


        // conn.
    });*/
}

const getUserSettingSample = (request, response) => {

    let sql = "select  *from ( \n";
    sql += "  select count(*) over()/10+1 as tot_page,count(*) over() as tot_cnt, floor(((row_number() over()) -1) /10 +1) as curpage, a.*, case when a.setting_gb='T' then 'Tracking' else 'DemDet' end as service_gb  \n";
    sql += "  from own_user_setting a ,  own_comp_user b  where a.user_no = b.user_no \n";
    if(request.body.id !="") {
    	sql += " and b.local_id = '"+request.body.id+"' \n";
    }
    sql += ")a where curpage ='"+request.body.num+"'";
    
    
    
    console.log(sql);
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const res = await client.query(sql);
    		//console.log(res.rows[0]);
    		response.status(200).json(res.rows);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
    /*
    pgsqlPool.connect(function(err,conn,release) {
        if(err){
            console.log("err" + err);
            
            response.status(400).send(err);
        } else {
            conn.query(sql, function(err,result){
                release();
                if(err){
                    console.log(err);
                    
                    response.status(400).send(err);
                } else {
                    // console.log(result);
                     
                     if(result.rowCount > 0) {
                    	 
                         response.status(200).json(result.rows);
                     } else {
                    	 
                         response.status(404).json([]);
                     }

                }
    
            });

        }


        // conn.
    });*/
}

const setLoginHistory = (userno,inout_type, useragent,ip) => {

	console.log(">>>>history");
	const sql = {
	        text: "insert into own_login_history(history_Seq,user_no,inout_type,device_type,os_name,browser_name,browser_version,ip_addr)values(to_char(now(),'YYYYMMDDHH24miss')||nextval('own_history_seq'),$1,$2,$3,$4,$5,$6,replace($7,'::ffff:',''))",
	        values: [userno,inout_type,useragent.isMobile?'M':'P',useragent.os,useragent.browser,useragent.version,ip],
	        rowMode: 'array',
	    }

	console.log("db token insert:",sql);
	
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		return await client.query(sql);
    		//console.log(res.rows[0]);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
    
	    /*pgsqlPool.connect(function(err,conn,release) {

	        if(err){
	            console.log("err" + err);
	            
	        } else {
                conn.query(sql, function(err,result){
                    //  done();
                    if(err){
                        console.log(err);
                        
                    }
                   // console.log(">>>",result);
                    
                    return "ok";
                });

            }

	    });*/
	}


const getUserPhoneInfo = (req,res) => {
	console.log(req.body.id);
    console.log("user info sms ------------------------------------------------");
	let sql = "SELECT user_no,local_id as origin_local_id,Rpad(substr(local_id,'1','3'),length(local_id),'*') as local_id, to_char(insert_date,'YYYY-MM-DD') as insert_date, \n";
    sql +=" substr(user_phone,'1','3')||'-'||substr(user_phone,'4','2')||'**-'|| substr(user_phone,'8','2')||'**' as user_phone,user_phone as origin_user_phone \n";
    sql +=" FROM OWN_COMP_USER where upper(user_phone) = upper('"+req.body.phone+"')  and user_name = '"+req.body.name+"' \n";
    if(req.body.id) {
    	//sql += "and upper(local_id) = upper('"+req.body.id+"')";
    	sql += "and local_id = '"+req.body.id+"' ";
    }
    if (req.body.gb == "C") {
    	sql += "and certify_num = '"+req.body.certify+"'";
    }
    console.log("select sql:",sql);
    
    let updateSql ="";
    
    
    
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const result = await client.query(sql);
            if(result.rowCount > 0) {
            	const smsNo = await client.query(" select Rpad(trim(to_char(floor(random()*9999),'9999')),4,'0') as smsno ");
            	
            	updateSql += "update  OWN_COMP_USER set certify_num = '"+smsNo.rows[0].smsno+"' ,certify_date=now() where user_phone = '"+result.rows[0].origin_user_phone+"' ";
            	if(req.body.id){
            		//updateSql += " and upper(local_id) = upper('"+ req.body.id +"')";
            		updateSql += " and local_id = '"+ req.body.id +"' ";
            	}

            	if(req.body.gb == "S") {
            		const msg =  "[PLISMPLUS] ????????????[" + smsNo.rows[0].smsno + "]??? ??????????????? ?????????????????? ???????????? - (???)????????????";
            	    const update = await client.query(updateSql);
            	    
            	    if (update.rowCount > 0) {
            	    	ora.setSms(req.body.phone,msg,res,result.rows);
            	    }

            	} else if(req.body.gb == "R") {
            		const send = await client.query(updateSql);	
            		if (send.rowCount > 0) {
            	 		return res.status(200).json(result.rows);
            	 	}
            	} else {
            		return res.status(200).send(result.rows);
            	}
            	 
            } else {
            	 return res.status(404).send();
            }
            
    	} finally {
    		client.release();
    	}
    })().catch(err => res.status(404).send(err))
}

const getUser = (req,res) => {
	
	const accessToken = req.cookies['x_auth'];
	const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
	
	
	const sql = {
            text: "select user_no,user_name,user_type from own_comp_user where user_no = $1 limit 1",
            values: [decoded.userno],
            //rowMode: 'array',
        }
    console.log(sql);
    ;(async () => {
    	const client = await pgsqlPool.connect();
    	try {
    		const result = await client.query(sql);
    		//console.log(res.rows[0]);
    		res.status(200).json(result.rows[0]);
    	} finally {
    		client.release();
    	}
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); res.status(400).json(err); }))
}
const setUserInfo = (req,res) => {
    console.log(req.body);
    let sql="";

    if(req.body.gubun) {
        if(req.body.userno) {
            sql += " UPDATE public.own_comp_user SET "
            

            if(req.body.gubun==="phone"){
                sql += " user_phone = '"+req.body.newTel+"' ,"

            }else if(req.body.gubun==="email") {
                sql += " user_email = '"+req.body.email+"' ,"
            }else if(req.body.gubun==="modify") {
                sql += " next_pwd_modify_date = now()+ interval '1 month', "
            }
            sql+= req.body.userno!==undefined?" update_user = '"+req.body.userno+"', ":""
            sql+=" update_date = now() "
            sql+=" WHERE user_no='"+req.body.userno+"' " 
            console.log(sql);
            ;(async () => {
                const client = await pgsqlPool.connect();
                try {
                    const result = await client.query(sql);
                    //console.log(res.rows[0]);
                    res.status(200).json(result);
                } finally {
                    client.release();
                }
            })().catch(err => setImmediate(() => {console.log("[ERROR]",err); res.status(400).json(err); }))
        }else {
            res.status(404).send("Unknown User");    
        }
    }else {
        res.status(404).send("Bad Request");
    }


    
    
}
const getMyIdList = (request,response) => {
    console.log(request.body);
    let sql="";
   
    if(request.body.gubun==='phone') {
        sql+=" select local_id from own_comp_user where 1=1 "
        sql+=" and user_name='"+request.body.userName+"' "
        sql+=" and user_phone='"+request.body.phoneNum+"' "
        sql+=" and user_birth='"+request.body.birthDay+"' "
        sql+=" and user_gender='"+request.body.gender+"' "
        
    }else if(request.body.gubun==='birth'){
        sql+=" select substring(local_id,1,length(local_id)/2)|| lpad('*',length(local_id)-2,'*') as local_id from own_comp_user where 1=1 "
        sql+=" and user_name='"+request.body.userName+"' "
        sql+=" and user_birth='"+request.body.birthDay+"' "
        sql+=" and user_gender='"+request.body.gender+"' "
        
    }else if(request.body.gubun==="pw") {
        sql+=" select local_id from own_comp_user where 1=1 "
        sql+=" and local_id='"+request.body.id+"' "
        sql+=" and user_phone='"+request.body.phoneNum+"' "
        sql+=" and user_name='"+request.body.userName+"' "
        sql+=" and user_birth='"+request.body.birthDay+"' "
        sql+=" and user_gender='"+request.body.gender+"' "
    }
    sql +=" order by local_id desc "
    console.log(sql)
    ;(async () => {
        const client = await pgsqlPool.connect();
        try {
            const result = await client.query(sql);
            response.status(200).json(result.rows);
        }finally {
            client.release();
        }
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
}
const selectId = (request,response) => {
    console.log(request.body);
    let sql="";
    sql += " select * FROM own_comp_user " 
    sql += " where local_id = '"+request.body.id+"' "
    console.log(sql)
    ;(async () => {
        const client = await pgsqlPool.connect();
        try {
            const result = await client.query(sql);
            response.status(200).json(result.rowCount);
        }finally {
            client.release();
        }
    })().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))
}


module.exports = {
    getJwtSelecter,
    getLocalUserInfo,
    getUserPhoneInfo,
    getUserInfo,
    setUserInfo,
    setUserToken,
    setUser,
    setLocalUser,
    setSocialLoginInfo,
    setUpdateSocailUser,
    getUserMessage,
    getUserNotice,
    getUserMoreNotice,
    getUserSettingSample,
    setLoginHistory,
    getUser,
    getMyIdList,
    selectId
}