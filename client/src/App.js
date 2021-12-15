import React,{useEffect, useState, useRef} from "react";
import Home from 'view/Main/Main';
import ColumnSetting from 'view/Settings/ColumnSetting'
import { BrowserRouter,Router, Route, Switch } from "react-router-dom";





export default function App(callback) {
    const header =useRef();
    const NoMatch = (arg) => {
        return (
        <h3>Not Found Page</h3>
        );
      }
    return(
        <body>
            <div className="app">
                <header className="app-header"  ref={header} >     
                    <div className="app-header__inner">
                        <strong className="app-header__logo">
                            <a href="/" className="app-header__logo--link">
                            </a>
                        </strong>
                    </div>
                </header>
                <main className="app-container">
                    <div className="figure__caption"></div>
                    
                </main>
            </div>
            <BrowserRouter>
                <Switch>
                <Route path="/setting" component={ColumnSetting}></Route>
                <Route path="/" exact component={Home}></Route>
                <Route component={NoMatch} />
                
                </Switch>
            </BrowserRouter>
        </body>
    )
}