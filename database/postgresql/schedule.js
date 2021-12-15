'use strict';

//const oraclePool = require("../pool.js").oraclePool
const pgsqlPool = require("../pool.js").pgsqlPool
// const oracledb = require('oracledb');
const sUser = require('../../models/sessionUser');

const getCarrierInfo = (request, response) => {
    console.log(">>>>>> CARRIER INFO log");
/* 	const sql = "SELECT A.line_code ,'['||A.LINE_CODE||'] '||B.CNAME_KR AS line_name "
        +" FROM TCS_ESHIP_CONFIG A,TCS_COMP_HEADER_TBL B"
	      +" WHERE A.KLNET_ID = B.KLNET_ID(+)"
        +" ORDER BY A.LINE_CODE ASC"; */
 	//const sql = "select distinct line_code, '[' || line_code || '] ' || nm_kor as line_name  "
 		const sql = "select distinct line_code,  nm_kor as line_name  "
        +" from own_code_cuship where line_code is not null and view_yn = 'Y' and nm_kor is not null order by line_code";

        console.log ("query:" +sql);

        
        ;(async () => {
    		const client = await pgsqlPool.connect();
    		try {
    			const result = await client.query(sql);
    			response.status(200).json(result.rows);
    		} finally {
    			client.release();
    		}
    	})().catch(err => console.log(err))
        /*
        pgsqlPool.connect(function(err,conn,release) {
            if(err){
                console.log("err" + err);
                
                response.status(400).send(err);
            } else {
                console.log("sql : " + sql.text);
                conn.query(sql, function(err,result){
                    release();
                    if(err){
                        console.log(err);
                        
                        response.status(400).send(err);
                    } else {
                        //response.status(200).send({'record':result.rows, 'field':result.fields.map(f => f.name)});
                        console.log(result);
                        
                        response.status(200).json(result.rows);
                        // console.log(result.fields.map(f => f.name));

                    }
        
                });

            }
    
            // conn.
        });*/
}

const getScheduleList = (request, response) => {
	console.log(">>>>>> FCL_SCHEDULE_HEADER log");
	console.log (">>PARAM1:"+request.body.carrierCode);
	console.log (">>PARAM2:"+request.body.startPort);
	console.log (">>PARAM3:"+request.body.endPort);
	console.log (">>PARAM4:"+request.body.startDate);
	console.log (">>PARAM5:"+request.body.endDate);
	console.log (">>PARAM6:"+request.body.vesselName);
	
/*     let sql = "select a.line_code,a.vsl_name,a.voyage_no,a.svc,to_char(to_date(a.etd,'YYYYMMDD'),'YYYY-MM-DD') as start_day,a.port_code as start_port, \n "
    + "to_char(to_date(b.eta,'YYYYMMDD'),'YYYY-MM-DD') as end_day,b.port_code as end_port \n"
    + "from own_vsl_Sch_20200408 a, own_vsl_sch_20200408 b \n"
    + "where a.line_code = b.line_code and a.voyage_no = b.voyage_no and a.vsl_name = b.vsl_name and a.svc = b.svc and a.port_code = '"+request.body.startPort+"' \n"
    + "and b.port_code = '"+request.body.endPort+"' and a.etd between '"+request.body.startDate+"' and '"+request.body.endDate+"' and a.etd <= b.eta \n"
    if(request.body.carrierCode != "") {
        sql= sql + "AND a.line_code ='"+request.body.carrierCode+"' \n";	
    }
    if(request.body.vesselName != "") {
        sql = sql + "AND a.vsl_name LIKE '%"+request.body.vesselName+"%' \n";	
    }
    sql = sql + "order by a.etd, a.line_Code, a.vsl_name, a.voyage_no, svc, b.eta" */

    let sql = "select * from (select case when length(line_code) = 4 then (select line_code from own_code_cuship cus where id = sch.line_code limit 1) else line_code end, line_code as org_line_code, vsl_name,voyage_no,to_char(to_date(start_date,'YYYYMMDD'),'YYYY-MM-DD') as start_day, to_char(to_date(start_date,'YYYYMMDD')-10,'YYYYMMDD') as map_start_day, start_port_code as start_port, (select '[' || port_code || '] ' || port_name from own_code_port where port_code = start_port_code) as start_port_name, \n "
    + "to_char(to_date(end_date,'YYYYMMDD'),'YYYY-MM-DD') as end_day, end_port_code as end_port, (select '[' || port_code || '] ' || port_name from own_code_port where port_code = end_port_code) as end_port_name, '[' || line_code || '] ' || vsl_name as title, to_date(start_date,'YYYYMMDD') as start, to_date(start_date,'YYYYMMDD') as end, \n"
    + "'true' as \"allDay\", (select image_yn from own_code_cuship cus where line_code = sch.line_code limit 1) as image_yn, (select url from own_code_cuship where line_code = sch.line_code limit 1) as line_url, coalesce((select nm_kor from own_code_cuship where line_code = sch.line_code limit 1),sch.line_code ) as line_nm, \n" 
    + "case when to_date(end_date,'yyyymmdd') - to_date(start_date,'yyyymmdd') in ('0','1') then to_date(end_date,'yyyymmdd') - to_date(start_date,'yyyymmdd') || ' Day' else to_date(end_date,'yyyymmdd') - to_date(start_date,'yyyymmdd') || ' Days' end as tt, \n" 
    + "(select ts from own_code_ts where line_code = sch.line_code and start_port_code = sch.start_port_code and end_port_code = sch.end_port_code limit 1) as ts, sf_get_sch_charge(line_code,start_port_code,end_port_code,start_date) as charge from own_vsl_sch sch \n"
    + "where (length(start_date) = 8 and length(end_date) = 8) and start_date >= to_char(now(),'yyyymmdd') and start_port_code = '"+request.body.startPort+"' and end_port_code = '"+request.body.endPort+"'  \n"
    //+ "and start_date >= '"+request.body.startDate+"' and start_date <= '"+request.body.endDate+"' \n"
    if(request.body.tapNum == "1") {
        sql = sql + "and start_date like substring('"+request.body.startDate+"',1,6) || '%' \n"
    } else {
        sql = sql + "and start_date >= '"+request.body.startDate+"' and start_date <= to_char('"+request.body.startDate+"'::date + interval '"+request.body.eWeek+"','yyyymmdd') \n"
    }
    if(request.body.carrierCode != "") {
        //sql= sql + "and line_code ='"+request.body.carrierCode+"' \n";	
        sql= sql + "and line_code in ("+request.body.carrierCode+") \n";	
    }
    if(request.body.vesselName != "") {
        sql = sql + "and vsl_name LIKE '%"+request.body.vesselName+"%' \n";	
    }
    sql = sql + "group by line_Code, vsl_name, voyage_no, start_port_code, end_port_code, start_date, end_date, start_port_name, end_port_name \n"
    sql = sql + "order by start_date, vsl_name) a where 1=1 "
    if(request.body.direct == true) {
        sql = sql + "and ts = 'DIRECT'";	
    }
            
            console.log ("query:" +sql);

            
            ;(async () => {
        		const client = await pgsqlPool.connect();
        		try {
        			const result = await client.query(sql);
        			response.status(200).json(result.rows);
        		} finally {
        			client.release();
        		}
        	})().catch(err => console.log(err))
            /*
            pgsqlPool.connect(function(err,conn,release) {
                if(err){
                    console.log("err" + err);
                    
                    response.status(400).send(err);
                } else {
                    console.log("sql : " + sql.text);
                    conn.query(sql, function(err,result){
                        release();
                        if(err){
                            console.log(err);
                            
                            response.status(400).send(err);
                        } else {
                            //response.status(200).send({'record':result.rows, 'field':result.fields.map(f => f.name)});
                            console.log(result);
                            
                            response.status(200).json(result.rows);
                            // console.log(result.fields.map(f => f.name));

                        }
            
                    });

                }
                // conn.
            });*/
}


const getScheduleDetailList = (request, response) => {
	//console.log(">>>>>> FCL_SCHEDULE_DETAIL log");
	//console.log (">>PARAM1:"+request.body.carrierCode);
	//console.log (">>PARAM2:"+request.body.vesselName);
	//console.log (">>PARAM3:"+request.body.voyage);
	//console.log (">>PARAM4:"+request.body.startDate);
	//console.log (">>PARAM5:"+request.body.endDate);
	//console.log (">>PARAM6:"+request.body.svc);
	
//    let sql = "select line_Code,voyage_no,vsl_name,svc,eta,etd,port_code from own_vsl_Sch where line_code = '"+request.body.carrierCode+"' \n"
//    + "and vsl_name = '"+request.body.vesselName+"' and voyage_no = '"+request.body.voyage+"' \n"
//    + "and etd >= replace('"+request.body.startDate+"','-','') and eta <= replace('"+request.body.endDate+"','-','') \n"
//    + "order by etd "

/*     const sql = {
        text: "select to_char(to_date(eta,'YYYYMMDD'),'YYYY-MM-DD'),to_char(to_date(etd,'YYYYMMDD'),'YYYY-MM-DD'),port_code from own_vsl_Sch_20200408 where line_code = $1 \n "
        + "and vsl_name = $2 and voyage_no = $3 \n"
        + "and etd >= replace($4,'-','') and eta <= replace($5,'-','') and svc = $6 \n"
        + "order by eta,etd ",
        values: [request.body.carrierCode,request.body.vesselName,request.body.voyage,request.body.startDate,request.body.endDate,request.body.svc],
        rowMode: 'array',
    } */

/*     const sql = {
        text: "select act_vsl_name, act_voyage_no, port_date, port_code port from ( \n"
        + "(select act_vsl_name, act_voyage_no, to_char(to_date(start_date,'YYYYMMDD'),'YYYY-MM-DD') port_date, pol port_code \n"
        + "from own_vsl_sch where line_code = $1 and vsl_name = $2 and voyage_no = $3 \n"
        + "and start_port_code = $4 and end_port_code = $5 group by start_date, pol, act_vsl_name, act_voyage_no ) \n"
        + "union all \n"
        + "(select act_vsl_name, act_voyage_no, to_char(to_date(end_date,'YYYYMMDD'),'YYYY-MM-DD') port_date, pod port_code \n "
        + "from own_vsl_sch where line_code = $1 and vsl_name = $2 and voyage_no = $3 \n"
        + "and start_port_code = $4 and end_port_code = $5 \n"
        + "order by end_date, end_port_code) ) a",
        values: [request.body.carrierCode,request.body.vesselName,request.body.voyage,request.body.startPort,request.body.endPort],
        rowMode: 'array',
    } */

    const sql = {
        text: "select act_vsl_name, act_voyage_no, pol || pol_date, pod || pod_date from (select distinct act_vsl_name, act_voyage_no, pol, ' (' || to_char(to_date(coalesce(pol_date,start_date),'YYYYMMDD'),'YYYY-MM-DD') || ')' pol_date, \n"
        + "pod, ' (' || to_char(to_date(coalesce(pod_date,end_date),'YYYYMMDD'),'YYYY-MM-DD') || ')' pod_date, end_port_code, start_port_code \n "
        + "from own_vsl_sch where line_code = $1 and vsl_name = $2 and voyage_no = $3 \n"
        + "and start_port_code = $4 and end_port_code = $5 \n"
        + "order by pol_date, pod_date, end_port_code, start_port_code) a",
        values: [request.body.carrierCode,request.body.vesselName,request.body.voyage,request.body.startPort,request.body.endPort],
        rowMode: 'array',
    }
            
            console.log ("query:" +sql);
    
    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
    /*

            pgsqlPool.connect(function(err,conn,release) {
                if(err){
                    console.log("err" + err);
                    
                    response.status(400).send(err);
                } else {
                    console.log("sql : " + sql.text);
                    conn.query(sql, function(err,result){
                        release();
                        if(err){
                            console.log(err);
                            
                            response.status(400).send(err);
                        } else {
                            //response.status(200).send({'record':result.rows, 'field':result.fields.map(f => f.name)});
                            console.log(result);
                            
                            response.status(200).json(result.rows);
                            // console.log(result.fields.map(f => f.name));

                        }
            
                    });
            

                }
                // conn.
            });*/
}

const getPortCodeInfo = (request, response) => {
	let sql = "";
    const portCode=request.body.portCode.substr(0,3);
    const Check = request.body.check!== undefined?true:false;
    console.log("입력Keyword:"+portCode);

/* 	    sql = "SELECT P.PORT_CODE,P.PORT_NAME FROM MFEDI.CODE_PORT P"
		      +",MFEDI. TCS_CODE_PORT A "
		      +" WHERE P.PORT_CODE = A.ISO_PORT"
		      +" AND (P.PORT_CODE LIKE upper('%"+portCode+"%') or P.PORT_NAME LIKE upper('%"+portCode+"%'))"
		      +" AND NVL(P.PORT_TYPE,' ') LIKE (CASE WHEN P.NATION_CODE = 'KR' THEN 'P' ELSE '%%' END)"
		      +" AND P.PORT_NAME IS NOT NULL"
		      +" AND A.LINE_CODE IN ( SELECT LINE_CODE FROM MFEDI.TCS_ESHIP_CONFIG)"
              +" GROUP BY P.PORT_CODE,P.PORT_NAME"; */
              
              sql = "select distinct PORT_CODE, PORT_NAME, NATION_CODE from own_code_port "
		      +"where (PORT_CODE LIKE upper('%"+portCode+"%') or PORT_NAME LIKE upper('%"+portCode+"%')) "
		      +" and COALESCE(PORT_TYPE,' ') LIKE (CASE WHEN NATION_CODE = 'KR' THEN 'P' ELSE '%%' END) "
              +" AND PORT_NAME IS NOT NULL ";
              if(Check) {
                  sql += "order by PORT_NAME ASC"
              }
	    
	    console.log("쿼리:"+sql);

	    
	       ;(async () => {
	    		const client = await pgsqlPool.connect();
	    		try {
	    			const result = await client.query(sql);
	    			response.status(200).json(result.rows);
	    		} finally {
	    			client.release();
	    		}
	    	})().catch(err => console.log(err))
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
                        //response.status(200).send({'record':result.rows, 'field':result.fields.map(f => f.name)});
                       // console.log(result);
                        
                        response.status(200).json(result.rows);
                        // console.log(result.fields.map(f => f.name));

                    }
        
                });

            }
            // conn.
        });*/
}

const getLinePicInfo = (request, response) => {
	console.log(">>>>>> getLinePicInfo log");
	console.log (">>PARAM1:"+request.body.carrierCode);
	
    const sql = {
        text: "select pic_area, pic_dept, pic_name, pic_tel, pic_email, pic_cell, pic_remark \n"
        + "from own_code_pic where line_code = $1 order by array_position(array['서울','부산','인천','광양','평택','울산','포항','군산','대산','마산','싱가폴'],pic_area::TEXT), array_position(array['영업'],pic_dept::TEXT), pic_name asc ",
        values: [request.body.carrierCode],
        rowMode: 'array',
    }
            
            console.log ("query:" +sql);

    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
    
    /*
            pgsqlPool.connect(function(err,conn,release) {
                if(err){
                    console.log("err" + err);
                    
                    response.status(400).send(err);
                } else {
                    console.log("sql : " + sql.text);
                    conn.query(sql, function(err,result){
                        release();
                        if(err){
                            console.log(err);
                            
                            response.status(400).send(err);
                        } else {
                            //response.status(200).send({'record':result.rows, 'field':result.fields.map(f => f.name)});
                           // console.log(result);
                            
                            response.status(200).json(result.rows);
                            // console.log(result.fields.map(f => f.name));

                        }
            
                    });

                }
        
                // conn.
            });*/
}

const getServiceCarrierList = (request, response) => {
	console.log(">>>>>> getServiceCarrierList log");
    console.log (">>PARAM1:"+request.body.startPort);
    console.log (">>PARAM2:"+request.body.endPort);
	
    const sql = {
        text: "select a.*,row_number() over() as rownum from (select distinct COALESCE(b.nm_kor,nm) as title, case when b.image_yn = 'Y' then \n"
        + "a.line_code else 'No-Image' end img,a.line_Code,(select url from own_code_cuship where line_code = a.line_code limit 1) as line_url \n"
        + "from own_Code_ts a, own_code_cuship b where start_port_code = $1 and end_port_code = $2 \n"
        + "and a.line_code = b.line_code order by a.line_code) a ",
        values: [request.body.startPort,request.body.endPort],
        //rowMode: 'array',
    }
            
            console.log ("query:" +sql);

    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
    /*
            pgsqlPool.connect(function(err,conn,release) {
                if(err){
                    console.log("err" + err);
                    
                    response.status(400).send(err);
                } else {
                    console.log("sql : " + sql.text);
                    conn.query(sql, function(err,result){
                        release();
                        if(err){
                            console.log(err);
                            
                            response.status(400).send(err);
                        } else {
                            //response.status(200).send({'record':result.rows, 'field':result.fields.map(f => f.name)});
                            //console.log(result);
                            
                            response.status(200).json(result.rows);
                            // console.log(result.fields.map(f => f.name));

                        }
            
                    });

                }
                // conn.
            });*/
}

const getTerminalScheduleList = (request, response) => {
    const vesselName = request.body.vesselName;
    const start = request.body.startDate;
    const end = request.body.endDate;
    const terminal = request.body.terminal;
    const working = request.body.working;
    const area = request.body.area;
    console.log(vesselName + start + end + terminal + working + area);

/*     let sql = "select LOG_DATE as \"LOG_DATE\", SEQ as \"SEQ\", NAME as \"NAME\", MESSAGE as \"MESSAGE\" from own_scheduleloader_log "
        sql += " where 1=1 ";
    cntrNo == "" ? sql +="" : sql += " and port_code = '" + cntrNo + "'"  */
    const sql = {
      text: "select distinct b.port_kname as port_name, (select cal_list_ter_nm from own_terminal_info where terminal = d.terminal ) as terminal_name, (select cal_ter_nm from own_terminal_info where terminal = d.terminal ) as f_terminal_name, a.vessel_name, "
      + " case when (a.im_voy is null or a.im_voy = '1') and (a.ex_voy is null or a.ex_voy = '1') then '' else coalesce((case when a.im_voy = '1' then null else a.im_voy end),' ') || ' / ' || coalesce((case when a.ex_voy = '1' then null else a.ex_voy end),' ') end as voyage_no, "
      + " to_char(to_timestamp(a.load_begin_date,'YYYYMMDDHH24'),'YYYY-MM-DD HH24:MI') as atb, (select cal_url from own_terminal_info where terminal = d.terminal ) as terminal_url, "
      +" case when length(a.closing_time) = 6 and a.closing_time != '000000' " 
      + " then SUBSTR(LOAD_BEGIN_DATE, 1, 4) || '-' || substr(CLOSING_TIME,1,2) || '-' || substr(CLOSING_TIME,3,2) || ' ' || substr(CLOSING_TIME,5,2) || ':00'  else '' end AS CLOSING_TIME, "
      + " to_char(to_timestamp(a.load_end_date,'YYYYMMDDHH24'),'YYYY-MM-DD HH24:MI') atd, a.carrier_code, to_char(a.unload_container,'9,999') unload_container, to_char(a.load_container,'9,999') load_container, to_char(a.shifting_container,'9,999') shifting_container, "
      + " (CASE WHEN SIGN(TO_CHAR(now(), 'YYYYMMDDHH24')::numeric - A.LOAD_BEGIN_DATE::numeric) = -1 THEN "
      + " (case WHEN SIGN(TO_CHAR(now(), 'YYYYMMDDHH24')::numeric - (SUBSTR (LOAD_BEGIN_DATE, 1, 4) || CLOSING_TIME)::numeric) = -1 "
      + " THEN '예정' ELSE '마감' END) ELSE " 
      + " CASE WHEN SIGN(TO_CHAR (now(), 'YYYYMMDDHH24')::numeric - A.LOAD_END_DATE::numeric) =- 1 "
      + " THEN '작업중' ELSE '완료' END END)  AS STATUS, COALESCE((select nm_kor from own_code_cuship where line_code = a.carrier_code limit 1), a.carrier_code) line_nm "
      + " from own_cal_sch a, own_code_port b, own_code_berth d "
      + " where 1=1 "
      + " and b.nation_code = 'KR' and a.terminal = d.terminal and d.terminal not like 'BS%' and d.wharf_code not like 'W%' "
      + " AND (case when D.LOC = 'ONS' then 'USN' when d.loc in ('YMH','SHG') then 'KPO' else d.loc end) = SUBSTR (B.PORT_CODE, 3) "
      + " and a.load_begin_date >= $1 || '00' and a.load_begin_date <= $2 || '23' " 
      + " and case when $3 != '' then a.VESSEL_NAME like '%' || upper($3) || '%' else 1=1 end " 
      + " and case when $4 != '' then d.terminal in (" + terminal + "'') else 1=1 end " 
      + " and case when $5 = true then SIGN(TO_CHAR(now(), 'YYYYMMDDHH24')::numeric - A.LOAD_BEGIN_DATE::numeric) != -1 AND SIGN(TO_CHAR (now(), 'YYYYMMDDHH24')::numeric - A.LOAD_END_DATE::numeric) =- 1 else 1=1 end "
      //+ " and d.loc = $6 "
      + "order by TERMINAL_NAME, atb " ,
      values: [start,end,vesselName,terminal,working],
      //rowMode: 'array',
  }

    //seq == "" ? sql.text +="" : sql.text += " and port_code = " + seq

    console.log("query == ",sql);    
    
    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
    
    /*
    pgsqlPool.connect(function(err,client,release) {
      if(err){
        console.log("err" + err);
        
        response.status(400).send(err);
      } else {
          client.query(sql, function(err,result){
            release();
            if(err){
              console.log(err);
              
              response.status(400).send(err);
            } else {
                //console.log(result.rows);
                
                response.status(200).send(result.rows);
            }
          });
      
      }
    });*/
  
  }  

  const getTerminalCodeList = (request, response) => {
	console.log(">>>>>> getTerminalCodeList log");
    //console.log (">>PARAM1:"+request.body.area);
	
    const sql = {
        text: "SELECT DISTINCT B.TERMINAL AS CODE, a.cal_ter_nm AS NAME \n"
        + "FROM own_terminal_info A, own_code_berth B \n"
        + "WHERE a.cal_yn = 'Y' and A.TERMINAL = B.TERMINAL AND case when $1 = 'GIN' then a.terminal = 'HJGIC' else a.terminal != 'HJGIC' and LOCATION_CODE = $1 end AND B.TERMINAL NOT LIKE 'BS%' AND B.WHARF_CODE NOT LIKE 'W%' \n"
        + " ORDER BY NAME, CODE ",
        values: [request.body.area],
        //rowMode: 'array',
    }
            
            console.log ("query:" +sql);

    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
    /*
            pgsqlPool.connect(function(err,conn,release) {
                if(err){
                    console.log("err" + err);
                    
                    response.status(400).send(err);
                } else {
                    console.log("sql : " + sql.text);
                    conn.query(sql, function(err,result){
                        release();
                        if(err){
                            console.log(err);
                            
                            response.status(400).send(err);
                        } else {
                            //response.status(200).send({'record':result.rows, 'field':result.fields.map(f => f.name)});
                            //console.log(result);
                            
                            response.status(200).json(result.rows);
                            // console.log(result.fields.map(f => f.name));

                        }
            
                    });

                }
        
                // conn.
            });*/
}

const getScheduleSample = (request, response) => {

	 let sqlText ="";
		 sqlText += " select * from (SELECT count(*) over()/10+1 as tot_page,floor(((row_number() over()) -1) /10 +1) as curpage, \n";
		 sqlText +=" line_code, vsl_name, voyage, start_route_date, start_route_code, end_route_date, \n";
		 sqlText +=" end_route_code, start_route_name, end_route_name, eta, eta_time, etd, etd_time, ts_yn, \n";
		 sqlText +=" insert_date, insert_user, update_date, update_user, svc \n";
		 sqlText +=" FROM own_vsl_sch_route_list \n";
		 if(request.body.carriercode !="" || request.body.pol !="" || request.body.pod != "") {
             sqlText +="  where \n";
         } 
         if(request.body.carriercode !="" && request.body.pol =="" && request.body.pol =="") {
             sqlText +="  upper(line_code) = upper('"+request.body.carriercode+"') \n";
         }
      
		 if(request.body.carriercode !="" && request.body.pol !="") {
             sqlText +="  and upper(start_route_code) = upper('"+ request.body.pol+"') \n";
		 } else if(request.body.carriercode =="" && request.body.pol !=""){
			 sqlText +="  upper(start_route_code) = upper('"+ request.body.pol+"') \n";
		 }
		if(request.body.carriercode !="" && request.body.pod != "") {
             sqlText +="  and upper(end_route_code) = upper('"+request.body.pod+"') \n";
		 } else if(request.body.carriercode =="" && request.body.pod !=""){
			 sqlText +="  upper(end_route_code) = upper('"+request.body.pod+"') \n";
		 }
		sqlText +=")a where curpage ='"+request.body.num+"' \n";


	       ;(async () => {
	    		const client = await pgsqlPool.connect();
	    		try {
	    			const result = await client.query(sql);
	    			response.status(200).json(result.rows);
	    		} finally {
	    			client.release();
	    		}
	    	})().catch(err => console.log(err))
	       /*
    pgsqlPool.connect(function(err,conn,release) {
        if(err){
            console.log("err" + err);
            
            response.status(400).send(err);
        } else {
            conn.query(sqlText, function(err,result){
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


        // conn.
    });*/
}

const getSchedulePortCodeList = (request, response) => {
    var sql = "select row_number() over (order by line_code) as num, line_code, port_name, iso_port_code"
               +" from own_vsl_sch_iso_port_code"
               +" where 1 = 1";
    
    if(request.body.data != '' && request.body.data != undefined){
        if(request.body.data.line_code != '' && request.body.data.line_code != undefined){
            sql += " and line_code = '" + request.body.data.line_code + "' ";
        }
        if(request.body.data.port_name != '' && request.body.data.port_name != undefined){
            sql += " and port_name = '" + request.body.data.port_name + "' ";
        }
    }

    console.log( sql );

    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }

                }
            });

        }


    });*/
}

const insertSchPortCode = ( request, response ) => {
    let dataRows = request.body.dataRows;
    console.log('insertSchPortCode' , request.body)
    const sql = {
        text: " INSERT INTO own_vsl_sch_iso_port_code (line_code, port_name, iso_port_code)"
        +     " VALUES($1, $2, $3) ",
        values: [request.body.newData.line_code, request.body.newData.port_name, request.body.newData.iso_port_code],
    }


    console.log('sql===',sql);

    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }

                }
            });

        }

    });*/
}

const updateSchPortCode = (request, response) => {
    console.log(request.body);
    const sql = {
        text: " update own_vsl_sch_iso_port_code "
        +" set line_code = $1 "
        +" ,port_name = $2 "
        +" ,iso_port_code = $3 "
        +" where line_code = $4 "
        +" and port_name =$5 "
        +" and iso_port_code = $6 ",
        values: [request.body.newData.line_code,
                request.body.newData.port_name,
                request.body.newData.iso_port_code,
                request.body.oldData.line_code,
                request.body.oldData.port_name,
                request.body.oldData.iso_port_code
            ],
    }
    console.log( sql )
    
           ;(async () => {
    		const client = await pgsqlPool.connect();
    		try {
    			const result = await client.query(sql);
    			response.status(200).json(result.rows);
    		} finally {
    			client.release();
    		}
    	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }

                }
            });

        }

    });*/
}

const deleteSchPortCode = (request, response) => {
    const sql = {
        text: " delete from own_vsl_sch_iso_port_code "
        +" where line_code = $1 "
        +" and port_name =$2 "
        +" and iso_port_code = $3 ",
        values: [request.body.oldData.line_code
            ,request.body.oldData.port_name
            ,request.body.oldData.iso_port_code],
    }
    console.log( sql )
           ;(async () => {
    		const client = await pgsqlPool.connect();
    		try {
    			const result = await client.query(sql);
    			response.status(200).json(result.rows);
    		} finally {
    			client.release();
    		}
    	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }
                }
            });

        }

    });*/
}

const getTSCodeList = (request, response) => {
    var sql = "select row_number() over (order by line_code, start_port_code, end_port_code) as num, line_code, start_port_code, end_port_code, ts"
               +" from own_code_ts"
               +" where 1 = 1";
    
    if(request.body.data != '' && request.body.data != undefined){
        if(request.body.data.line_code != '' && request.body.data.line_code != undefined){
            sql += " and line_code = upper('" + request.body.data.line_code + "') ";
        }
        if(request.body.data.start_port_code != '' && request.body.data.start_port_code != undefined){
            sql += " and start_port_code = upper('" + request.body.data.start_port_code + "') ";
        }
        if(request.body.data.end_port_code != '' && request.body.data.end_port_code != undefined){
            sql += " and end_port_code = upper('" + request.body.data.end_port_code + "') ";
        }
    }

    console.log( sql );
    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
    /*pgsqlPool.connect(function(err,conn,release) {
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


    });*/
}

const insertTSCode = ( request, response ) => {
    let dataRows = request.body.dataRows;
    console.log('insertTSCode' , request.body)
    const sql = {
        text: " INSERT INTO own_code_ts (line_code, start_port_code, end_port_code, ts, insert_user, insert_date)"
        +     " VALUES(upper($1), upper($2), upper($3), $4, $5, now()) ",
        values: [request.body.newData.line_code, request.body.newData.start_port_code, 
            request.body.newData.end_port_code, request.body.newData.ts, sUser.userno],
    }


    console.log('sql===',sql);
    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }
                }
            });

        }

    });*/
}

const updateTSCode = (request, response) => {
    console.log(request.body);
    const sql = {
        text: " update own_code_ts "
        +" set line_code = upper($1) "
        +" ,start_port_code = upper($2) "
        +" ,end_port_code = upper($3) "
        +" ,ts = upper($4), update_user = $5, update_date = now()"
        +" where line_code = $6 "
        +" and start_port_code =$7 "
        +" and end_port_code = $8 ",
        values: [request.body.newData.line_code,
                request.body.newData.start_port_code,
                request.body.newData.end_port_code,
                request.body.newData.ts,
                sUser.userno,
                request.body.oldData.line_code,
                request.body.oldData.start_port_code,
                request.body.oldData.end_port_code
            ],
    }
    console.log( sql )
           ;(async () => {
    		const client = await pgsqlPool.connect();
    		try {
    			const result = await client.query(sql);
    			response.status(200).json(result.rows);
    		} finally {
    			client.release();
    		}
    	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }
                }
            });

        }

    });*/
}

const deleteTSCode = (request, response) => {
    const sql = {
        text: " delete from own_code_ts "
        +" where line_code = $1 "
        +" and start_port_code =$2 "
        +" and end_port_code = $3 ",
        values: [request.body.oldData.line_code
            ,request.body.oldData.start_port_code
            ,request.body.oldData.end_port_code],
    }
    console.log( sql )
           ;(async () => {
    		const client = await pgsqlPool.connect();
    		try {
    			const result = await client.query(sql);
    			response.status(200).json(result.rows);
    		} finally {
    			client.release();
    		}
    	})().catch(err => console.log(err))
           
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }
                }
            });
        }

    });*/
}

const getPicCodeList = (request, response) => {
    var sql = "select row_number() over (order by line_code, pic_area, pic_dept, pic_name) as num, line_code, pic_area, pic_dept, pic_name, pic_tel, pic_email, pic_cell, pic_remark"
               +" from own_code_pic"
               +" where 1 = 1";
    
    if(request.body.data != '' && request.body.data != undefined){
        if(request.body.data.line_code != '' && request.body.data.line_code != undefined){
            sql += " and line_code = upper('" + request.body.data.line_code + "') ";
        }
        if(request.body.data.area != '' && request.body.data.area != undefined){
            sql += " and pic_area like '%" + request.body.data.area + "%'";
        }
        if(request.body.data.dept != '' && request.body.data.dept != undefined){
            sql += " and pic_dept like '%" + request.body.data.dept + "%'";
        }
        if(request.body.data.name != '' && request.body.data.name != undefined){
            sql += " and pic_name like '%" + request.body.data.name + "%'";
        }
    }

    console.log( sql );
    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }
                }
            });

        }


    });*/
}

const insertPicCode = ( request, response ) => {
    let dataRows = request.body.dataRows;
    console.log('insertPicCode' , request.body)
    const sql = {
        text: " INSERT INTO own_code_pic (line_code, pic_area, pic_dept, pic_name, pic_tel, pic_email, pic_cell, pic_remark, insert_user, insert_date)"
        +     " VALUES(upper($1), $2, $3, $4, $5, $6, $7, $8, $9, now()) ",
        values: [request.body.newData.line_code, request.body.newData.pic_area, 
            request.body.newData.pic_dept, request.body.newData.pic_name, request.body.newData.pic_tel,
            request.body.newData.pic_email, request.body.newData.pic_cell, request.body.newData.pic_remark, sUser.userno],
    }


    console.log('sql===',sql);
    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }
                }
            });

        }

    });*/
}

const updatePicCode = (request, response) => {
    console.log(request.body);
    const sql = {
        text: " update own_code_pic "
        +" set line_code = upper($1) "
        +" ,pic_area = $2 "
        +" ,pic_dept = $3 "
        +" ,pic_name = $4, pic_tel = $5, pic_email = $6, pic_cell = $7, pic_remark = $8, update_user = $9, update_date = now()"
        +" where line_code = $10 "
        +" and pic_area =$11 "
        +" and pic_dept = $12 "
        +" and pic_name = $13 ",
        values: [request.body.newData.line_code,
                request.body.newData.pic_area,
                request.body.newData.pic_dept,
                request.body.newData.pic_name,
                request.body.newData.pic_tel,
                request.body.newData.pic_email,
                request.body.newData.pic_cell,
                request.body.newData.pic_remark,
                sUser.userno,
                request.body.oldData.line_code,
                request.body.oldData.pic_area,
                request.body.oldData.pic_dept,
                request.body.oldData.pic_name
            ],
    }
    console.log( sql )
           ;(async () => {
    		const client = await pgsqlPool.connect();
    		try {
    			const result = await client.query(sql);
    			response.status(200).json(result.rows);
    		} finally {
    			client.release();
    		}
    	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }

                }
            });

        }

    });*/
}

const deletePicCode = (request, response) => {
    const sql = {
        text: " delete from own_code_pic "
        +" where line_code = $1 "
        +" and pic_area =$2 "
        +" and pic_dept = $3 "
        +" and pic_name = $4 ",
        values: [request.body.oldData.line_code
            ,request.body.oldData.pic_area
            ,request.body.oldData.pic_dept,request.body.oldData.pic_name],
    }
    console.log( sql )
           ;(async () => {
    		const client = await pgsqlPool.connect();
    		try {
    			const result = await client.query(sql);
    			response.status(200).json(result.rows);
    		} finally {
    			client.release();
    		}
    	})().catch(err => console.log(err))
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
                    if(result != null) {
                    	
                        response.status(200).json(result.rows);
                    } else {
                    	
                        response.status(200).json([]);
                    }
                }
            });

        }

    });*/
}

const shipChargeList = (request, response) => {
    console.log('request.body : ',request.body)
    let tsYn = request.body.tsYn;
    let sql = "";





    sql += " select b.num, b.total_cnt,b.tot_page,b.curpage,b.line_code, b.carrier, b.line_name ,to_char(to_date(b.effect_date,'YYYYMMDD'),'YYYY-MM-DD') as effect_date, (b.of_total + b.baf_total + b.lss_total + ebs_total) as total_amt, b.cntr_size, b.cntr_type, b.image_yn, "
    sql += " b.ts, b.coc_soc, b.goods, b.of_amt, b.of_unit, b.baf_unit, b.baf_amt, b.lss_unit, b.lss_amt "
    sql += " ,b.of_amt, b.of_unit ,b.baf_unit, b.baf_unit ,b.lss_amt, b.lss_unit, b.ebs_amt, b.ebs_unit, b.caf_amt, b.caf_unit, b.othc_amt, b.othc_unit, b.dthc_amt, b.dthc_unit "
    sql += " ,b.docu_amt, b.docu_unit, b.do_amt, b.do_unit, b.whf_amt, b.whf_unit, b.csf_amt, b.csf_unit, b.etc_amt, b.etc_unit, etc_remark, remark "
    sql += " from ( select count(*) over()/10+1 as tot_page, (row_number() over()) as num, count(*) over() total_cnt,floor(((row_number() over()) -1) /10 +1) as curpage, a.line_code, (select line_code from own_code_cuship occ where occ.id = a.line_code limit 1) as carrier, (select image_yn from own_code_cuship occ where occ.id = a.line_code limit 1) as image_yn, a.line_name, a.effect_date, "
    sql += " a.pol as origin, a.pol_nm, a.pld as destination, a.pld_nm, a.coc_soc, (case when of_unit ='미국 달러' then cast(of_amt as int) else 0 end) as of_total, (case when baf_unit ='미국 달러' then cast(baf_amt as int) else 0 end) as baf_total, "
    sql += " (case when lss_unit ='미국 달러' then cast(lss_amt as int) else 0 end) as lss_total, (case when ebs_unit ='미국 달러' then cast(ebs_amt as int) else 0 end) as ebs_total, a.cntr_size, a.cntr_type, a.goods, a.ts, "
    sql += " of_amt, of_unit, baf_unit, baf_amt, lss_unit, lss_amt, ebs_unit, ebs_amt, caf_unit, caf_amt, othc_unit, othc_amt, dthc_unit, dthc_amt, docu_unit, docu_amt, "
    sql += " do_unit, do_amt, whf_unit, whf_amt, csf_unit, csf_amt, etc_unit, etc_amt, etc_remark, remark from own_ship_charge a "
    sql += " where (line_code,effect_date, public_date, pol, pld, coc_soc, cntr_type, goods, ts) in( select b.line_code, b.effect_date, b.public_date, b.pol, b.pld, b.coc_soc, b.cntr_type, b.goods, b.ts from ( select row_number() over (partition by line_code, pol, pld, goods, coc_soc, cntr_type, cntr_size, ts order by effect_date desc, public_date desc) row_num, * from own_ship_charge osc "
    sql += " where effect_date < '"+request.body.startDate+"'"
    sql += " and line_code  <> '' )b where row_num = 1) "
    sql += request.body.carrierCode !==""? " and line_code = '"+request.body.carrierCode+"'":""
    sql += request.body.size !==""? " and cntr_size in("+request.body.size.substr(0,request.body.size.length-1)+")":""
    sql += request.body.type !==""? " and cntr_type in("+request.body.type.substr(0,request.body.type.length-1)+")":""
    sql += request.body.item !==""? " and goods in("+request.body.item.substr(0,request.body.item.length-1)+")":""
    sql += tsYn ==="TSY"? " and ts= 'Y' ":""
    sql += tsYn ==="TSN"? " and ts= 'N' ":""
    sql += request.body.cocNsoc !==""? " and coc_soc in("+request.body.cocNsoc.substr(0,request.body.cocNsoc.length-1)+")":""
    sql += request.body.origin !==""?" and pol = '"+request.body.origin+"'":""
    sql += request.body.destination !==""?" and pld = '"+request.body.destination+"'":""
    sql += " )b where curpage ='"+request.body.num+"'" 












    // sql += " and line_code ='"+request.body.carrierCode+"'"

    // sql += request.body.origin ===""?"":" and pol = '"+request.body.origin+"'"
    // sql += request.body.destination ===""?"":" and pld = '"+request.body.destination+"'"
    
    


    console.log(sql)

           ;(async () => {
    		const client = await pgsqlPool.connect();
    		try {
    			const result = await client.query(sql);
    			response.status(200).json(result.rows);
    		} finally {
    			client.release();
    		}
    	})().catch(err => console.log(err))
           /*
    pgsqlPool.connect(function(err,conn,release) {
        if(err){
            console.log("err" + err);
            release();
            response.status(400).send(err);
        } else {
            conn.query(sql, function(err,result){
                // done();
                if(err){
                    console.log(err);
                    release();
                    response.status(400).send(err);
                } else {
                    if(result != null) {
                    	release();
                        response.status(200).json(result.rows);
                    } else {
                    	release();
                        response.status(200).json([]);
                    }
                }
            });

        }

    });*/

}

module.exports = {
	    getCarrierInfo,
	    getScheduleList,
	    getPortCodeInfo,
	    getScheduleDetailList,
	    getScheduleSample,
        getSchedulePortCodeList,
        insertSchPortCode,
        updateSchPortCode,
        deleteSchPortCode,
        getLinePicInfo,
        getServiceCarrierList,
        getTerminalScheduleList,
        getTerminalCodeList,
        getTSCodeList,
        insertTSCode,
        updateTSCode,
        deleteTSCode,
        getPicCodeList,
        insertPicCode,
        updatePicCode,
        deletePicCode,
        shipChargeList
	}