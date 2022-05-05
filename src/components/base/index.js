import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
} from 'react-router-dom';
import {
    HomeWidget, 
    ChatWidget, 
    SalesWidget, 
    FarmWidget,
    Farmer,
    Gate
} from '../lib';
// Components
// Components CSS

function FreshHarvest(){
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Gate/> }/>
                <Route path="/farmer" element={<Farmer/>}>
                    <Route path="home" element={<HomeWidget/>}/>
                    <Route path="mail" element={<ChatWidget/>}/>
                    <Route path="farm" element={<FarmWidget/>}/>
                    <Route path="sales" element={<SalesWidget/>}/>
                </Route>
            </Routes>        
        </BrowserRouter>
    );
}


export default FreshHarvest;