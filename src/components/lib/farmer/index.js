import React from 'react';
import { NavigationBar} from '../../common';
import { Outlet, Navigate} from 'react-router-dom';
import { userIsAuth } from '../../../authentication';
import '../../../responsive.css';

function Farmer() {    
    const sessionCheck = userIsAuth();

    if (!sessionCheck || sessionCheck === false) {        
        return (
            <Navigate to="/" replace />
        )        
    }

    return (        
        <div className="min-vh-100">
            <NavigationBar showControls={true} />
            <div className="content">  
                <Outlet/>
            </div>            
        </div>
    );
}


export default Farmer;