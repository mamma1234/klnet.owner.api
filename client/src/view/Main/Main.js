import React,{useEffect, useState, useRef } from "react";
import { 
    makeStyles 
} from  '@material-ui/core/styles'
import { 
    Grid,
} from "@material-ui/core";
import axios from 'axios'
import LoginView from 'view/Main/Login'
import LogoutView from 'view/Main/LogOut'


const useStyles = makeStyles((theme) => ({
    root:{
        flexGrow:1,
    },
    paper: {
        textAlignLast:'center',
        margin:0
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
    center:{
        marginLeft:'auto',
        marginRight:'auto',
        marginTop:'20px'
    },
    mt20:{
        marginTop:'20px'
    }
}));


export default function Main(callback) {
    const classes = useStyles();
    const [user,setUser] = useState(null);
	useEffect(() => {
        axios.get("/auth/verify")
        .then(res => {
            console.log(res.data.user)
                setUser(res.data.user);
            });
    },[]);
    return (
        <>
           {user? (
            <Grid container style={{justifyContent:'center',justifyItems:'center', marginTop:'10px'}}>
                <Grid className={classes.center} item xs={5} md={5} sm={5} >
                    <LoginView setUser={(e)=>setUser(e)} user={user}/>
                </Grid>
            </Grid>
            ):(
            <Grid container style={{justifyContent:'center',justifyItems:'center', marginTop:'10px'}}>
                <Grid className={classes.center} item xs={5} md={5} sm={5} >
                    <LogoutView/>
                </Grid>
            </Grid>
            )}
        </>
    )
}