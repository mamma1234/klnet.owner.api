import React,{useEffect, useState} from "react";
import { makeStyles } from  '@material-ui/core/styles'
import { 
    Paper,
    Grid,
    Select,
    InputLabel,
    FormControl,
    MenuItem,
    TableContainer,
    Table,
    TableHead,
    TableCell,
    TableRow,
    TableBody,
    TextField,
    IconButton
} from "@material-ui/core";
import {
    ExpandMore as DownIcon,
    ExpandLess as UpIcon
} from '@material-ui/icons'

const sampleData = [
    {work_name:'booking',index:1,table_column:'bkg_no',attribute:'bkg_no',view_name:'부킹번호'},
    {work_name:'booking',index:2,table_column:'bkg_date',attribute:'bkg_date',view_name:'부킹일자'},
    {work_name:'booking',index:3,table_column:'line_code',attribute:'line_code',view_name:'선사'},
    {work_name:'booking',index:4,table_column:'sch_line_code',attribute:'bkg_no',view_name:'부킹번호'},
    {work_name:'booking',index:5,table_column:'status_cus',attribute:'status_cus',view_name:'현재상태'},
    {work_name:'booking',index:6,table_column:'sch_pol',attribute:'sch_pol',view_name:'POL'},
    {work_name:'booking',index:7,table_column:'sch_pod',attribute:'sch_pod',view_name:'POD'},
]



const useStyles = makeStyles((theme) => ({
    root:{
        flexGrow:1,
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth:'800px'
    },
    fromControl: {
        margin: theme.spacing(1),
        minWidth:120
    },
    tablecontainer: {
	  width:'100%'
    },
    table: {
        minWidth: 750,
    },
    tableCell:{
        borderBottomWidth:'3px',
        fontWeight:'bold',
        color:'#717172',
        borderBottom:'2px solid #00b1b7'
    },
}));



function Row(callback) {
    const [value,setValue] = useState(callback.row);
    const [num, setNum] = useState(callback.num);
    const [changeName, setChangeName] = useState(callback.attribute);
    useEffect(() => {
        setValue(callback.row);
        setNum(callback.num);
    },[callback])


    return(
        <TableRow>
            <TableCell align="center">{value.index}</TableCell>
            <TableCell align="center">
                <TextField
                    value={changeName||''}
                    onChange={(e)=> setChangeName(e.target.value)}>
                </TextField>
            </TableCell>
            <TableCell align="center">{value.view_name}</TableCell>
            <TableCell align="center">
                {num!==(callback.maxLength-1) &&
                <IconButton onClick={() => callback.reFreshData(value,num,changeName,'down')}>
                    <DownIcon></DownIcon>
                </IconButton>}
                {num!==0 &&
                <IconButton onClick={() => callback.reFreshData(value,num,changeName,'up')}>
                    <UpIcon></UpIcon>
                </IconButton>}
            </TableCell>
        </TableRow>
    )
}


export default function Setting(callback) {
    const classes = useStyles();
    const [work, setWork] = useState("");
    const [userData, setUserData] = useState(sampleData);



    const onReFreshData = (value,num,changeName,status) => {
        if(status === "up") {
            rowUp(value,num,changeName)
        }else {
            rowDown(value,num,changeName)
        }
    }

    const rowUp = (value,num,changeName) => {
        const newRow = {
            work_name:value.work_name,
            index:value.index-1,
            table_column:value.table_column,
            attribute:changeName,
            view_name:value.view_name
        }
        const BeforeRow = {
            work_name:userData[num-1].work_name,
            index:userData[num-1].index+1,
            table_column:userData[num-1].table_column,
            attribute:userData[num-1].attribute,
            view_name:userData[num-1].view_name
        }
        
        setUserData(prv => {
            const Row = prv.map((element,index) => {
                console.log(element)
                if(element.index===newRow.index) {
                    return newRow
                }
                if(element.index===BeforeRow.index) {
                    return BeforeRow
                }else {
                    return element
                }
            }) 
                return(
                    Row
                )
            }
        )

    }
    const rowDown = (value,num,changeName) => {
        const newRow = {
            work_name:value.work_name,
            index:value.index+1,
            table_column:value.table_column,
            attribute:changeName,
            view_name:value.view_name
        }
        const BeforeRow = {
            work_name:userData[num+1].work_name,
            index:userData[num+1].index-1,
            table_column:userData[num+1].table_column,
            attribute:userData[num+1].attribute,
            view_name:userData[num+1].view_name
        }
        
        setUserData(prv => {
            const Row = prv.map((element,index) => {
                console.log(element)
                if(element.index===newRow.index) {
                    return newRow
                }
                if(element.index===BeforeRow.index) {
                    return BeforeRow
                }else {
                    return element
                }
            }) 
                return(
                    Row
                )
            }
        )
    }
    return (
        <div className={classes.root}>
          <Paper className={classes.paper}>
            <Grid container spacing={2}>
                
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <FormControl className={classes.fromControl}>
                                <InputLabel><span>SERVICE</span></InputLabel>
                                <Select
                                    value={work}
                                    onChange={(e)=>setWork(e.target.value)}>
                                    <MenuItem value={'booking'}>BOOKING</MenuItem>
                                    <MenuItem value={'sr'}>SR</MenuItem>
                                </Select>
                            </FormControl>
                            
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TableContainer className={classes.tablecontainer}>
                                <Table
                                    stickyHeader aria-label="sticky table"
                                    className={classes.table}
                                    aria-labelledby="tableTitle"
                                    size='medium'
                                    style={{borderTop:'2px solid #00b1b7', borderBottom:'2px solid #00b1b7'}}>
                                
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className={classes.tableCell} align="center">순번</TableCell>
                                            {/* <TableCell className={classes.tableCell} align="center">항목</TableCell> */}
                                            <TableCell className={classes.tableCell} align="center">변경할 이름</TableCell>
                                            <TableCell className={classes.tableCell} align="center">참조</TableCell>
                                            <TableCell className={classes.tableCell} align="center">정렬</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                    {userData.map((row,index) => (
                                        <Row key={index} row={row} num={index} maxLength={userData.length} reFreshData={onReFreshData}/>
                                    ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
          </Paper>
        </div>
    )
}