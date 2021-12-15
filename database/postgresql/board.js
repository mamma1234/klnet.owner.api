'use strict';

const pgsqlPool = require("../pool.js").pgsqlPool
const basicauth = require("basic-auth");
const multer = require('multer');
const fs = require('fs');
const sUser = require('../../models/sessionUser');

  const getBoardList = (request, response) => {
      //순번","제목", "작성자", "조회수", "작성일"
	    const sql = {
          text: "select board_id, title, author_name, hit_count, to_char(insert_date, 'YYYY-MM-DD hh24:mi') as insert_date, "
          +" from own_board "
          +" order by board_id desc",
	        // rowMode: 'array',
        }
        console.log( sql )
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
                        if(result != null) {
                            response.status(200).json(result.rows);
                        } else {
                            response.status(200).json([]);
                        }
                    }
                });
            }


	    });
  }

  const getBoardMainList = (request, response) => {
      //순번","제목", "작성자", "조회수", "작성일"
      console.log(request.body);
	    const sql = {
          text: "select * from (select board_id, title, content, author_name, hit_count, to_char(insert_date, 'YYYY-MM-DD hh24:mi') as insert_date,to_char(insert_date, 'YYYY-MM-DD') as insert_date2, "
          +" floor(count(*) over()/6) as tot_page,count(*) over() as tot_cnt,floor(((row_number() over()) -1) /5 +1) as curpage from own_board "
          +" order by board_id desc)a where curpage=$1",
          values: [request.body.num]
	        // rowMode: 'array',
        }
        console.log( sql )
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
                        if(result != null) {
                            response.status(200).json(result.rows);
                        } else {
                            response.status(200).json([]);
                        }
                    }
                });

            }


	    });
  }
  
  const getBoardDetail = (request, response) => {
        updateBoardHits(request, response);
        selectBoardDetail(request, response);
  }
  
  const selectBoardDetail = (request, response) => {
      const sql = {
        text: "select board_id, user_no, title, content, author_name, hit_count, to_char(insert_date, 'YYYY-MM-DD hh24:mi') as insert_date "
        +" from own_board "
        +" where board_id = $1",
        values: [request.body.board_id]
          // rowMode: 'array',
      }
      console.log( sql )
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
                      if(result != null) {
                          console.log(result.rows);
                          response.status(200).json(result.rows);
                      } else {
                          response.status(200).json([]);
                      }
                  }
              });
          }


      });
    }

    
    const updateBoardHits = (request, response) => {
        const sql = {
            text: " update own_board  "
            +" set hit_count = hit_count+1" 
            +" where board_id = $1",
            values: [request.body.board_id],
        }
        console.log( sql )
        pgsqlPool.connect(function(err,conn,release) {
            if(err){
                console.log("err" + err);
                response.status(400).send(err);
            } else  {

                conn.query(sql, function(err,result){
                    //done();
                	release();
                });
            }

        });
    }

    const saveBoard = (request, response) => {

        let sql = {};
        if(sUser == undefined){
            response.status(400).send("error");
        } else{
            if(request.body.board_id != null && request.body.board_id != undefined && request.body.board_id != ""){
                sql = {
                    text: " update own_board  "
                    +" set title = $1,"
                    +"     content = $2,"
                    +"     author_name = $3"
                    +" where board_id = $4"
                    +"  returning board_id ",
                    values: [request.body.title,
                            request.body.content,
                            request.body.author_name,
                            request.body.board_id],
                }
            } else{
                sql = {
                text: " insert into own_board  "
                +" (user_no, title, content, hit_count, author_name, insert_date) "
                +" values ( $1, $2, $3, 0, $4, now() )"
                + " returning board_id ",
                values: [sUser.userno,
                        request.body.title,
                        request.body.content,
                        request.body.author_name],
                }
            }
            console.log( sql )
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
                            if(result != null) {
                                if( request.body.fileStateList != undefined && request.body.fileStateList != null ) {
                                    deleteAttach( request, response, result.rows );
                                }else {
                                    response.status(200).json(result.rows);
                                }
        
                            } else {
                                response.status(200).json([]);
                            }
                        }
                    });
                }
        
            });
        }
    }

    const deleteBoard = (request, response) => {
	    const sql = {
          text: " delete from own_board  "
          +" where board_id = $1",
          values: [request.body.board_id],
      }
      console.log( sql )
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
                      if(result != null) {
                          response.status(200).json(result.rows);
                      } else {
                          response.status(200).json([]);
                      }
                  }
              });
          }
  
      });
    }

    const getBoardDataList = (request, response) => { //regexp_replace(content, '\n', '<br/>', 'g') as content
        //순번","제목", "작성자", "조회수", "작성일"
          var sql = "select * from (SELECT count(*) over()/10+1 as tot_page,floor(((row_number() over()) -1) /10 +1) as curpage, \n"
            + "board_id, title, content, author_name, hit_count, to_char(insert_date, 'YYYY-MM-DD hh24:mi') as insert_date \n"
            +" from (select * from own_board where 1=1" ;

            if(request.body.boardId !="" && request.body.boardId != undefined) {
                sql +=" and board_id = '"+request.body.boardId+"' \n";
            }
            if(request.body.title != "" && request.body.title != undefined) {
                sql +=" and title like '%"+request.body.title+"%' \n";
            }
            if(request.body.authorName !="" && request.body.authorName != undefined) {
                sql +=" and author_name = '"+request.body.authorName+"' \n";
            }
            sql += "order by board_id desc) b ) a \n"
                  +" where curpage ='"+request.body.num+"' \n";
              // rowMode: 'array',
          
          console.log( sql )
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
                          if(result != null) {
                              for(var i = 0; i < result.rows.length; i++){
                                  result.rows[i]['content'] = result.rows[i]['content'].split('\n');
                              }
                              console.log(result.rows[0]['content']);
                              response.status(200).json(result.rows);
                          } else {
                              response.status(200).json([]);
                          }
                      }
                  });
              }
  
  
          });
    }

    const saveAttach = (req, res, next) => {
        saveAttachFile(req, res, function(err){
          if(err instanceof multer.MulterError){
            return next(err);
          }else if (err){
            return next(err);
          }
          return res.json({success:1});
        })
    };
      
    const storage = multer.diskStorage({
        destination: function(req, file, cb){
            let savePath = "uploads";
            if(req.body.menuType != undefined){
              if(req.body.menuType == "main"){
                savePath += "/notice";
              }
            }
            cb(null, "/OWNER/" + savePath);
        },
        filename: function(req, file, cb){
            let savePath = "uploads";
            let fileName = file.originalname;
            if(req.body.menuType != undefined){
              if(req.body.menuType == "main"){
                savePath += "/notice";
              }
            }
            
            let chkUpdate = true;

            JSON.parse(req.body.fileStateList).map(fileState => {
                if(fileState.file_name == file.originalname && fileState.state == "UPDATE"){
                    chkUpdate = false;
                }
            })
            if(chkUpdate) {
                fileName = checkFile("/OWNER/" + savePath, file.originalname);
                insertAttach(req.body.boardId, fileName, savePath);
            }
            cb(null, fileName);
        }
    });
    
    const checkFile = (path, fileOriName) => {
        let chkFlag = true;
        let nameCnt = 1;
        let fileName= fileOriName.substring(0, fileOriName.lastIndexOf('.'));
        let fileType= fileOriName.substring(fileOriName.lastIndexOf('.'));
        let fileNameResult = fileOriName;

        console.log("파일명 : " + fileName);
        console.log("확장자 : " + fileType);
        
        chkFlag = fs.existsSync(path + '/' + fileOriName);

        while(chkFlag){
            fileNameResult = fileName + (++nameCnt) + fileType;
            chkFlag = fs.existsSync(path + '/' + fileNameResult);
        }
        console.log("변경된 파일명 : " + fileNameResult);

        return fileNameResult;
    };

    
    const insertAttach = (boardId, fileName, filePath) => {

        let sql = {};
        if(boardId == undefined || fileName == undefined || filePath == undefined){
            return false;
        } else{
            sql = {
            text: " insert into own_board_attach  "
            +" (board_id, file_name, file_path) "
            +" values ( $1, $2, $3)",
            values: [boardId,
                    fileName,
                    filePath],
            }
            console.log( sql )
            pgsqlPool.connect(function(err,conn,release) {
                if(err){
                    console.log("err" + err);
                    response.status(400).send(err);
                } else {
                    conn.query(sql, function(err,result){
                    	release();
                        if(err){
                            console.log("err" + err);
                            response.status(400).send(err);
                        }
                    });
                }
            });
        }
    }

    const saveAttachFile = (multer({storage: storage}).array("files"));

    const getBoardAttach = (request, response) => {
        const sql = {
          text: "select board_id, file_name, file_path "
          +" from own_board_attach "
          +" where board_id = $1",
          values: [request.body.board_id]
            // rowMode: 'array',
        }
        console.log( sql )
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
                        if(result != null) {
                            console.log(result.rows);
                            response.status(200).json(result.rows);
                        } else {
                            response.status(200).json([]);
                        }
                    }
                });

            }
  
  
        });
    }

    const deleteAttach = ( request, response, rows) => {

        let delFile = [];
        let delFileStr = "";

        request.body.fileStateList.map(file => {
            if(file.state == "DELETE"){
                const obj = {
                    file_name : file.file_name,
                    file_path : file.file_path
                }
                delFile.push(obj);
                delFileStr += (delFileStr == ""?"":",") + "'" + file.file_name +"'";
            }
        })
        if(delFile != [] && delFileStr != ""){
            const sql = " delete from own_board_attach  "
                +" where board_id = '" + request.body.board_id + "' and file_name in (" + delFileStr + ")";
            console.log( sql )
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
                            if(result != null) {
                                /*delFile.map(file => {
                                    fs.unlinkSync( file.file_path + "/" + file.file_name, function (err){
                                        console.log(err);
                                        response.status(400).send(error);
                                    });
                                });*/
                                response.status(200).json(rows);
                            } else {
                                response.status(200).json(rows);
                            }
                        }
                    });
                }
        
            });
        } else{
            response.status(200).json(rows);
        }
    }
module.exports = {
    getBoardList,
    getBoardMainList,
    getBoardDetail,
    saveBoard,
    deleteBoard,
    getBoardDataList,
    saveAttach,
    getBoardAttach
}