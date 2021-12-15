const pgsqlPool = require("../pool.js").pgsqlPool
const basicauth = require("basic-auth");
const multer = require('multer');
const fs = require('fs');
const sUser = require('../../models/sessionUser');







const companyList = (request, response) => {
   

    console.log(request.body);


    let sql = "";
    sql += " select b.* from (select count(*) over()/10+1 as tot_page, count(*) over() as tot_cnt, (row_number() over()) as num, count(*) over() total_cnt,floor(((row_number() over()) -1) /10 +1) as curpage, to_char(insert_date,'YYYY-MM-DD') as insert_date1,* from own_company ";
    sql += " where 1=1 "
    sql += request.body.id!==""?" and company_id = upper('"+request.body.id+"') ":""
    sql += request.body.name!==""?" and company_name like upper('%"+request.body.name+"%') ":""
    sql += request.body.bn!==""?" and business_number = '"+request.body.bn+"' ":""
    sql += request.body.status!==""?" and status = '"+request.body.status+"'":""
    sql += " )b where curpage ='"+request.body.num+"' " 

    console.log(sql);


    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
}


const searchCompany = (request,response) => {
  
  console.log(request.body);

  let sql = "";
  sql += " select a.* from own_company a, own_line_company b " 
  sql += " where 1=1 "
  sql += " and a.company_id = b.company_id "
  sql += " and b.line_code = '"+request.body.lineCode+"' "
  sql += " and a.status='Y' "
  sql += " and b.use_yn='Y' "
  sql += request.body.bn!==""?" and business_number = '"+request.body.bn+"' ":""
  
   

  console.log(sql);


  ;(async () => {
  const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }
})().catch(err => console.log(err))
}


const companySectionList = (request, response) => {
   

    console.log(request.body);


    let sql = "";
    sql += " select b.* from (select count(*) over()/10+1 as tot_page, (row_number() over()) as num, count(*) over() total_cnt,floor(((row_number() over()) -1) /10 +1) as curpage ,* from own_company_section ";
    sql += " where 1=1 "
    sql += request.body.id!==""?" and company_id = upper('"+request.body.id+"') ":""
    // sql += request.body.name!==""?" and company_name like upper('%"+request.body.name+"%') ":""
    // sql += request.body.bn!==""?" and business_number = '"+request.body.bn+"' ":""
    // sql += request.body.status!==""?" and status = '"+request.body.status+"'":""
    sql += " )b "
    sql += " where 1=1 "
    sql += request.body.num!==undefined?" and curpage ='"+request.body.num+"' " : "" 

    console.log(sql);


    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
}

const companySectionListUser = (request, response) => {
   

  console.log(request.body);


  let sql = "";
  sql += " select (select status from own_company_section_user_mapping c where b.company_id = c.company_id and b.section_id = c.section_id "
  sql += " and  user_no = '"+request.body.user.user_no+"') as user_stats, b.* from (select count(*) over()/10+1 as tot_page, (row_number() over()) as num, count(*) over() total_cnt,floor(((row_number() over()) -1) /10 +1) as curpage ,* from own_company_section ";
  sql += " where 1=1 "
  sql += request.body.id!==""?" and company_id = upper('"+request.body.id+"') ":""
  // sql += request.body.name!==""?" and company_name like upper('%"+request.body.name+"%') ":""
  // sql += request.body.bn!==""?" and business_number = '"+request.body.bn+"' ":""
  // sql += request.body.status!==""?" and status = '"+request.body.status+"'":""
  sql += " )b "
  sql += " where 1=1 "
  sql += request.body.num!==undefined?" and curpage ='"+request.body.num+"' " : "" 

  console.log(sql);


  ;(async () => {
  const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }
})().catch(err => console.log(err))
}


const checkCompany = (request,response) => {
    let sql ="";

    sql += " select * from public.own_company "
    sql += " where 1=1 "
    sql += " and company_id = upper('"+request.body.id+"') "

    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))


}



const companySave = (request, response) => {



    let sql = "";

    sql += " INSERT INTO public.own_company "
    sql += " (company_id, company_name, company_ename, business_number, company_master, sector, business_type, address, address_detail, address_number, status, insert_user, insert_date, phone, fax, company_email) "
    sql += " VALUES( "
    sql += " upper('"+request.body.id+"'), "
    sql += " upper('"+request.body.name+"'), "
    sql += " upper('"+request.body.ename+"'), "
    sql += " '"+request.body.bn+"', "
    sql += " '"+request.body.master+"', "
    sql += " '"+request.body.sector+"', "
    sql += " '"+request.body.bt+"', "
    sql += " '"+request.body.address+"', "
    sql += " '"+request.body.addressDetail+"', "
    sql += " '"+request.body.addressNumber+"', "
    sql += " 'P', "
    sql += " '"+sUser.userno+"', "
    sql += " now(), "
    sql += " '"+request.body.fax+"', "
    sql += " '"+request.body.tel+"', "
    sql += " '"+request.body.email+"' "
    sql += " )"
    
    console.log(sql);


    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
}


const checkSection = (request,response) => {
    let sql ="";

    sql += " select * from public.own_company_section "
    sql += " where 1=1 "
    sql += " and company_id = upper('"+request.body.id+"') "
    sql += " and section_id = upper('"+request.body.sId+"') "

    ;(async () => {
		const client = await pgsqlPool.connect();
		try {
			const result = await client.query(sql);
			response.status(200).json(result.rows);
		} finally {
			client.release();
		}
	})().catch(err => console.log(err))
}

const sectionSave = (request, response) => {

  let sql = "";

  sql += " INSERT INTO public.own_company_section "
  sql += " (company_id, section_id, klnet_id, detail_name, insert_date, insert_user) "
  sql += " VALUES( "
  sql += " upper('"+request.body.id+"'), "
  sql += " upper(lpad(cast(to_hex(nextval('section_id'))as varchar),4,'0')), "
  sql += " upper('"+request.body.klnetId+"'), "
  sql += " upper('"+request.body.name+"'), "
  sql += " now(), "
  sql += " '"+sUser.userno+"' "
  sql += " )"


  console.log(sql);


  ;(async () => {
  const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }
  })().catch(err => console.log(err))

}
const editSection = (request,response) => {
  
  let sql = "";
  sql += " UPDATE public.own_company_section "
  sql += " SET klnet_id=upper('"+request.body.klnetId+"'), detail_name=upper('"+request.body.name+"'), update_user=upper('"+sUser.userno+"'), update_date=now() "
  sql += " WHERE company_id=upper('"+request.body.id+"') AND section_id=upper('"+request.body.sId+"') "
  console.log(sql);


  ;(async () => {
  const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }
  })().catch(err => console.log(err))
}
const searchCompUser = (request,response) => {

  let sql = "";
  sql += " select b.* from ( "
  sql += " SELECT count(*) over()/10+1 as tot_page, (row_number() over()) as num, "
  sql += " count(*) over() total_cnt,floor(((row_number() over()) -1) /10 +1) as curpage, "
  sql += " a.user_no, a.company_id,(select company_name from own_company where a.company_id = company_id) as company_name, a.section_id, (select detail_name from own_company_section where a.company_id = company_id and a.section_id = section_id) as section_name, "
  sql += " a.authority, a.status, to_char(a.insert_date,'YYYY-MM-DD HH:mm:ss') as join_date, a.apply_date, a.remark, a.update_date, c.local_id, c.user_name, c.user_email, to_char(c.insert_date,'YYYY-MM-DD HH:mm:ss') as create_date "
  sql += " ,c.user_phone "
  sql += " FROM public.own_company_section_user_mapping a, own_comp_user c "
  sql += " where 1=1 "
  sql += " and a.user_no = c.user_no "
  sql += request.body.companyId!==""?" and a.company_id = upper('"+request.body.companyId+"') ":""
  sql += request.body.sectionId!==""?" and a.section_id = upper('"+request.body.sectionId+"') ":""
  sql += request.body.id!==""?" and a.user_no = upper('"+request.body.id+"') ":""
  sql += request.body.status!==""?" and a.status = upper('"+request.body.status+"') ":""
  sql += " )b "
  sql += " where 1=1 "
  sql += request.body.num !== undefined?" and b.curpage ='"+request.body.num+"' ":"" 

  console.log(sql);


  
  ;(async () => {
    const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }})().catch(err => console.log(err))



}


const updateCompanyUser = (request,response) => {
  let sql = "";

  sql += " UPDATE public.own_company_section_user_mapping "
  sql += " SET "
  sql += request.body.remark!==undefined?" remark = '"+request.body.remark+"', ":request.body.status!=="N"? " remark = '', ":""
  sql += " status='"+request.body.status+"', "
  sql += " update_date=now() "
  sql += " WHERE user_no='"+request.body.userNo+"' "
  sql += " and company_id ='"+request.body.compNo+"' "
  sql += " and section_id ='"+request.body.sectNo+"' "
  
  
  
  console.log(sql);
  ;(async () => {
    const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }})().catch(err => console.log(err))
}


const updateCompany = (request,response) => {
  let sql = "";
  sql+= " UPDATE public.own_company ";
  sql += " SET ";
  sql += request.body.compName !== null?" company_name=upper('"+request.body.compName+"'), ":"";
  sql += request.body.compEname !== null?" company_ename=upper('"+request.body.compEname+"'), ":"";
  sql += request.body.compNumber !== null? " business_number='"+request.body.compNumber+"', ":"";
  sql += request.body.compMaster !== null?" company_master=upper('"+request.body.compMaster+"'), ":"";
  sql += request.body.sector !== null?" sector='"+request.body.sector+"', ":"";
  sql += request.body.compBt !== null?" business_type='"+request.body.compBt+"', ":"";
  sql += request.body.compAddress !== null?" address='"+request.body.compAddress+"', ":"";
  sql += request.body.addressDetail !== null?" address_detail='"+request.body.addressDetail+"', ":"";
  sql += request.body.compAddressNumber !== null?" address_number='"+request.body.compAddressNumber+"', ":"";
  sql += request.body.status !== null?" status='"+request.body.status+"', ":"";
  sql += request.body.email !== null?" company_email='"+request.body.email+"', ":"";
  sql += request.body.fax !== null?" fax='"+request.body.fax+"', ":"";
  sql += request.body.tel !== null?" phone='"+request.body.tel+"', ":"";
  sql += " update_date=now(), " ;
  sql += " update_user='"+sUser.userno+"' ";
  sql += " WHERE company_id='"+request.body.id+"' "  ;
  console.log(sql);
  ;(async () => {
    const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }})().catch(err => console.log(err))
}

const searchIdentify =(request,response) => {


  let sql = "";

  sql += " select b.* from ( "
  sql += " SELECT count(*) over()/10+1 as tot_page, (row_number() over()) as num, "
  sql += " count(*) over() total_cnt,floor(((row_number() over()) -1) /10 +1) as curpage, "
  sql += " * "
  sql += " FROM own_company_identify "
  sql += " where 1=1 "
  sql += request.body.companyId!==""?" and company_id = upper('"+request.body.companyId+"') ":""
  sql += request.body.sectionId!==""?" and section_id = upper('"+request.body.sectionId+"') ":""
  sql += request.body.workCode!==""?" and work_code = upper('"+request.body.workCode+"') ":""
  sql += " )b where b.curpage ='"+request.body.num+"' " 


  console.log(sql)
  ;(async () => {
    const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }})().catch(err => console.log(err))

}

const companyUserSearch = (request,response) => {
  console.log(request.body)
  let sql = "select *,a.status as user_status from own_company_section_user_mapping a, own_company b, own_company_section c "
  sql += " where 1=1 "
  sql += " and a.company_id = b.company_id and a.company_id = c.company_id and a.section_id = c.section_id "
  sql += " and user_no = '"+request.body.userno.user_no+"'" 
  console.log(sql)
  ;(async () => {
    const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }})().catch(err => console.log(err))
}

// const insertCompanyUser = (request,response) => {
//   let sql = ""
//   console.log(request.body);

//   sql+= " INSERT INTO public.own_company_section_user_mapping "
//   sql+= " (user_no, company_id, section_id, insert_date, insert_user) "
//   sql+= " VALUES('"+request.body.user.user_no+"', '"+request.body.company_id+"', "
//   sql+= " '"+request.body.section_id+"', now(), 'TESTER' );"
//   console.log(sql)
//   ;(async () => {
//     const client = await pgsqlPool.connect();
//   try {
//     const result = await client.query(sql);
//     response.status(200).json(result.rows);
//   } finally {
//     client.release();
//   }})().catch(err => console.log(err))
// }




const insertCompanyUser = (request,response) => {

  

  let sql ="";
  sql+= " select * from ( select company_id, section_id, sum(case when work_code = 'BOOKING' then 1 else 0 end + " 
  sql+= " case when work_code = 'SR' then 1 else 0 end + case when work_code = 'VGM' then 1 else 0 end + case when work_code = 'DECLARE' then 1 else 0 end) as cnt from "
  sql+= " own_company_identify  where company_id ='"+request.body.param.company_id+"' "
  sql+= " group by company_id, section_id "
  sql+= " ) x where cnt > 3 limit 1 "
   
  console.log(sql);


  
  ;(async () => {
    const client = await pgsqlPool.connect();
  try {
    const checkResult = await client.query(sql);

    if(checkResult.rowCount === 0 ){
      let Idsql = " select upper(lpad(cast(to_hex(nextval('section_id'))as varchar),4,'0')) as section_id "
      ;(async () => {
        const checkConnection = await pgsqlPool.connect();
        try {
          const result = await checkConnection.query(Idsql);

          if(result.rowCount > 0) {
              let insertSql =""  
              insertSql+=" INSERT INTO public.own_company_section "
              insertSql+=" (company_id, section_id, klnet_id, detail_name, insert_user) "
              insertSql+=" VALUES( "
              insertSql+=" '"+request.body.param.company_id+"', "
              insertSql+=" '"+result.rows[0].section_id+"', "
              insertSql+=" 'KLTEST', "
              insertSql+=" 'KLNAME', "
              insertSql+=" '"+request.body.user.user_no+"');";

              insertSql+=" INSERT INTO public.own_company_section_user_mapping "
              insertSql+=" (user_no, company_id, section_id, authority, status) "
              insertSql+=" VALUES( "
              insertSql+=" '"+request.body.user.user_no+"', "
              insertSql+=" '"+request.body.param.company_id+"', "
              insertSql+=" '"+result.rows[0].section_id+"', "
              insertSql+=" 'N', "
              insertSql+=" 'Y');"
              
              insertSql+=" INSERT INTO public.own_company_identify "
              insertSql+=" (company_id, section_id, work_code, recipient, originator, work_alias, insert_user) "
              insertSql+=" VALUES "
              insertSql+=" ('"+request.body.param.company_id+"', "
              insertSql+=" '"+result.rows[0].section_id+"', 'VGM', 'KLKLNETDOCS', 'KLKLNETDOCS','VG', "
              insertSql+=" '"+request.body.user.user_no+"'), "
              insertSql+=" ('"+request.body.param.company_id+"', "
              insertSql+=" '"+result.rows[0].section_id+"', 'BOOKING', 'KLKLNETDOCS', 'KLKLNETDOCS','BK', "
              insertSql+=" '"+request.body.user.user_no+"'), "
              insertSql+=" ('"+request.body.param.company_id+"', "
              insertSql+=" '"+result.rows[0].section_id+"', 'DECLARE', 'KLKLNETDOCS', 'KLKLNETDOCS','DE', "
              insertSql+=" '"+request.body.user.user_no+"'), "
              insertSql+=" ('"+request.body.param.company_id+"', "
              insertSql+=" '"+result.rows[0].section_id+"', 'SR', 'KLKLNETDOCS', 'KLKLNETDOCS','SR', "
              insertSql+=" '"+request.body.user.user_no+"')"
              console.log('insertSql',insertSql);

              ;(async () => {
                const insertConnection = await pgsqlPool.connect();
                try {
                  const insertResult = await insertConnection.query(insertSql);
                  response.status(200).send("SUCCESS");
                }finally {
                  insertConnection.release();
                }})().catch(err => console.log(err))
          }else {
            response.status(500).send("ERROR");
          }
        } finally {
          checkConnection.release()
        }})().catch(err=>console.log(err))
    }else {
      let DupInsertSql = ""
      DupInsertSql+=" INSERT INTO public.own_company_section_user_mapping "
      DupInsertSql+=" (user_no, company_id, section_id, authority, status, insert_user) "
      DupInsertSql+=" VALUES( "
      DupInsertSql+=" '"+request.body.user.user_no+"', "
      DupInsertSql+=" '"+checkResult.rows[0].company_id+"', "
      DupInsertSql+=" '"+checkResult.rows[0].section_id+"', "
      DupInsertSql+=" 'N', "
      DupInsertSql+=" 'Y', "
      DupInsertSql+=" '"+request.body.user.user_no+"');"
      ;(async () => {
        const insertConnection = await pgsqlPool.connect();
        try {
          const insertResult = await insertConnection.query(DupInsertSql);
          response.status(200).send("SUCCESS").json(insertResult);
        }finally {
          insertConnection.release();
        }})().catch(err => console.log(err))

    }
  } finally {
    client.release();
  }})().catch(err => console.log(err))

}




const searchMappingUser = (request, response) => {
  console.log(request.body);
  let sql =""
  sql+= " select * from own_company_section_user_mapping ocsum where user_no = '"+request.body.user.user_no+"' "
  console.log(sql);
  ;(async () => {
    const client = await pgsqlPool.connect();
  try {
    const result = await client.query(sql);
    response.status(200).json(result.rows);
  } finally {
    client.release();
  }})().catch(err => console.log(err));
}
const deleteMappingUser =(request,response) => {
  try {
  console.log(request.body);
  let sql ="";
  if( request.body.user !== undefined && request.body.user !== null && request.body.user !== "" &&
      request.body.company_id !== undefined && request.body.company_id !== null && request.body.company_id !== "" &&
      request.body.section_id !== undefined && request.body.section_id !== null && request.body.section_id !== "" 
  ) {
    sql += " DELETE FROM public.own_company_section_user_mapping "
    sql += " WHERE user_no='"+request.body.user+"' AND company_id='"+request.body.company_id+"' AND section_id='"+request.body.section_id+"'"
    console.log(sql);
    ;(async () => {
      const client = await pgsqlPool.connect();
    try {
      const result = await client.query(sql);
      response.status(200).json(result.rows);
    } finally {
      client.release();
    }})().catch(err => console.log(err))
  } else {
    response.status(404).send("Bad Request");
  }
  }catch(e) {
    console.log(e)
  }
}
const selectUserCompany = (request,response) => {
	let sql ="";
	console.log(request.body);
	sql += " select * from own_company a "
	sql += " where company_id in(select company_id from own_company_section_user_mapping ocsum "
  sql += " where 1=1 "
  sql += " and user_no = '"+request.body.user.user_no+"'"
	sql += " group by company_id) "

	console.log(sql);
	(async () => {
		const client = await pgsqlPool.connect();
		try {
			const res = await client.query(sql);
			response.status(200).json(res.rows);
		} finally {
			client.release();
		}
	})().catch(err => setImmediate(() => {console.log("[ERROR]",err); response.status(400).json(err); }))

}
module.exports = {
    companyList,
    searchCompany,
    companySectionList,
    companySectionListUser,
    companySave,
    checkCompany,
    checkSection,
    sectionSave,
    editSection,
    searchCompUser,
    updateCompanyUser,
    updateCompany,
    searchIdentify,
    companyUserSearch,
    insertCompanyUser,
    searchMappingUser,
    deleteMappingUser,
    selectUserCompany
}