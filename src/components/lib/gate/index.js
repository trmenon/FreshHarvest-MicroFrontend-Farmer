import React, {useState} from "react";
import { useNavigate  } from "react-router-dom";
import { authenticateUser, signoutUser } from "../../../authentication";
import { NavigationBar} from '../../common';
import '../../../responsive.css';
import farm from '../../../assets/farm-illustration.jpg';
import {Form } from 'react-bootstrap';

// Material UI imports
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

// Services import
import {signin, signout, signup} from '../../../services';


function Gate(){
    // Handling prelim inits
    const clearInit = async()=> {
        signoutUser();
        signout().subscribe({
            next: (data)=> {
                console.log(data);
                if(data?.success === true) {
                    console.log("Signout api acheived");
                }
            },
            error: (error)=> {
                console.log("ERROR");
                console.log(error);
            }
        });
    }
    // Clearing cookie, localstorage and session
    clearInit();
    const navigate = useNavigate();
    const [state, setState] = useState({
        newUser: false,
        registerData: {name: "", email: "", password: "", passwordConf: ""},
        signinData: {email: "", password: ""},
        error: false,
        response: {success: false, error: false, message: ""}
    })

    const handleToggle = ()=> {
        const requiredState = state.newUser === false? true: false;
        setState({
            ...state, 
            newUser: requiredState,
            registerData: {name: "", email: "", password: "", passwordConf: ""},
            signinData: {email: "", password: ""},
            error: false,
            response: {success: false, error: false, message: ""}
        });
    }
    
    const runValidations = ()=> {
        setState({
            ...state,
            error: false,
            response: {success: false, error: false, message: ""}
        })
        // Creating data for validation
        const validationData = state.newUser === false? state.signinData: state.registerData;
        let validationStatus = false;
        // Validations for register
        if(state.newUser === false) {
            if(
                validationData.email.length === 0 ||
                validationData.password.length === 0
            ) {
                validationStatus = false;
            }else {
                validationStatus = true;
            }
        }

        // Validations for signin
        if(state.newUser === true) {
            if(
                validationData.name.length === 0 ||
                validationData.email.length === 0 ||
                validationData.password.length === 0 ||
                validationData.passwordConf.length === 0 ||
                validationData.passwordConf !== validationData.password
            ) {
                validationStatus = false;
            }else {
                validationStatus = true;
            }
        }
        return validationStatus;
    }

    const handleFormSubmit = ()=> {
        console.log("Form Submitted");
        const status = runValidations();
        console.log(status);
        if(status === false) {
            setState({...state, error: true});
        }else {
            setState({...state, error: false});
            if(state.newUser === false) {
                signinDriver();
            }
            if(state.newUser === true) {
                signupDriver();
            }
        }

    }

    const signinDriver = async()=> {
        const data = {
            email: state.signinData.email.trim(), 
            password: state.signinData.password.trim()
        };
        signin(data).subscribe({
            next: (data)=> {
                console.log(data);
                if(data?.success === true) {
                    if(data?.data?.role === "Farmer") {
                        const authData = { token : data?.token, user : data?.data };
                        const auth = authenticateUser(authData);
                        if(auth === true) {
                            navigate("/farmer/home");
                        }
                    }else {
                        setState({
                            ...state, 
                            response: {
                                success: false, 
                                error: true, 
                                message: "Are you a farmer?"
                            }
                        });
                    }
                    
                }else {
                    setState({
                        ...state, 
                        response: {
                            success: false, 
                            error: true, 
                            message: data?.message
                        }
                    });
                }
            },
            error: (error)=> {
                console.log("ERROR");
                console.log(error);
            }
        });
    }

    const signupDriver = ()=> {
        const data = {
            name: state.registerData.name.trim(), 
            email: state.registerData.email.trim(), 
            role: "Farmer", 
            imageUrl: "DEFAULT", 
            password: state.registerData.password.trim()
        };
        signup(data).subscribe({
            next: (data)=> {
                console.log(data);
                if(data?.success === true) {
                    setState({
                        ...state, 
                        response: {
                            success: true, 
                            error: false, 
                            message: data?.message
                        }
                    });
                }else {
                    setState({
                        ...state, 
                        response: {
                            success: false, 
                            error: true, 
                            message: data?.message
                        }
                    });
                }
            },
            error: (error)=> {
                console.log("ERROR");
                console.log(error);
            }
        });
    }

    

    return (
        <React.Fragment>            
            <NavigationBar showControls={false}/>
            <Card
                raised
                sx={{ 
                    width: 'auto',
                    marginTop: 2,
                    mx: {xs: 10, sm: 15, md: 30, lg: 50}

                }} 
                className="content"
            >
                <CardHeader title={state.newUser === false? "Signin": "Signup"} />
                <CardMedia
                    component="img"
                    height="120"
                    image={farm}
                    alt="Farm Fresh"
                />
                <CardContent>
                    {state.error === true?
                        <Alert severity="error" sx={{my: 2}}>Please enter valid details</Alert>:""
                    }
                    {state.response.success === true?
                        <Alert severity="success" sx={{my: 2}}>
                            {state.response.message}
                        </Alert>
                        :
                        ""
                    }
                    {state.response.error === true?
                        <Alert severity="error" sx={{my: 2}}>
                            {state.response.message}
                        </Alert>
                        :
                        ""
                    }
                    <Form>
                        <Stack spacing={2} mx={5}>
                            {state.newUser === false?
                                <React.Fragment>
                                    <TextField 
                                        id="signinEmail" 
                                        label="Registered Email" 
                                        variant="outlined" 
                                        value= {state.signinData.email}   
                                        type='email'  
                                        required                                  
                                        onChange= {(event)=> {
                                            setState({
                                                ...state,
                                                signinData: {
                                                    ...state.signinData,
                                                    email: event.target.value
                                                }
                                            })
                                        }} 
                                    />
                                    <TextField 
                                        id="signinPassword" 
                                        label="Password" 
                                        variant="outlined"
                                        type="password"
                                        value= {state.signinData.password}
                                        required
                                        onChange= {(event)=> {
                                            setState({
                                                ...state,
                                                signinData: {
                                                    ...state.signinData,
                                                    password: event.target.value
                                                }
                                            })
                                        }}  
                                    />
                                </React.Fragment>
                                :
                                <React.Fragment>
                                    
                                    <TextField 
                                        id="registerName" 
                                        label="Name" 
                                        variant="outlined" 
                                        value= {state.registerData.name}
                                        onChange= {(event)=> {
                                            setState({
                                                ...state,
                                                registerData: {
                                                    ...state.registerData,
                                                    name: event.target.value
                                                }
                                            })
                                        }} 
                                    />
                                    <TextField 
                                        id="registerEmail" 
                                        label="Email" 
                                        variant="outlined" 
                                        value= {state.registerData.email}
                                        onChange= {(event)=> {
                                            setState({
                                                ...state,
                                                registerData: {
                                                    ...state.registerData,
                                                    email: event.target.value
                                                }
                                            })
                                        }} 
                                    />
                                    <TextField 
                                        id="registerPassword" 
                                        label="Password" 
                                        variant="outlined"
                                        type="password" 
                                        value= {state.registerData.password}
                                        onChange= {(event)=> {
                                            setState({
                                                ...state,
                                                registerData: {
                                                    ...state.registerData,
                                                    password: event.target.value
                                                }
                                            })
                                        }} 
                                    />
                                    <TextField 
                                        id="registerPasswordConf" 
                                        label="Retype Password" 
                                        variant="outlined" 
                                        type="password"
                                        value= {state.registerData.passwordConf}
                                        onChange= {(event)=> {
                                            setState({
                                                ...state,
                                                registerData: {
                                                    ...state.registerData,
                                                    passwordConf: event.target.value
                                                }
                                            })
                                        }} 
                                    />
                                </React.Fragment>
                            }                            
                        </Stack>
                    </Form>
                </CardContent>
                <CardActions 
                    sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                    <Stack spacing={2}>
                        <Button 
                            variant="outlined"
                            color= "secondary"
                            onClick = {handleFormSubmit}
                        >
                            {state.newUser === false? "Login" : "Sign up"}
                        </Button>
                        <Button 
                            onClick = {handleToggle}
                        >
                            {state.newUser === false? "Help me register" : "Take me to Login screen"}
                        </Button>
                    </Stack>                   
                </CardActions>
            </Card>
        </React.Fragment>
    );
}

export default Gate;