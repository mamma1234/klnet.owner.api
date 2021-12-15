// var passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
// const bcrypt = require('bcrypt');
const sUser = require('../models/sessionUser');
const pgsqlPool = require("../database/pool.js").pgsqlPool
const jwt = require('jsonwebtoken');
// const { User } = require('../models');

module.exports = (passport) => {  

	passport.use('localjoin',new LocalStrategy({
        usernameField: 'id',
        passwordField: 'password',
        passReqToCallback: true
    }, async (req, id, password, done) => {
        console.log('Sign (localStrategy.js) provider:email:', id, 'req:',req.body);
    	//req.session.sUser = null;
    	
    	try {
    		
    		if(req.body.provider == 'local') {
    			
    			const inputpassword = crypto.pbkdf2Sync(req.body.password, 'salt', 100000, 64, 'sha512').toString('hex');
    			
            	if(id) {  
            	    pgsqlPool.connect(function(err,conn,release) {

            	        if(err){
            	            console.log("err" + err);
            	            done(null, sUser,{ message: err });
            	        } else {
            	        
	            	        const sql = {
	            	    	        text: "SELECT * FROM OWN_COMP_USER \n"+
	            	    	              " where upper(local_id) = upper($1) \n"+
	            	    	        	  "  limit 1 ",
	            	    	        values: [id]
	            	    	    }
	
	            	        conn.query(sql, function(err,result){
	            	        	
	            	            if(err){
	            	            	release();
	            	                console.log(err);
	            	                done(null, sUser,{ message: err });
	            	            } else {
	
		            	            if(result.rowCount > 0) {
		            	            	release();
		            	            	console.log("이미 등록되어 있음.");
		            	            	done(null, false, { message: 'Use Another user id Please.(Dup Check error)' });
		            	            } else {
		            	            	console.log("[success] no user data");
		            	            	
		            	            	const setsql = {
		            	                        text: "insert into own_comp_user(user_no,user_type,user_email,local_pw,insert_date,user_phone,user_name," +
		            	                              "svc_use_yn,del_yn,local_id,kakao_id,token_kakao,naver_id,token_naver,face_id,token_face,google_id," +
		            	                              "token_google,social_link_yn,user_gender, user_birth) values (replace(to_char(nextval('auth_user_id_seq'),'M000000'),' ',''),'O'," +
		            	                              "$1,$2,now(),$3,$4,'Y','N',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",
		            	                        values: [req.body.email,inputpassword,req.body.phone,req.body.name,id,req.body.kakaoid,
		            	                        	req.body.tokenkakao,req.body.naverid,req.body.tokennaver,req.body.faceid,req.body.tokenface,
		            	                        	req.body.googleid,req.body.tokengoogle,req.body.linkyn,req.body.gender, req.body.birthDay]
		            	                   }
		            	            	conn.query(setsql, function(err,result){
		            	            		
		            	            		 if(err){
		            	            			    release();
		            	            	            console.log("err" + err);
		            	            	            done(null, sUser,{ message: err });
		            	            	        } else {
		            	            		 
				            	            		 if(result.rowCount > 0) {
				            	            			 console.log("[success] user data insert");
				                	            		 const loginsql = {
				                              	    	        text: "SELECT * FROM OWN_COMP_USER \n"+
				                              	    	              " where upper(local_id) = upper($1) \n"+
				                              	    	        	  "  limit 1 ",
				                              	    	        values: [id]
				                              	    	    }
				                     	            	 
				                     	            	 conn.query(loginsql, function(err,result){
				                     	            		release();
				                              	            if(err){
				                              	                console.log(err);
				                              	              done(null, sUser,{ message: err });
				                              	            } else {
					                              	           if(result.rowCount > 0) {
					                              	        	 console.log("[success] user data check: ok");
					                              	        	
					         	 	                            sUser.provider = 'local';
					         		                            sUser.userid = result.rows[0].local_id;
					         		                            sUser.userno = result.rows[0].user_no;
					         		                            sUser.username = result.rows[0].user_name;
					         		                            sUser.displayName = 'web';
					         		                            sUser.email = result.rows[0].user_email;
					         		                            sUser.usertype = result.rows[0].user_type;
					         	                            	//req.session.sUser = sUser;
					         	               	                done(null, sUser);
					                              	           } else {
					                            	            	console.log("등록되어 있지 않음.");
					                            	            	done(null, sUser,{ message: 'Contact the administrator.(System error:No Data)' });
					                              	           }
				                              	            }
				                     	            	 }); 
				            	            		 } else {
				            	            			 release();
				            	            			 done(null, sUser,{ message: 'Contact the administrator.(System error:Data insert fail)' });
				            	            		 }
		            	            	        }
		            	            		 
		            	            	 }); 
		            	            }}
	              
	            	        });
            	    }}); 
            	} else {
            		done(null, false, { message: 'Missing ID Required.(Missing error : ID )' });
            	}
 
    		} else if (req.body.provider == "merge") {
    			console.log("1.klnet+social data merge....");
    			const inputpassword = crypto.pbkdf2Sync(req.body.password, 'salt', 100000, 64, 'sha512').toString('hex');

            	if(id) {  
	    			
            	    pgsqlPool.connect(function(err,conn,release) {
            	    	
            	        if(err){
            	        	release();
            	            console.log("err" + err);
            	        }

            	        const sql1 = {
            	    	        text: "SELECT * FROM OWN_COMP_USER \n"+
            	    	              " where upper(local_id) = upper($1) \n"+
            	    	        	  "  limit 1 ",
            	    	        values: [id]
            	    	    }
            	        conn.query(sql1, function(err,result) {
            	        	
            	            if(err){
            	            	release();
            	                console.log(err);
            	            }

            	            if (result.rowCount > 0) {
            	            	 console.log("2-1. [success] klnet id check: ok");
            	            	 let resultSet = false; 
                                 if (inputpassword == result.rows[0].local_pw.toString()) {
                                	 resultSet = true;
                                 } else {
                                	 resultSet = false;
                                 }
                                 
                                 if(resultSet) {
	            	            	 console.log("2-2. [success] klnet login check: ok");
	            	            	 sUser.provider = 'local';
	                                 sUser.userid = id;
	                                 sUser.displayName = 'web';
	                                 console.log("socail id:",req.body.kakaoid,req.body.googleid);
    
		                            let sql2 = "SELECT * FROM OWN_COMP_USER \n";
			      	    	              if (req.body.kakaoid){
			      	    	            	  sql2 +=  " where upper(kakao_id) = '"+req.body.kakaoid+"' \n";
			      	    	              } else if (req.body.naverid) {
			      	    	            	  sql2 += " where upper(naver_id) = '"+req.body.naverid+"' \n";
			      	    	              } else if (req.body.faceid) {
			      	    	            	  sql2 +=  " where upper(face_id) = '"+req.body.faceid+"' \n";
			      	    	              } else{
			      	    	            	  sql2 +=  " where upper(google_id) = '"+req.body.googleid+"' \n";
			      	    	              }
			      	    	              sql2 += "limit 1 ";

					      	        conn.query(sql2, function(err,result) {
					      	        	
					      	            if(err){
					      	                console.log(err);
					      	            }
					
					      	            if(result.rowCount > 0) {
					      	            	release();
					      	            	console.log("3. [error] klnet id find: ok / socail dup error");
					      	            	done(null, sUser, { message: '소셜 정보가 다른 아이디에  등록되어 있음.' });
					      	            } else {
					      	            	console.log("3. [success] klnet id find: ok / socail id not found: ok");
					      	            	
					      	            	let updatesql = "UPDATE OWN_COMP_USER SET \n";
					      	            	   if (req.body.kakaoid){
					      	            		 updatesql+=" kakao_id='"+req.body.kakaoid+"' , token_kakao='"+req.body.tokenkakao+"' ,kakao_login_date=now(),social_link_yn='Y',social_link_date=now() \n";
					      	            	   } else if(req.body.naverid) {
					      	            		 updatesql+=" naver_id='"+req.body.naverid+"' , token_naver='"+req.body.tokennaver+"' ,naver_login_date=now(),social_link_yn='Y',social_link_date=now() \n"; 
					      	            	   } else if(req.body.faceid) {
					      	            		 updatesql+=" naver_id='"+req.body.faceid+"' , token_face='"+req.body.tokenface+"' ,face_login_date=now(),social_link_yn='Y',social_link_date=now() \n"; 
					      	            	   } else {
					      	            		 updatesql+=" google_id='"+req.body.googleid+"' , token_google='"+req.body.tokengoogle+"' ,google_login_date=now(),social_link_yn='Y',social_link_date=now() \n";
					      	            	   }
					      	            	   updatesql+="WHERE upper(local_id)=upper('"+id+"') \n";
	
			            	            	conn.query(updatesql, function(err,result) {
			            	            		
			                    	            if(err){
			                    	            	release();
			                    	                console.log(err);
			                    	                done(null, sUser, { message: 'DataBase error' });
			                    	            }

			                    	            if(result.rowCount > 0) {
			                    	            	console.log("3-1. [success] data update success...");
			                    	            	console.log("req.body.kakaoid:",req.body.kakaoid);
			                    	            	if(req.body.kakaoid) {
			                    	            		   socialsql = {
			                    	           	    	        text: "SELECT user_no,user_type,user_name,user_email, kakao_id as user_id FROM OWN_COMP_USER \n"+
			                    	           	    	              " where kakao_id = $1 \n"+
			                    	           	    	        	  "  limit 1 ",
			                    	           	    	        values: [req.body.kakaoid]
			                    	            		   	}
			                    	            	   } else if (req.body.naverid) {
			                    	            		   socialsql = {
			                    	           	    	        text: "SELECT user_no,user_type,user_name,user_email, naver_id as user_id FROM OWN_COMP_USER \n"+
			                    	           	    	              " where naver_id = $1 \n"+
			                    	           	    	        	  "  limit 1 ",
			                    	           	    	        values: [req.body.naverid]
			                    	            		   	}
			                    	            	   } else if (req.body.faceid) {
			                    	            		   socialsql = {
			                    	           	    	        text: "SELECT user_no,user_type,user_name,user_email, face_id as user_id FROM OWN_COMP_USER \n"+
			                    	           	    	              " where face_id = $1 \n"+
			                    	           	    	        	  "  limit 1 ",
			                    	           	    	        values: [req.body.faceid]
			                    	            		   	}
			                    	            	   } else {
			                    	            		   socialsql = {
			                    	           	    	        text: "SELECT user_no,user_type,user_name,user_email, google_id as user_id FROM OWN_COMP_USER \n"+
			                    	           	    	              " where google_id = $1 \n"+
			                    	           	    	        	  "  limit 1 ",
			                    	           	    	        values: [req.body.googleid]
			                    	            		   }
			                    	            	   }   

			                    	            	        conn.query(socialsql, function(err,result) {
			                    	            	        	release();
			                    	            	        	 if(err){
			                    	             	                console.log(err);
			                    	             	               done(null, sUser, { message: 'DataBase error' });
			                    	             	            }
			                    	            	        	 if(result.rowCount > 0) {
			                         	            				sUser.provider = req.body.provider;
			                         	                            sUser.userid = result.rows[0].user_id;
			                         	                            sUser.userno = result.rows[0].user_no;
			                         	                            sUser.username = result.rows[0].user_name;
			                         	                            sUser.email = result.rows[0].user_email;
			                         	                            sUser.usertype = result.rows[0].user_type;
			                                        	            done(null, sUser);
			                    	            	        	 } else {
			                    	            	        		 done(null, sUser, { message: 'DataBase error' });
			                    	            	        	 }
			                    	            	        });

			                    	            } else {
			                    	            	release();
			                    	            	done(null, sUser, { message: 'DataBase error' });
			                    	            }
					      	               }); //update conn
                                         }
					      	            
					      	        });
	            	            } else {
	            	            	release();
	            	            	//console.log("2-1.[error] klnet id check: not found");
	            	            	console.log("2-2.[error] klnet login check: error");
	            	            	done(null, false, { message: '아이디 또는 비밀번호가 잘못 되었습니다.' });
	            	            }
            	            } else {
            	            	release();
            	            	console.log("2-1.[error] klnet id check: not found");
            	            	done(null, false, { message: '아이디 또는 비밀번호가 잘못 되었습니다.' });
            	            }
            	            
            	        });
            	    }); 
            	} else {
            		console.log("0. [error] id not found...");
            		done(null, false, { message: '아이디 또는 비밀번호가 잘못 되었습니다.' });
            	}
    			
    		
    		} else {
    			console.log("1.klnet+social new data insert....");
    			const inputpassword = crypto.pbkdf2Sync(req.body.password, 'salt', 100000, 64, 'sha512').toString('hex');

            	if(id) {  
	    			
            	    pgsqlPool.connect(function(err,conn,release) {
            	    	
            	        if(err){
            	        	release();
            	            console.log("err" + err);
            	        }

            	        const sql1 = {
            	    	        text: "SELECT * FROM OWN_COMP_USER \n"+
            	    	              " where upper(local_id) = upper($1) \n"+
            	    	        	  "  limit 1 ",
            	    	        values: [id]
            	    	    }
            	        conn.query(sql1, function(err,result) {

            	            if(err){
            	            	release();
            	                console.log(err);
            	            }

            	            if (result.rowCount <= 0) {
            	            	 console.log("2-1. [success] klnet id check: not found success!!");

	            	            	 console.log("2-2. [success] klnet login check: ok");
	            	            	 sUser.provider = 'local';
	                                 sUser.userid = id;
	                                 sUser.displayName = 'web';
	                                 console.log("socail id:",req.body.kakaoid,req.body.googleid);
    
		                            let sql2 = "SELECT * FROM OWN_COMP_USER \n";
			      	    	              if (req.body.kakaoid){
			      	    	            	  sql2 +=  " where kakao_id = '"+req.body.kakaoid+"' \n";
			      	    	              } else if (req.body.naverid) {
			      	    	            	  sql2 += " where naver_id = '"+req.body.naverid+"' \n";
			      	    	              } else if (req.body.faceid) {
			      	    	            	  sql2 +=  " where face_id = '"+req.body.faceid+"' \n";
			      	    	              } else{
			      	    	            	  sql2 +=  " where google_id = '"+req.body.googleid+"' \n";
			      	    	              }
			      	    	              sql2 += "limit 1 ";

					      	        conn.query(sql2, function(err,result) {
					      	        	
					      	            if(err){
					      	            	release();
					      	                console.log(err);
					      	            }
					
					      	            if(result.rowCount > 0) {
					      	            	release();
					      	            	console.log("3. [error] klnet id find: ok / socail dup error");
					      	            	done(null, sUser, { message: '소셜 정보가 다른 아이디에  등록되어 있음.' });
					      	            } else {
					      	            	console.log("3. [success] klnet id find: ok / socail id not found: ok");
					      	            	
					      	            	const setsql = {
			            	                        text: "insert into own_comp_user(local_id,local_pw,user_email,user_phone,user_no,user_type,insert_date,user_name," +
			            	                              "svc_use_yn,del_yn,kakao_id,token_kakao,naver_id,token_naver,face_id,token_face,google_id,token_google,social_link_yn,social_link_date,user_gender,user_birth) values ($1,$2,$3,$4,replace(to_char(nextval('auth_user_id_seq'),'M000000'),' ',''),'O'," +
			            	                              "now(),$5,'Y','N',$6,$7,$8,$9,$10,$11,$12,$13,$14,now(),$15,$16)",
			            	                        values: [id,inputpassword,req.body.email,req.body.phone,req.body.name,req.body.kakaoid,req.body.tokenkakao,req.body.naverid,req.body.tokennaver,
			                	            			req.body.faceid,req.body.tokenface,req.body.googleid,req.body.tokengoogle,req.body.linkyn,req.body.gender, req.body.birthDay]
			            	                   }
			            	            	
			            	            	conn.query(setsql, function(err,result) {
			            	            		
			                    	            if(err){
			                    	                console.log(err);
			                    	                release();
			                    	                done(null, sUser, { message: 'DataBase error' });
			                    	            }

			                    	            if(result.rowCount > 0) {
			                    	            	console.log("3-1. [success] data insert success...");
			                    	            	if(req.body.kakaoid) {
			                    	            		   socialsql = {
			                    	           	    	        text: "SELECT user_no,user_type,user_name,user_email, kakao_id as user_id FROM OWN_COMP_USER \n"+
			                    	           	    	              " where kakao_id = $1 \n"+
			                    	           	    	        	  "  limit 1 ",
			                    	           	    	        values: [req.body.kakaoid]
			                    	            		   	}
			                    	            	   } else if (req.body.naverid) {
			                    	            		   socialsql = {
			                    	           	    	        text: "SELECT user_no,user_type,user_name,user_email, naver_id as user_id FROM OWN_COMP_USER \n"+
			                    	           	    	              " where naver_id = $1 \n"+
			                    	           	    	        	  "  limit 1 ",
			                    	           	    	        values: [req.body.naverid]
			                    	            		   	}
			                    	            	   } else if (req.body.faceid) {
			                    	            		   socialsql = {
			                    	           	    	        text: "SELECT user_no,user_type,user_name,user_email, face_id as user_id FROM OWN_COMP_USER \n"+
			                    	           	    	              " where face_id = $1 \n"+
			                    	           	    	        	  "  limit 1 ",
			                    	           	    	        values: [req.body.faceid]
			                    	            		   	}
			                    	            	   } else {
			                    	            		   socialsql = {
			                    	           	    	        text: "SELECT user_no,user_type,user_name,user_email, google_id as user_id FROM OWN_COMP_USER \n"+
			                    	           	    	              " where google_id = $1 \n"+
			                    	           	    	        	  "  limit 1 ",
			                    	           	    	        values: [req.body.googleid]
			                    	            		   }
			                    	            	   }   

			                    	            	        conn.query(socialsql, function(err,result) {
			                    	            	        	release();
			                    	            	        	 if(err){
			                    	            	        		 
			                    	             	                console.log(err);
			                    	             	               done(null, sUser, { message: 'DataBase error' });
			                    	             	            }
			                    	            	        	 if(result.rowCount > 0) {
			                         	            				sUser.provider = req.body.provider;
			                         	                            sUser.userid = result.rows[0].user_id;
			                         	                            sUser.userno = result.rows[0].user_no;
			                         	                            sUser.username = result.rows[0].user_name;
			                         	                            sUser.email = result.rows[0].user_email;
			                         	                            sUser.usertype = result.rows[0].user_type;
			                                        	            done(null, sUser);
			                    	            	        	 } else {
			                    	            	        		 done(null, sUser, { message: 'DataBase error' });
			                    	            	        	 }
			                    	            	        });

			                    	            } else {
			                    	            	release();
			                    	            	done(null, sUser, { message: 'DataBase error' });
			                    	            }
					      	               }); //update conn
                                         }
					      	            
					      	        });

            	            } else {
            	            	release();
            	            	console.log("2-1.[error] klnet id check: used");
            	            	done(null, false, { message: '이미 등록된 아이디 입니다.' });
            	            }
            	            
            	        });
            	    }); 
            	} else {
            		console.log("0. [error] id not found...");
            		done(null, false, { message: '아이디 또는 비밀번호가 잘못 되었습니다.' });
            	}

    		}
    	
                

            } catch(error) {
            	console.log(">>>>>error",error);
                console.error(error);
                done(error);
            }
    }));
	
    passport.use('local',new LocalStrategy({
        usernameField: 'id',
        passwordField: 'code',
        passReqToCallback: true
    }, async (req, userid, password, done) => {
                console.log('(localStrategy.js) userid:', userid, 'password:', password);
            	// const crypto_password = crypto.pbkdf2Sync(password, 'salt', 100000, 64, 'sha512').toString('hex');
                // console.log(crypto_password);         

            try {
            	
            	if(userid) {
						console.log("1.DB Connect");			
						const accessToken = req.cookies['socialKey'];
						const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
						

						pgsqlPool.connect(function(err,conn,release) {
							if(err){
								console.log("err" + err);
							}
							const sql = {
								text: "select * from own_comp_user where user_no = $1 limit 1",
								values: [decoded.userno],
								//rowMode: 'array',
							}

							conn.query(sql, function(err,result){
								release();
								if(err){
									console.log(err);
								}
								// console.log(">>>",result);
								//console.log("USER DATA CNT:",result.rowCount);
								if(result.rowCount > 0) {

									const crypto_token_local = crypto.pbkdf2Sync(result.rows[0].token_local, 'salt', 100000, 64, 'sha512').toString('hex');
									if ( password === crypto_token_local) {
										console.log(crypto_token_local); 
										sUser.provider = 'klnet';
										sUser.userid = '';  //1261001956
										sUser.userno = result.rows[0].user_no;
										sUser.username = result.rows[0].user_name;
										sUser.displayName = result.rows[0].user_name;
										sUser.accessToken = accessToken;
										//sUser.refreshToken = refreshToken;
										sUser.email = result.rows[0].user_email; //mamma1234@naver.com;
										//req.session.sUser = sUser;
										//console.log(">user value:",sUser);
										done(null, sUser); 
									} else {
										sUser.provider = 'klnet';
										sUser.userid = '';  //1261001956
										sUser.userno = '';
										sUser.username = '';
										sUser.displayName = '';
										sUser.accessToken = '';
										sUser.refreshToken = '';
										sUser.email = ''; //mamma1234@naver.com;
										console.log('가입되지 않은 회원입니다.');
										done(null, sUser, {errocode: 'E1002'});
									}
								} else {
									sUser.provider = 'klnet';
									sUser.userid = '';  //1261001956
									sUser.userno = '';
									sUser.username = '';
									sUser.displayName = '';
									sUser.accessToken = '';
									sUser.refreshToken = '';
									sUser.email = ''; //mamma1234@naver.com;
									console.log('가입되지 않은 회원입니다.');
									done(null, sUser, {errocode: 'E1002'});
								}
								
								
							});
						});
            	}else{
					done(null, false, {errocode: 'E1009' });
				}

            } catch(error) {
            	//console.log(">>>>>error",error);
                console.error(error);
                done(error);
            }
    }));    
    console.log('passport2');   
};
