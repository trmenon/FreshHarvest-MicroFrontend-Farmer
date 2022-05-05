import React, { Component} from "react";
import moment from "moment";

// services import 
import {
    getUsersByPattern,
    sendMessage,
    getMessages,
    getMessageById
} from '../../../../services';

// material UI imports
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { lightBlue } from '@mui/material/colors';
import MarkAsUnreadOutlinedIcon from '@mui/icons-material/MarkAsUnreadOutlined';
import Avatar from '@mui/material/Avatar';
import DateRangeOutlinedIcon from '@mui/icons-material/DateRangeOutlined';

class ChatWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedTab: "INBOX",
            compose: {
                open: false,
                data: {subject: '', message: '', recepient: '', notify: false},
                recepientList: [] 
            },
            toaster: {open: false, isError: false, message: ''},
            messages: {count: 0, data: []},
            selectedMessage: {isSelected: false, data: {}}
        };
    }

    componentDidMount() {
        this.populateMessages();
    }

    componentDidUpdate() {
        // console.log("message Widget updated");
        // console.log(this.state);
    }

    populateMessages = ()=> {
        const data = {
            user: JSON.parse(localStorage.user)['_id'],
            isReceived: this.state.selectedTab === "INBOX"? true: false
        };

        try {
            getMessages(data).subscribe({
                next: (response)=> {
                    if(response.success === true) {
                        this.setState({
                            ...this.state,
                            messages: {
                                count: response?.data?.count, 
                                data: response?.data?.data
                            },
                            toaster: {open: true, isError: false, message: response?.message}
                        });
                    }else {
                        this.setState({
                            ...this.state,
                            toaster: {open: true, isError: true, message: response?.message}
                        });
                    }
                },
                error: (error)=> {
                    console.log("[ERROR] Populating messages");
                    console.log(error);
                    this.setState({
                        ...this.state,
                        toaster: {open: true, isError: true, message: "Unexpected error occured"}
                    });
                },
            })
        }catch(err) {
            console.log("[ERROR] Populating messages");
            console.log(err);
            this.setState({
                ...this.state,
                toaster: {open: true, isError: true, message: "Unexpected error occured"}
            });
        }
    }

    handleActivateComposer= ()=> {
        this.setState({
            ...this.state, 
            compose: {
                ...this.state.compose,
                open: true,
                data: {subject: '', message: '', recepient: '', notify: false},
                recepientList: [] 
            }
        });
    }

    handleTabChange = (event, newValue)=> {
        this.setState({
            ...this.state, 
            selectedTab: newValue
        }, ()=> {
            this.populateMessages();
        });
    }

    handleCloseComposeModal= ()=> {
        this.setState({
            ...this.state, 
            compose: {
                ...this.state.compose,
                open: false,
                data: {subject: '', message: '', recepient: '', notify: false},
                recepientList: [] 
            }
        });
    }

    handleToggleNotify= ()=> {
        this.setState({
            ...this.state,
            compose: {
                ...this.state.compose,
                data: {
                    ...this.state.compose.data,
                    notify: this.state.compose.data.notify === true? false: true
                }
            }
        });
    }

    handleRecepientSearchTrigger=(event)=> {
        if(event.target.value.length === 0) {
            this.setState({
                ...this.state,
                compose: {
                    ...this.state.compose,
                    recepientList: []
                }
            })
        }else {
            try {
                getUsersByPattern(event.target.value).subscribe({
                    next: (response)=> {
                        if(
                            response &&
                            response.success === true &&
                            response.data &&
                            response.data.data &&
                            Array.isArray(response.data.data)
                        ) {
                            this.setState({
                                ...this.state,
                                compose: {
                                    ...this.state.compose,
                                    recepientList: response.data.data.filter((item)=> {
                                        return item?.value !== JSON.parse(localStorage.user)['_id']
                                    })
                                }
                            })
                        }
                    },
                    error: (error)=> {
                        console.log("[ERROR] trying to populate recepient list");
                        console.log(error);
                    },
                })
            }catch(err) {
                console.log("[ERROR] trying to populate recepient list");
                console.log(err);
            }            
        }
    }

    handleLogMessage = (event)=> {
        this.setState({
            ...this.state,
            compose: {
                ...this.state.compose,
                data: {
                    ...this.state.compose.data,
                    message: event.target.value
                }
            }
        })
    }

    handleSendMessage = ()=> {
        if(
            this.state.compose.data.message.length !== 0 &&
            this.state.compose.data.subject.length !== 0 &&
            this.state.compose.data.recepient.length !== 0
        ) {
            const data = {
                fromUser: JSON.parse(localStorage.user)['_id'],
                toUser: this.state.compose.data.recepient,
                notifyAdmin: this.state.compose.data.notify,
                subject: this.state.compose.data.subject,
                message: this.state.compose.data.message
            };

            try {
                sendMessage(data).subscribe({
                    next: (response)=> {
                        if(response.success === true) {
                            this.setState({
                                ...this.state, 
                                compose: {
                                    open: false,
                                    data: {subject: '', message: '', recepient: '', notify: false},
                                    recepientList: [] 
                                },
                                toaster: {open: true, isError: false, message: response.message}
                            })
                        }else {
                            this.setState({
                                ...this.state, 
                                compose: {
                                    open: false,
                                    data: {subject: '', message: '', recepient: '', notify: false},
                                    recepientList: [] 
                                },
                                toaster: {open: true, isError: true, message: response.message}
                            })
                        }
                    },
                    error: (error)=> {
                        console.log("[ERROR: API Object] Trying to send message");
                        console.log(error);
                        this.setState({
                            ...this.state, 
                            compose: {
                                open: false,
                                data: {subject: '', message: '', recepient: '', notify: false},
                                recepientList: [] 
                            },
                            toaster: {open: true, isError: true, message: "Unexpected error occured"}
                        })
                    },
                })
            }catch(err) {
                console.log("[ERROR] Trying to send message");
                console.log(err);
                this.setState({
                    ...this.state, 
                    compose: {
                        open: false,
                        data: {subject: '', message: '', recepient: '', notify: false},
                        recepientList: [] 
                    },
                    toaster: {open: true, isError: true, message: "Unexpected error occured"}
                })
            }
        }
    }

    handleSelectMessage = (data)=> {
        const requestData = {
            messageId: data?._id,
            isRecepient: data?.toUser?._id === JSON.parse(localStorage.user)['_id']? true: false
        };
        try {
            getMessageById(requestData).subscribe({
                next: (response)=> {
                    if(response?.success === true) {
                        this.setState({
                            ...this.state,
                            selectedMessage: {isSelected: true, data: data}
                        });
                    }else {
                        this.setState({
                            ...this.state,
                            toaster: {open: true, isError: true, message: response.message}
                        });                        
                    }
                },
                error: (error)=> {
                    console.log(error);
                    this.setState({
                        ...this.state,
                        toaster: {open: true, isError: true, message: "Unexpected error occured"}
                    });    
                },
            });
        }catch(err) {
            console.log("[ERROR] Getting message by id");
            console.log(err);     
            this.setState({
                ...this.state,
                toaster: {open: true, isError: true, message: "Unexpected error occured"}
            });         
        }        
    }

    handleCloseMessageModal = ()=> {
        this.setState({
            ...this.state,
            selectedMessage: {isSelected: false, data: {}}
        }, ()=> {
            this.populateMessages();
        });
    }

    handleToasterClose= ()=> {
        this.setState({
            ...this.state,
            toaster: {open: false, isError: false, message: ''}
        });
    }

    

    render() {
        return(
            <React.Fragment>
                {/* SNACKBAR TOASTER */}
                <Snackbar
                    anchorOrigin={{vertical: 'bottom',horizontal: 'right'}}
                    open={this.state.toaster.open}
                    onClose={this.handleToasterClose}
                    autoHideDuration={6000}
                >
                    <Alert 
                        onClose={this.handleToasterClose} 
                        severity={this.state.toaster.isError === false? 'success':'error'} 
                        variant='filled'
                        sx={{ width: '100%' }}
                    >
                        {this.state.toaster.message}
                    </Alert>
                </Snackbar>

                {/* NEW MESSAGE MODAL */}
                <Dialog
                    open={this.state.compose.open}
                    TransitionComponent={Slide}
                    TransitionProps={{direction:'left'}}
                    keepMounted
                    fullWidth
                    scroll="paper"
                    onClose={this.handleCloseComposeModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        <Stack spacing={2}>
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                                <Typography variant='caption'>
                                    Notify Admin
                                </Typography>
                                <Checkbox
                                    checked={this.state.compose.data?.notify}
                                    onChange={this.handleToggleNotify}                                    
                                    inputProps={{ 'aria-label': 'controlled' }}
                                    disabled={this.state.compose.recepientList.length === 0?
                                        false:
                                        this.state.compose.data.recepient === this.state.compose.recepientList.find((element)=> {
                                            return element?.label === "Admin"
                                        })?.value? true: false
                                    }
                                />
                            </Box>
                            <Autocomplete
                                disablePortal
                                id="recepient-select"
                                options={this.state.compose.recepientList}
                                sx={{ width: 'auto' }}
                                renderInput={
                                    (params) => 
                                        <TextField 
                                            {...params} 
                                            onChange={this.handleRecepientSearchTrigger}
                                            label="Recpient" 
                                        />
                                }
                                onChange={(event, newValue) => {
                                    this.setState({
                                        ...this.state,
                                        compose: {
                                            ...this.state.compose,
                                            data: {
                                                ...this.state.compose.data,
                                                recepient: newValue?.value,
                                                notify: newValue?.label === "Admin"? false: this.state.compose.data.notify
                                            }
                                        }
                                    })
                                }}
                            />
                            <TextField
                                margin="dense"
                                id="subject"
                                label="Subject"
                                type="text"
                                fullWidth
                                variant="standard"
                                value={this.state.compose.data.subject}
                                onChange={
                                    (event)=> 
                                        this.setState({
                                            ...this.state, 
                                            compose: {
                                                ...this.state.compose,
                                                data: {
                                                    ...this.state.compose.data,
                                                    subject: event.target.value
                                                }
                                            }
                                    })
                                }
                            />
                        </Stack>
                    </DialogTitle>
                    <Divider/>
                    <DialogContent>
                        <TextField
                            id="message-body"
                            label="Your message"
                            multiline
                            fullWidth
                            rows={7}
                            value={this.state.compose.data.message}
                            onChange={this.handleLogMessage}
                            sx={{my: 2,}}
                        />
                    </DialogContent>
                    <DialogActions>
                        {this.state.compose.data.message.length === 0?
                            ""
                            :
                            this.state.compose.data.subject.length === 0?
                            ""
                            :
                            this.state.compose.data.recepient.length === 0?
                            ""
                            :
                            <Button 
                                variant="outlined" 
                                startIcon={<SendOutlinedIcon />}
                                onClick={this.handleSendMessage}                            
                            >
                                Send Message
                            </Button>
                        }                        
                    </DialogActions>
                </Dialog>

                {/* Message View Modal */}
                <Dialog
                    open={this.state.selectedMessage.isSelected}
                    TransitionComponent={Slide}
                    TransitionProps={{direction:'right'}}
                    keepMounted
                    fullWidth
                    scroll="paper"
                    onClose={this.handleCloseMessageModal}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {this.state.selectedMessage?.isSelected === true?
                            <Stack spacing={2}>
                                <Box sx={{display: 'flex'}}>
                                    <Typography variant="caption">
                                        From
                                    </Typography>
                                    <Typography variant="h6" sx={{mx: 2}}>
                                        {
                                            `${this.state.selectedMessage?.data?.fromUser?.name} 
                                            <${this.state.selectedMessage?.data?.fromUser?.email}>`
                                        }
                                    </Typography>
                                </Box>
                                <Box sx={{display: 'flex'}}>
                                    <Typography variant="caption">
                                        To
                                    </Typography>
                                    <Typography variant="h6" sx={{mx: 2}}>
                                        {
                                            `${this.state.selectedMessage?.data?.toUser?.name} 
                                            <${this.state.selectedMessage?.data?.toUser?.email}>`
                                        }
                                    </Typography>
                                </Box>
                                <Box sx={{display: 'flex'}}>
                                    <Chip 
                                        icon={<InfoOutlinedIcon />} 
                                        label={this.state.selectedMessage?.data?.subject} 
                                        variant="outlined"
                                        color= "info" 
                                        sx={{mx: 1}}
                                    />
                                    <Chip 
                                        icon={<DateRangeOutlinedIcon />} 
                                        label={moment(this.state.selectedMessage?.data?.createdAt).format('ll')} 
                                        variant="outlined"
                                        color= "info" 
                                        sx={{mx: 1}}
                                    />
                                </Box>
                            </Stack>
                            :
                            <Typography variant="caption">
                                Nothing to display
                            </Typography>
                        }                        
                    </DialogTitle>
                    <Divider/>
                    <DialogContent>
                        {this.state.selectedMessage?.isSelected === true?
                            <Paper elevation={8} sx={{my: 2, py: 4, width: '100%'}}>
                                <Typography variant="subtitle2" sx={{m: 2}}>
                                    {this.state.selectedMessage?.data?.message}
                                </Typography>
                            </Paper>
                            :
                            <Typography variant="caption">
                                Nothing to display
                            </Typography>
                        }
                        
                    </DialogContent>
                </Dialog>

                <Box sx={{my: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                    <Button 
                        variant="outlined" 
                        startIcon={<DriveFileRenameOutlineIcon />}
                        onClick={this.handleActivateComposer}
                    >
                        Compose Mail
                    </Button>
                </Box>
                <Box>
                    <TabContext value={this.state.selectedTab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={this.handleTabChange}>
                                <Tab label="Inbox" value="INBOX" />
                                <Tab label="Outbox" value="OUTBOX" />
                            </TabList>
                        </Box>
                    </TabContext>                    
                </Box>

                <Paper elevation={6} sx={{mt: 1}}>
                    <List
                        subheader={
                            <ListSubheader component="div" id="nested-list-subheader">
                                {this.state.messages.count} Messages
                            </ListSubheader>
                        } 
                        sx={{ width: '100%'}}
                    >
                        {this.state.messages.count === 0?
                            <ListItem>
                                <Alert
                                    severity='error' 
                                    variant='outlined'
                                    sx={{ width: '100%' }}
                                >
                                    You have {this.state.messages.count} messages
                                </Alert>
                            </ListItem>
                            :
                            this.state.messages.data.map((element)=> {
                                return (
                                    <ListItem 
                                        key={element._id} 
                                        divider={true}
                                        button={true}
                                        secondaryAction={
                                            <Box 
                                                sx={{display: {xs: 'none', md:'flex'}}}
                                            >
                                                <Chip 
                                                    icon={<InfoOutlinedIcon />} 
                                                    label={element?.subject} 
                                                    variant="outlined"
                                                    color= "primary" 
                                                    sx={{mx: 1}}
                                                />
                                                <Chip 
                                                    icon={<MarkAsUnreadOutlinedIcon />} 
                                                    label={element?.isRead === false?
                                                        "Not read"
                                                        :
                                                        moment(element?.updatedAt).format('ll')
                                                    } 
                                                    variant="outlined"
                                                    color= {element?.isRead === false? "warning":"primary"} 
                                                    sx={{mx: 1}}
                                                />
                                            </Box>
                                        }
                                        onClick={()=>{this.handleSelectMessage(element)}}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: lightBlue[500] }}>
                                                {this.state.selectedTab === "INBOX"?
                                                    element?.fromUser?.name[0]
                                                    :
                                                    element?.toUser?.name[0]
                                                }
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={this.state.selectedTab === "INBOX"?
                                                element?.fromUser?.name
                                                :
                                                element?.toUser?.name
                                            } 
                                            secondary={moment(element?.createdAt).format('ll')}
                                        />
                                    </ListItem>
                                )
                            })
                        }
                    </List>
                </Paper>
            </React.Fragment>   
            
        )
    }
}

export default ChatWidget;