import React,{useEffect, useState } from "react";
import { makeStyles } from  '@material-ui/core/styles'
import { 
    Card, 
    CardContent, 
    CardHeader, 
    Grid, 
    Button, 
    CardActions,
} from "@material-ui/core";
import {
    Settings as Setting,
    Forward as Forward
} from '@material-ui/icons'
import axios from 'axios'
import { Link } from "react-router-dom";



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

export default function LoginView(callback) {

    const [user, setUser] = useState(callback.user);
    const [apiKey, setApiKey] = useState(callback.user.api_service_key)
    useEffect(() => {
        console.log(callback)
        setUser(callback.user);
    },callback);

    const classes = useStyles();
    const isLogOut = (e)=>{
        e.preventDefault();
        axios.post("/auth/logout")
        .then(res => {
            callback.setUser(null);
        }).catch(err => {
            console.log(err); 
        });  
    }

    const onCreateApikey = () => {
        axios.post('/api/createApikey',{id:user.local_id, no:user.user_no}).then(
            res => {
                if(res.statusText==="OK") {
                    console.log(res.data)
                    if(res.data) {
                        switch (res.data.state) {
                            case "none":
                                setApiKey("");
                                break;
                            case "new":
                                setApiKey(res.data.data);
                                break;
                            case "exist":
                                setApiKey(res.data.data);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
        )
    } 
    
    return (
        <Card className={classes.paper}>
            <CardHeader
                title="MEMBER LOGIN">
            </CardHeader>
            <CardContent>
                <Grid container>
                    <Grid item xs={12} md={12} sm={12}>
                        <span>{`${user.user_name}님 반갑습니다.`}</span>
                    </Grid>
                    <Grid className={classes.mt20} item xs={12} md={12} sm={12}>
                        {apiKey !==null? (
                            <span>{`KEY : ${apiKey}`}</span>
                        ):(
                            <Button variant="contained" color="default" onClick={(e)=> onCreateApikey()}>API 키 발급</Button>
                        )}
                        
                    </Grid>
                    <Grid item xs={6} md={6} sm={6} className={classes.center}>
                        <Button variant="contained" color="default" fullWidth onClick={(e)=> isLogOut(e)} >LogOut</Button>
                    </Grid>
                </Grid>
            </CardContent>
            <CardActions>
                <Link to="/setting">
                    <Button startIcon={<Setting/>}>SETTING</Button>
                </Link>
                <a style={{marginLeft:'auto'}} href="https://api.plismplus.com">
                <Button endIcon={<Forward/>}>API 이동</Button>
                </a>
            </CardActions>
        </Card>
    )
}

