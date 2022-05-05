import React, { Component} from "react";
import moment from "moment";

// Material UI Imports
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeliveryDiningOutlinedIcon from '@mui/icons-material/DeliveryDiningOutlined';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';

// Services import
import { 
    getFarmerSales,
    getStockMedia,
    despatchOrder 
} from '../../../../services';

class SalesWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
          tableData: [],
          mediaLib: [],
          isCompleted: false,
          selectedTab: "PENDING",
          modal: {open: false, data:{}},
          toaster: {open: false, success: true, message: ''}
        };
    }

    componentDidMount() {
        this.populateSales();        
    }

    componentDidUpdate() {
        console.log("Home Widget updated");
        console.log(this.state);
    }

    populateSales = async ()=> {
        const data = {
            isDelivered: this.state.isCompleted,
            userId: JSON.parse(localStorage.user)['_id']
        }
        try {
            getFarmerSales(data).subscribe({
                next: (response)=> {
                    if(
                        response.success === true &&
                        response.data &&
                        Array.isArray(response.data.data)
                    ) {
                        this.setState({
                            ...this.state, 
                            tableData: response.data.data
                        }, ()=> {
                            this.createAssetLibrary();
                        });
                    }
                },
                error: (error)=> {
                    console.log("[ERROR] Populating sales");
                    console.log(error);
                }
            }); 
        }catch(error) {
            console.log("[ERROR] Populating Sales API Call");
        }
    }

    createAssetLibrary = async ()=> {
        try {
            this.state.tableData.forEach((element)=> {
                element?.orders.forEach((order)=> {
                    order?.cart.forEach((item)=> {
                        if(item?.stock?.mediaPresent === true) {
                            getStockMedia(item?.stock?.mediaUrl).subscribe({
                                next: (response)=> {
                                    this.setState({
                                        ...this.state,
                                        mediaLib: [
                                            ...this.state.mediaLib,
                                            {
                                                stockId: item?.stock?._id,
                                                media: URL.createObjectURL(response)
                                            }
                                        ]
                                    })
                                },
                                error: (error)=> {
                                    console.log("[ERROR] Creating asset Library");
                                    console.log(error);
                                }
                            })
                        }
                    })
                })
            })
        }catch(error) {
            console.log("[ERROR] Populating Sales API Call");
        }
    }

    handleTabSelect = (event, newValue) => {
        this.setState({
            ...this.state,
            selectedTab: newValue,
            isCompleted: newValue === "PENDING"? false: true
        }, ()=> {
            this.populateSales();
        })
    };

    handleView= (data)=> {
        this.setState({
            ...this.state, 
            modal:{...this.state.modal, data: data}
        }, ()=> {
            this.handleModalOpen();
        })
    }

    handleModalOpen = ()=> {
        this.setState({...this.state, modal: {...this.state.modal, open: true}});
    }

    handleModalClose= ()=> {
        this.setState({...this.state, modal: {open: false, data: {}}});
    }

    handleDespatchOrder = (data)=> {
        if(data) {
            const despatchData ={
                transactionId: data?._id,
                orderId: data?.orders.length === 1? data.orders[0]._id: '' 
            };
            try {
                despatchOrder(despatchData).subscribe({
                    next:(response)=> {
                        if(
                            response &&
                            response.success === true &&
                            response.message
                        ) {
                            this.setState({
                                ...this.state,
                                toaster: {
                                    ...this.toaster,
                                    open: true, 
                                    success: true, 
                                    message: response?.message
                                }
                            }, ()=> {
                                this.populateSales();
                            });                            
                        }else {
                            this.setState({
                                ...this.state,
                                toaster: {
                                    ...this.toaster,
                                    open: true, 
                                    success: false, 
                                    message: response?.message
                                }
                            });
                        }
                    },
                    error: (error)=> {
                        console.log("ERROR: API error");
                        console.log(error);
                    }
                })
            }catch(error) {
                console.log("ERROR: Trying to despatch order");
                console.log(error);
            }
        }else {
            console.log("No transaction selected");
        }        
    }

    handleToasterClose = ()=> {
        this.setState({
            ...this.state,
            toaster: {
                ...this.toaster,
                open: false, 
                success: true, 
                message: ''
            }
        });
    }

    render() {
        return(
            <React.Fragment>
                {/* Toaster */}
                <Snackbar
                    anchorOrigin={{vertical: 'bottom',horizontal: 'right'}}
                    open={this.state.toaster.open}
                    onClose={this.handleToasterClose}
                    autoHideDuration={6000}
                >
                    <Alert 
                        onClose={this.handleToasterClose} 
                        severity={this.state.toaster.success === true? 'info':'error'} 
                        variant='filled'
                        sx={{ width: '100%' }}
                    >
                        {this.state.toaster.message}
                    </Alert>
                </Snackbar>

                {/* Modal */}
                <Dialog
                    open={this.state.modal.open}
                    TransitionComponent={Slide}
                    TransitionProps={{direction:'left'}}
                    keepMounted
                    fullWidth
                    scroll="paper"
                    onClose={this.handleModalClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        {this.state.modal.data?.user?.name}
                        <Stack spacing={0} sx={{width: 'auto', mt: 1}}>
                            <Typography variant='caption'>
                                {this.state.modal.data?.address?.addressLine1}
                            </Typography>
                            <Typography variant='caption'>
                                {this.state.modal.data?.address?.addressLine2}
                            </Typography>
                            <Typography variant='caption'>
                                {this.state.modal.data?.address?.city},
                                {this.state.modal.data?.address?.state},
                                {this.state.modal.data?.address?.pincode},
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <Divider/>
                    <DialogContent>
                        <TableContainer component={Paper}>
                            <Table 
                                sx={{ width: 'inherit', my: 2 }} 
                                size="small" 
                                aria-label="a dense table"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="left">Particulars</TableCell>
                                        <TableCell align="left">Type</TableCell>
                                        <TableCell align="left">Price</TableCell>
                                        <TableCell align="left">Qty</TableCell>
                                        <TableCell align="left">Net</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.modal.open === true?
                                        this.state.modal.data?.orders.map((element)=> {
                                            return element.cart.map((item)=> {
                                                return(
                                                    <TableRow
                                                        key={item._id}
                                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                    >
                                                        <TableCell align='left'>
                                                            <Stack direction="row" spacing={1}>
                                                                <Avatar 
                                                                    alt="Remy Sharp" 
                                                                    variant="circular"
                                                                    src={item?.stock?.mediaPresent === true?
                                                                        this.state.mediaLib.find((med)=> {
                                                                            return med?.stockId === item?.stock?._id
                                                                        })['media']
                                                                        :
                                                                        ''
                                                                    } 
                                                                    sx={{ height: '30px', width: '30px' }}
                                                                />
                                                                <Typography sx={{display: 'flex', alignItems: 'center'}}>
                                                                    {item.stock.surplusId.name}
                                                                </Typography>
                                                            </Stack>                                                            
                                                        </TableCell>
                                                        <TableCell align='left'>
                                                            {item.stock.surplusId.type}
                                                        </TableCell>
                                                        <TableCell align='left'>
                                                            {item.quantity}
                                                        </TableCell>
                                                        <TableCell align='left'>
                                                            {item.stock.unitPrice}
                                                        </TableCell>
                                                        <TableCell align='left'>
                                                            {item.itemCost}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        })
                                        : 
                                        <TableRow 
                                            key={"NODATAMODALTABLEROW"} 
                                            sx={{ border: '1px solid #ebebeb'}}
                                        >
                                            <TableCell align="center" colSpan={5}>
                                                <Alert variant="outlined" severity="error">
                                                    Nothing to Display 
                                                </Alert>
                                            </TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions>
                        <Chip 
                            icon={<CurrencyRupeeIcon />} 
                            variant="outlined" 
                            color='secondary'
                            label={this.state.modal.open === false?
                                0
                                :
                                this.state.modal.data.orders.reduce((prev, curr)=> {
                                    return prev + curr.cart.reduce((p,c)=> {
                                        return p + c.itemCost
                                    }, 0)
                                },0)
                            }
                            sx={{mr: 2}}
                        />
                    </DialogActions>
                </Dialog>

                <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={this.state.selectedTab} 
                        onChange={this.handleTabSelect} 
                        aria-label="basic tabs example"
                    >
                        <Tab label="Pending" value="PENDING"/>
                        <Tab label="Completed" value="COMPLETED"/>
                    </Tabs>
                </Box>

                <Box sx={{ width: '100%', mt: 2, p: 1}}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left">Customer</TableCell>
                                    <TableCell align="left">Created</TableCell>
                                    <TableCell align="left">Orders</TableCell>
                                    <TableCell align="left">Status</TableCell>
                                    <TableCell align="left">View</TableCell>
                                    <TableCell align="left">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.tableData.length === 0?
                                    <TableRow align="center" >
                                        <TableCell align="center" colSpan={6}>
                                            <Alert 
                                                variant="outlined" 
                                                severity="warning"
                                                sx={{width: 'auto', py: 2}}
                                            >
                                                You have no {this.state.selectedTab.toLowerCase()} orders
                                            </Alert>
                                        </TableCell>
                                    </TableRow>                                   
                                    :
                                    this.state.tableData.map((element)=> {
                                        
                                        return(
                                            <TableRow 
                                                align="left" 
                                                key={element?._id}
                                                sx={{ my: 2, '&:last-child td, &:last-child th': { border: 0 } }}
                                            >
                                                <TableCell align="left">
                                                    {element?.user?.name}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {moment(element?.createdAt).format("ll")}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {element?.orders.reduce((prev, curr)=> {
                                                        return prev + curr?.cart.length
                                                    },0 )}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {element?.orders[0]?.delivered === true? "Completed": "Pending"}
                                                </TableCell>
                                                <TableCell align="left">
                                                    <Tooltip 
                                                        title="View Order" 
                                                        placement="bottom-end"
                                                    >
                                                        <IconButton 
                                                            color="secondary" 
                                                            aria-label="add an alarm"
                                                            onClick={()=>this.handleView(element)}
                                                        >
                                                            <VisibilityOutlinedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <Tooltip 
                                                        title="Despatch Order" 
                                                        placement="bottom-end"
                                                    >
                                                        <IconButton 
                                                            color="secondary" 
                                                            aria-label="add an alarm"
                                                            disabled={this.state.selectedTab === "PENDING"? 
                                                                element.orders.reduce((prev, curr)=> {
                                                                    if(curr.delivered === true) {
                                                                        return prev + 1
                                                                    }else {
                                                                        return prev + 0
                                                                    }
                                                                }, 0) === element.orders.length? true: false
                                                                : 
                                                                true
                                                            }
                                                            onClick={()=>this.handleDespatchOrder(element)}
                                                        >
                                                            <DeliveryDiningOutlinedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </React.Fragment>   
            
        )
    }
}

export default SalesWidget;