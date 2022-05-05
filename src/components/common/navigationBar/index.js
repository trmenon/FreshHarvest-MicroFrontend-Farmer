import React, {useState} from "react";
import PropTypes from 'prop-types';
import { signout } from "../../../services";
import { signoutUser } from "../../../authentication";
import { useNavigate, Link  } from "react-router-dom";
import config from '../../../constants/config.json';


// Material UI imports
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { lightGreen } from "@mui/material/colors";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const NavigationBar = (props)=> {
    const navigate = useNavigate();
    const [state, setState]= useState({
        anchorElNav: null,
        selected: 0
    });
    const handleOpenNavMenu = (event) => {
        setState({...state, anchorElNav: event.currentTarget});
    };
       
    const handleCloseNavMenu = () => {
        setState({...state, anchorElNav: null});
    };

    const handleSignout = async()=> {
        signoutUser();
        signout().subscribe({
            next: (data)=> {
                console.log(data);
                if(data?.success === true) {
                    alert(data?.message);
                    navigate("/");
                }
            },
            error: (error)=> {
                console.log("ERROR");
                console.log(error);
            }
        });
    }

    return (
        <AppBar position="static" color="success">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                    >
                        <Avatar
                            alt="Fresh Harvest" 
                            sx={{ bgcolor: lightGreen[500], width: 46, height: 46 }}
                        >
                            FH                   
                        </Avatar>
                        Fresh Harvest
                    </Typography>

                    {props.showControls === true ?
                        <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={state.anchorElNav}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                open={Boolean(state.anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{ display: { xs: 'block', md: 'none' } }}
                                keepMounted
                            >
                                {config.serviceDictionary.directory.map((element) => {
                                    return(
                                        <MenuItem 
                                            key={element.id} 
                                            onClick={handleCloseNavMenu}
                                        >
                                            <Link
                                                // className= {state.selectedService==="HOME"?"selected":""} 
                                                to={element.route} 
                                            >
                                                {element.name}
                                            </Link> 
                                        </MenuItem>
                                    )                                
                                })}
                            </Menu>
                        </Box> : ""
                    }
                    

                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
                    >
                        <Avatar
                            alt="Fresh Harvest" 
                            sx={{ bgcolor: lightGreen[500], width: 46, height: 46 }}
                        >
                            FH                   
                        </Avatar>
                        Fresh Harvest
                    </Typography>

                    {props.showControls === true?
                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                            {config.serviceDictionary.directory.map((element) => {
                                return(
                                    <Button
                                        key={element.id}
                                        onClick={()=> {
                                            setState({...state, selected: element.id});
                                            navigate(element.route);
                                        }}
                                        sx={{ 
                                            my: 2, 
                                            color: 'white', 
                                            display: 'block'
                                        }}
                                        variant="outlined"
                                        color={state.selected === element.id? "secondary": "success"}
                                    >
                                        {element.display}
                                    </Button>
                                )
                            })}
                        </Box> : ""
                    }
                    

                    {props.showControls === true? 
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Signout">
                                <IconButton 
                                    onClick={handleSignout} sx={{ p: 0 }}
                                >
                                    <ExitToAppIcon/>
                                </IconButton>
                            </Tooltip>
                        </Box>: ""
                    }
                    
                </Toolbar>
            </Container>
        </AppBar>
    );
}

NavigationBar.propTypes= {
    showControls: PropTypes.bool.isRequired
}

NavigationBar.defaultProps = {
    showControls: false
}

export default NavigationBar;