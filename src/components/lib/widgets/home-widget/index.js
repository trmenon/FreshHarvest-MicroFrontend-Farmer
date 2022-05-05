import React, { Component} from "react";

// Service imports
import { getFarmOfOwner,} from '../../../../services';

// Material UI imports
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { lightGreen } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

class HomeWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
          farm: {exist: false, name: ''}
        };
    }

    componentDidMount() {
        this.getFarm();
    }

    componentDidUpdate() {
        console.log("Home Widget mounted");        
    }

    getFarm = ()=> {
        try {
            getFarmOfOwner(JSON.parse(localStorage.user)['_id']).subscribe({
                next: (response)=> {
                    if(response.success === true) {
                        this.setState({
                            ...this.state, 
                            farm: {exist: true, name: response.data.name}
                        });
                    }
                },
                error: (error)=> {
                    console.log("[ERROR: API] Getting farm info");
                    console.log(error);
                },
            })
        }catch(err) {
            console.log("[ERROR] Getting farmers farm");
            console.log(err);
        }
    }

    render() {
        return(
            <React.Fragment>
                <Paper elevation= {8} sx={{my: 2, p: 4, width: '100%'}}>
                    <Stack direction="row" spacing={2}>
                        <Avatar sx={{ bgcolor: lightGreen[900], p:4 }}>
                            <AgricultureIcon />
                        </Avatar>
                        <Stack 
                            direction="column" 
                            spacing={1}
                            
                        >
                            <Typography 
                                variant="h6" 
                                gutterBottom 
                                component="div"
                                sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}
                            >
                                {JSON.parse(localStorage.user)['name']}
                            </Typography>
                            <Typography 
                                variant="h6" 
                                gutterBottom 
                                component="div"
                                sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}
                            >
                                {JSON.parse(localStorage.user)['email']}
                            </Typography>
                            <Typography 
                                variant="h6" 
                                gutterBottom 
                                component="div"
                                sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start'}}
                            >
                                {JSON.parse(localStorage.user)['role']}
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
                <Box 
                    sx={{
                        mt: 4, 
                        width: '100%',
                    }}
                >
                    <Typography 
                        variant="h3" 
                        gutterBottom 
                        component="div"
                    >
                        {this.state.farm.exist === true?
                            this.state.farm.name
                            :
                            "Start by creating your farm"
                        }
                    </Typography>
                </Box>
            </React.Fragment>   
            
        )
    }
}

export default HomeWidget;