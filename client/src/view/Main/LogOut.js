import React,{useEffect, useState, useRef } from "react";
import { makeStyles } from  '@material-ui/core/styles'
import { 
    Card, TextField,CardContent, CardHeader, Grid, Button, FormControl, InputLabel, InputAdornment, Input, CardActions, Form
} from "@material-ui/core";
import {
    AccountCircle as AccountCircle,
    Lock as Lock,
    Settings as Setting,
    Forward as Forward
} from '@material-ui/icons'
import axios from 'axios'




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

export default function LogoutView(callback) {
    const classes = useStyles();
    const [id, setId] = useState("");
    const [password, setPassword] = useState("");
    
    return (
        <Card className={classes.paper}>
            <CardHeader
                title="MEMBER LOGIN">
            </CardHeader>
            <CardContent>
                <form action="http://localhost:5002/oauth/authorize" method="post">
                    <Grid container>
                        <input type='hidden' name='client_id' value='bWFtbWEgTTAwMDAwMA=='></input>
                        <input type='hidden' name='redirect_uri' value='http://localhost:5005/auth/local/callback'></input>
                        <input type='hidden' name='response_type' value='code'></input>
                        <input type='hidden' name='state' value='12345'></input>
                        {/* 서버반영
                        <input type='hidden' name='redirect_uri' value='/auth/local/callback'></input> */}
                        <Grid item xs={12} md={12} sm={12} >
                            <Grid className={classes.mt20} item xs={12} md={12} sm={12}>
                                <TextField
                                    id="id"
                                    name="id"
                                    label="USER ID"
                                    type="text"
                                    value={id}
                                    onChange={(e)=>setId(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle/>
                                        </InputAdornment>
                                        )
                                    }}>
                                </TextField>
                            </Grid> 
                            <Grid className={classes.mt20} item xs={12} md={12} sm={12}>
                                <TextField
                                    id="pw"
                                    name="pw"
                                    label="PASSWORD"
                                    type="password"
                                    value={password}
                                    onChange={(e)=>setPassword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Lock/>
                                            </InputAdornment>
                                        )
                                    }}>
                                </TextField>
                            </Grid> 
                        </Grid>
                        <Grid item xs={6} md={6} sm={6} className={classes.center}>
                            <Button variant="contained" color="default" type='submit' fullWidth>LOGIN</Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>
            <CardActions>
                <Button 
                    style={{marginLeft:'auto'}}
                    endIcon={<Forward/>}
                >API 이동</Button>
            </CardActions>
        </Card> 
    )
}






