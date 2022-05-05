import React, { Component} from "react";
import config from '../../../../constants/config.json';
import moment from "moment";
import { Thumbnail } from '../../../common';
import farm from '../../../../assets/farm-illustration.jpg';

// Material UI imports
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogContentText from '@mui/material/DialogContentText';
import Alert from '@mui/material/Alert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import SignalWifiStatusbarNullIcon from '@mui/icons-material/SignalWifiStatusbarNull';
import SignalWifiStatusbar4BarIcon from '@mui/icons-material/SignalWifiStatusbar4Bar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import MediationOutlinedIcon from '@mui/icons-material/MediationOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import Avatar from '@mui/material/Avatar';
import CameraIcon from '@mui/icons-material/Camera';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

// Services import
import { 
    createFarm, 
    getFarmOfOwner, 
    getSurplusDetails, 
    createNewStock,
    getStockDetails,
    updateStock,
    uploadFile,
    getStockMedia 
} from '../../../../services';

class FarmWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
          farm: {exist: false, id: "", name: ""},
          newFarmName: "",
          error: {
              create: {status: false, message: ""},
              update: {status: false, message: ""}
          },
          modal: { open: false, type: "", error: false, errorMessage: ""},
          createFormSnap: {surplusType: "", surplusName: "", stockNumber: 0, unitPrice: 0},
          surplusNameList: [],
          toggleFilter: 0,
          filterObject: {filterStatus: false, filterStockEmpty: false},
          stockList: {count: 0, data: []},
          selectedStock: {stockId: "", stock: 0, unitPrice: 0},
          upload: {status: false, resource: {}},
          assetMedia: {status: false, assetName: ""},
          assetList: [],
        };
    }

    componentDidMount() {
        this.getFarm();        
    }

    componentDidUpdate() {        
        console.log(this.state);
    }

    updateStockList = ()=> {
        const data = {
            ...this.state.filterObject, 
            farmId: this.state.farm.exist === true? this.state.farm.id: ""
        };
        try {
            getStockDetails(data).subscribe({

            next: (response) => {
                if(
                    response.success === true && 
                    response.data.data &&
                    Array.isArray(response.data.data)
                ) {
                    this.setState({...this.state, stockList:{count: response.data.count, data: response.data.data}}, ()=> {
                        this.state.stockList.data.forEach((element)=> {
                            if(element.mediaPresent === true) {
                                getStockMedia(element?.mediaUrl).subscribe({
                                    next: (resp)=> {
                                        let currentStockList = this.state.stockList.data;
                                        let listItemIndex = currentStockList.findIndex((item)=> item._id === element._id);
                                        currentStockList[listItemIndex] = {...currentStockList[listItemIndex], mediaUrl: URL.createObjectURL(resp)};
                                        this.setState({
                                            ...this.state,
                                            stockList:{
                                                ...this.state.stockList,
                                                data: currentStockList
                                            }
                                        })
                                    },
                                    error: (err)=> {
                                        console.log(err)
                                    }
                                })
                            }
                        })
                    })
                }              
            },
            error: (error) => {
              console.log(error)
            },
          });
        } catch (error) {
          console.error(error.message);
        }
    }

    getFarm = ()=> {
        try {
            getFarmOfOwner(JSON.parse(localStorage.user)['_id']).subscribe({
            next: (response) => {
                console.log(response);
              if ( response?.success === true) {                                  
                this.setState({
                    ...this.state, 
                    farm: {exist: true, id: response.data._id, name: response.data.name}
                }, ()=> {
                    this.updateStockList();
                });                
              }
            },
            error: (error) => {
              console.log(error)
            },
          });
        } catch (error) {
          console.error(error.message);
        }
    }

    handleCreateNewFarm = ()=> {
        if(this.state.newFarmName.length === 0) {
            this.setState({...this.state, error: {...this.state.error, create: {status: true, message: "Enter valid name"}}});
        }else {
            this.setState({...this.state, error: {...this.state.error, create: {status: false, message: ""}}});
            const data = {
                farmName: this.state.newFarmName.trim(), 
                ownerId: JSON.parse(localStorage.user)['_id']
            };
            console.log(data);

            try {
                createFarm(data).subscribe({
                next: (response) => {
                  if (                
                    response?.success === true &&
                    response?.status === false
                  ) {                                  
                    this.setState({...this.state, error: {...this.state.error, create: {status: true, message: response?.message}}});
                  }
                  if (                
                    response?.success === true &&
                    response?.status === true 
                  ) {                                  
                    this.setState({
                        ...this.state, 
                        error: {
                            ...this.state.error, 
                            create: {
                                status: false, message: ""
                            }
                        },
                        farm: {exist: true, id: response.data._id},
                        newFarmName: ""
                    });
                    this.getFarm();
                  }
                },
                error: (error) => {
                  console.log(error)
                },
              });
            } catch (error) {
              console.error(error.message);
            }
        }
    }

    handleViewFarm = ()=> {
        this.setState({...this.state, modal: {type: "VIEW", open: true, error: false, errorMessage: ""}})
    }

    handleCreateStock = ()=> {
        this.setState({...this.state, modal: {type: "CREATE", open: true, error: false, errorMessage: ""}})
    }

    handleModalClose = ()=> {
        this.setState({...this.state, modal: {type: "", open: false, error: false, errorMessage: ""}})
    }

    handleCreateStockTypeSelection = (event)=> {
        let data = {filterStatus: false};
        if (event.target.value !== "all") {
            data["filterByType"] = event.target.value;
            data['filterStatus'] = true;
        }
        try {
            getSurplusDetails(data).subscribe({
            next: (response) => {
                console.log(response);
              if ( response?.success === true) {  
                  console.log("Setting state");                                
                this.setState({
                    ...this.state, 
                    createFormSnap: {...this.state.createFormSnap, surplusType: event.target.value},
                    surplusNameList: response.data.data
                });                
              }
            },
            error: (error) => {
              console.log(error)
            },
          });
        } catch (error) {
          console.error(error.message);
        }
    }

    handleAddStock = ()=> {
        const newStockData = {
            surplusId: this.state.createFormSnap.surplusName,
            farmId: this.state.farm.id,
            stock: this.state.createFormSnap.stockNumber,
            unitPrice: this.state.createFormSnap.unitPrice,
            mediaPresent: false,
            mediaUrl: "NOIMAGE"
        };
        try {
            createNewStock(newStockData).subscribe({
            next: (response) => {
                if(response.success === true) {
                    if(this.state.upload.status === true) {
                        const createdStockId = response?.data._id;
                        const formData = new FormData();
                        formData.append("file", this.state.upload.resource);
                        console.log(formData);
                        uploadFile(formData).subscribe({
                            next: (response) => {
                              if(response.success === true) {
                                const fileUpdateData = {mediaPresent: true, mediaUrl: response.fileName};
                                // Calling PUT request to update filename
                                updateStock(fileUpdateData, createdStockId).subscribe({
                                    next: (response) => {
                                        this.updateStockList();
                                    },
                                    error: (error) => {
                                        console.log(error);
                                        this.setState({
                                            ...this.state,
                                            createFormSnap: {surplusType: "", surplusName: "", stockNumber: 0, unitPrice: 0},
                                            surplusNameList: [],
                                            modal: { open: true, type: "CREATE", error: true, errorMessage: "Image not updated"},
                                        })
                                    },
                                  });
                              }
                            },
                            error: (error) => {
                                this.setState({
                                    ...this.state,
                                    createFormSnap: {surplusType: "", surplusName: "", stockNumber: 0, unitPrice: 0},
                                    surplusNameList: [],
                                    modal: { open: true, type: "CREATE", error: true, errorMessage: "Image not uploaded"},
                                })
                            },
                          });
                    }
                    

                    this.setState({
                        ...this.state,
                        createFormSnap: {surplusType: "", surplusName: "", stockNumber: 0, unitPrice: 0},
                        surplusNameList: [],
                        modal: { open: false, type: "", error: false, errorMessage: ""},
                    }, ()=> {
                        this.updateStockList();
                    })
                    
                }
                if(response.success === false) {
                    this.setState({
                        ...this.state,
                        createFormSnap: {surplusType: "", surplusName: "", stockNumber: 0, unitPrice: 0},
                        surplusNameList: [],
                        modal: { open: true, type: "CREATE", error: true, errorMessage: response.message},
                    })
                }
              
            },
            error: (error) => {
              console.log(error)
            },
          });
        } catch (error) {
          console.error(error.message);
        }
    }

    handleUpdateStock = ()=> {
        const data = {
            stock: this.state.selectedStock.stock,
            unitPrice: this.state.selectedStock.unitPrice
        };
        const id = this.state.selectedStock.stockId;

        try {
            updateStock(data, id).subscribe({
            next: (response) => {
                console.log(response);
                if(response.success === true) {
                    this.setState({
                        ...this.state,
                        selectedStock: {stockId: "", stock: 0, unitPrice: 0},
                        modal: { open: false, type: "", error: false, errorMessage: ""},
                    }, ()=> {
                        this.updateStockList();
                    })
                }         
                if(response.success === false) {
                    this.setState({
                        ...this.state,
                        error: {
                            ...this.state.error,
                            update: {status: true, message: response.message}
                        }
                    })
                }         
            },
            error: (error) => {
              console.log(error)
            },
          });
        } catch (error) {
          console.error(error.message);
        }
    }

    handleSetFilter = (event, value)=> {
        console.log(value);
        let filterObject = {filterStatus: false, filterStockEmpty: false};
        if(value === 0) {
            filterObject["filterStatus"] = false;
            filterObject["filterStockEmpty"] = false;
        }
        if(value === 1) {
            filterObject["filterStatus"] = true;
            filterObject["filterStockEmpty"] = false;
        }
        if(value === 2) {
            filterObject["filterStatus"] = true;
            filterObject["filterStockEmpty"] = true;
        }
        this.setState({...this.state, toggleFilter: value, filterObject: filterObject}, ()=> {
            this.updateStockList();
        })        
    }

    triggerStockUpdate = ()=> {
        this.setState({...this.state, modal: {type: "EDIT", open: true, error: false, errorMessage: ""}})
    }

    render() {
        return(
            <React.Fragment>
                {this.state.farm.exist === false?
                    <React.Fragment>
                        <Dialog 
                            open={this.state.farm.exist === false}                            
                        >
                            <DialogTitle>
                                <Typography gutterBottom>
                                    My Farm
                                </Typography>
                            </DialogTitle>
                            <DialogContent>
                                {this.state.error.create.status === true?
                                    <Alert severity="error">{this.state.error.create.message}</Alert>
                                    :""
                                }
                                <DialogContentText>
                                    By creating your farm all the users will be able to connect with you and your products through your unique farm name and you will be able to manage your products under your unique name. So lets get started...
                                </DialogContentText>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="farmName"
                                    label="Farm Name"
                                    type="text"
                                    fullWidth
                                    variant="standard"
                                    onChange={(event)=> this.setState({...this.state, newFarmName: event.target.value})}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={this.handleCreateNewFarm}>Create My Farm</Button>
                            </DialogActions>
                        </Dialog>
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <Dialog 
                            open={this.state.modal.open}  
                            onClose = {this.handleModalClose}
                            fullWidth                          
                        >
                            <DialogTitle gutterBottom>
                                    {this.state.modal.type === "CREATE"?
                                        <Typography 
                                            display="block" 
                                            sx={{ color: 'primary.main' }}
                                            gutterBottom
                                        >
                                            Add a new stock
                                        </Typography>
                                        :
                                        this.state.modal.type === "EDIT"?
                                        "UPDATE "+this.state.stockList.data.find((element)=> {
                                            return element._id === this.state.selectedStock.stockId
                                        })["surplusId"].name
                                        : 
                                        "My Stock"
                                    }   
                                
                            </DialogTitle>
                            <Divider variant="middle"/>
                            <DialogContent>
                                {this.state.modal.error === true?
                                    <Alert severity="error">{this.state.modal.errorMessage}</Alert>:""
                                }
                                {this.state.modal.type === "CREATE"?
                                    <React.Fragment>
                                        <InputLabel 
                                            id="surplus-type-label" 
                                            sx={{width: '100%', mt: 2}}
                                            variant="standard"
                                        >
                                            Surplus Type
                                        </InputLabel>
                                        <Select
                                            labelId="surplus-type-label"
                                            id="surplus-type"
                                            sx={{width: '100%', mb: 2}}
                                            label="Surplus Type"
                                            color="secondary"
                                            variant="standard"
                                            value={this.state.createFormSnap.surplusType}
                                            onChange={this.handleCreateStockTypeSelection}
                                        >
                                            {config.serviceDictionary.surplus.types.map((element)=> {
                                                return (
                                                    <MenuItem
                                                        key={element.value} 
                                                        value={element.reference}
                                                    >
                                                        {element.label}
                                                    </MenuItem>
                                                )
                                            })}
                                        </Select>
                                        <InputLabel 
                                            id="stock-name-label" 
                                            sx={{width: '100%', mt: 2}}
                                            variant="standard"
                                        >
                                            Stock Name
                                        </InputLabel>
                                        <Select
                                            labelId="stock-name-label"
                                            id="stock-name"
                                            sx={{width: '100%', mb: 2}}
                                            variant="standard"
                                            color="secondary"
                                            label="Stock Name"
                                            value={this.state.createFormSnap.surplusName}
                                            onChange={(event)=> {
                                                this.setState({
                                                    ...this.state,
                                                    createFormSnap: {
                                                        ...this.state.createFormSnap,
                                                        surplusName: event.target.value
                                                    }
                                                });
                                            }}
                                        >
                                            {this.state.surplusNameList.length === 0?
                                                <MenuItem value="000">
                                                    Please select a type first
                                                </MenuItem>
                                                :
                                                this.state.surplusNameList.map((element)=> {
                                                    return (
                                                        <MenuItem 
                                                            key={element["_id"]} 
                                                            value={element["_id"]}
                                                        >
                                                            {element["name"]}
                                                        </MenuItem>
                                                    );
                                                })                                                
                                            }
                                        </Select>
                                        <InputLabel 
                                            id="stock-number" 
                                            sx={{width: '100%', mt: 2}}
                                            variant="standard"
                                        >
                                            Number of stock
                                        </InputLabel>
                                        <Input 
                                            id="stock-number"
                                            color="secondary"
                                            variant="standard"
                                            type="number"
                                            value={this.state.createFormSnap.stockNumber}
                                            endAdornment={<InputAdornment position="end">kg</InputAdornment>}
                                            sx={{width: '100%', mb: 2}}
                                            onChange={(event)=> {
                                                this.setState({
                                                    ...this.state, 
                                                    createFormSnap: {
                                                        ...this.state.createFormSnap,
                                                        stockNumber: event.target.value
                                                    }
                                                })
                                            }}
                                        />
                                        <InputLabel 
                                            id="unit-price" 
                                            sx={{width: '100%', mt: 2}}
                                            variant="standard"
                                        >
                                            Unit price
                                        </InputLabel>
                                        <Input 
                                            id="unit-price"
                                            color="secondary"
                                            type="number"
                                            variant="standard"
                                            endAdornment={<InputAdornment position="end">Rs</InputAdornment>}
                                            sx={{width: '100%', mb: 2}}
                                            value={this.state.createFormSnap.unitPrice}
                                            onChange={(event)=> {
                                                this.setState({
                                                    ...this.state, 
                                                    createFormSnap: {
                                                        ...this.state.createFormSnap,
                                                        unitPrice: event.target.value
                                                    }
                                                })
                                            }}
                                        />
                                        <label htmlFor="icon-button-file">
                                            <Input 
                                                accept="image/*" 
                                                id="icon-button-file" 
                                                type="file"
                                                disableUnderline
                                                fullWidth
                                                inputComponent={TextField}
                                                inputProps={{
                                                    variant: "filled",
                                                    color: "secondary",
                                                    fullWidth: true,
                                                }}
                                                onChange={(event)=> {
                                                    console.log(event.target.files);
                                                    this.setState({
                                                        ...this.state,
                                                        upload: {
                                                            status: true,
                                                            resource: event.target.files[0],
                                                        }
                                                    })
                                                }}
                                            />
                                            {/* <IconButton color="primary" aria-label="upload picture" component="span">
                                            <PhotoCamera />
                                            </IconButton> */}
                                        </label>
                                    </React.Fragment>
                                    :
                                    this.state.modal.type === "EDIT"?
                                    <React.Fragment>
                                        {this.state.error.update.status === true?
                                            <Alert severity="error">{this.state.error.update.message}</Alert>:""
                                        }
                                        <InputLabel 
                                            id="stock-number" 
                                            sx={{width: '100%', mt: 2}}
                                            variant="standard"
                                        >
                                            Number of stock
                                        </InputLabel>
                                        <Input 
                                            id="stock-number"
                                            color="secondary"
                                            variant="standard"
                                            type="number"
                                            endAdornment={<InputAdornment position="end">kg</InputAdornment>}
                                            defaultValue={this.state.selectedStock.stock}
                                            sx={{width: '100%', mb: 2}}
                                            onChange={(event)=> {
                                                this.setState({
                                                    ...this.state, 
                                                    selectedStock: {
                                                        ...this.state.selectedStock,
                                                        stock: event.target.value
                                                    }
                                                })
                                            }}
                                        />
                                        <InputLabel 
                                            id="unit-price" 
                                            sx={{width: '100%', mt: 2}}
                                            variant="standard"
                                        >
                                            Unit price
                                        </InputLabel>
                                        <Input 
                                            id="unit-price"
                                            color="secondary"
                                            type="number"
                                            variant="standard"
                                            endAdornment={<InputAdornment position="end">Rs</InputAdornment>}
                                            defaultValue={this.state.selectedStock.unitPrice}
                                            sx={{width: '100%', mb: 2}}
                                            onChange={(event)=> {
                                                this.setState({
                                                    ...this.state, 
                                                    selectedStock: {
                                                        ...this.state.selectedStock,
                                                        unitPrice: event.target.value
                                                    }
                                                })
                                            }}
                                        />
                                    </React.Fragment>
                                    : 
                                    <React.Fragment>
                                        <ImageList variant="masonry">
                                            <ImageListItem key="Subheader" cols={2}>
                                                <ListSubheader component="div">
                                                    {this.state.farm.exist === true?
                                                        this.state.farm.name: "My Farm"
                                                    }
                                                </ListSubheader>
                                            </ImageListItem>

                                            {this.state.stockList.data.map((item)=> {
                                                return(
                                                    <ImageListItem key={item._id}>
                                                        <img
                                                            src={item.mediaPresent === true?`${item?.mediaUrl}`:`${farm}`}
                                                            srcSet={item.mediaPresent === true?`${item?.mediaUrl}`:`${farm}`}
                                                            alt={item?.surplusId?.name}
                                                            loading="lazy"
                                                        />

                                                        <ImageListItemBar
                                                            title={item?.surplusId?.name}
                                                            subtitle={`${item.stock} in Stock`}
                                                            actionIcon={
                                                                <IconButton
                                                                    sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                                                    aria-label={`info about ${item.title}`}
                                                                >
                                                                    <CurrencyRupeeIcon />{item.unitPrice}
                                                                </IconButton>
                                                            }
                                                        />
                                                    </ImageListItem>

                                                    
                                                );
                                            })}
                                        </ImageList>
                                    </React.Fragment>
                                } 
                            </DialogContent>
                            <DialogActions>
                                {this.state.modal.type === "CREATE"?
                                    <Button onClick={this.handleAddStock}>Create Stock</Button>
                                    :
                                    this.state.modal.type === "EDIT"? 
                                    <Button onClick={this.handleUpdateStock}>Update Stock</Button>
                                    :
                                    ""
                                }
                            </DialogActions>
                        </Dialog>
                        <Paper elevation={0}>
                            <Stack spacing={2} 
                                direction="row"  
                                sx={{my: 2}}
                            >
                                <Button 
                                    variant="outlined" 
                                    startIcon={<VisibilityIcon />}
                                    onClick = {this.handleViewFarm}
                                >
                                    {this.state.farm.exist === true?
                                        this.state.farm.name:""
                                    }
                                </Button>
                                <Tooltip title="Create new stock" placement="right">
                                    <IconButton 
                                        aria-label="delete"
                                        onClick = {this.handleCreateStock}
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </Tooltip>  
                                <ToggleButtonGroup
                                    color="secondary"
                                    value={this.state.toggleFilter}
                                    size="large"
                                    exclusive
                                    onChange={this.handleSetFilter}
                                >
                                    
                                    <ToggleButton value={0}>
                                        <Tooltip title="Turn Filters Off">
                                            <FilterAltOffIcon/>
                                        </Tooltip>
                                    </ToggleButton>
                                    <ToggleButton value={1}>
                                        <Tooltip title="View in-stock">
                                            <SignalWifiStatusbar4BarIcon/>
                                        </Tooltip>
                                    </ToggleButton>
                                    <ToggleButton value={2}>
                                        <Tooltip title="View out-of-stock">
                                            <SignalWifiStatusbarNullIcon/>
                                        </Tooltip>
                                    </ToggleButton>
                                </ToggleButtonGroup>                          
                            </Stack>
                            <Divider color="secondary"/>

                            <Card className="mt-4 mx-2 mb-4">
                            </Card>
                        </Paper>
                        
                        <Card raised sx={{ width: 'auto', mt: 2 }}>
                            <CardContent sx={{width: 'inherit'}}>
                                <TableContainer component={Paper}>
                                    <Table sx={{ width: 'inherit' }} aria-label="a dense table">
                                        <TableHead sx={{color: 'secondary.main'}}>
                                            <TableRow >
                                                <TableCell 
                                                    align="center" 
                                                    sx={{color: 'secondary.main', fontWeight: 600}}
                                                >
                                                    <CameraIcon/>
                                                </TableCell>
                                                <TableCell 
                                                    align="center" 
                                                    sx={{color: 'secondary.main', fontWeight: 600}}
                                                >
                                                    Name
                                                </TableCell>
                                                <TableCell 
                                                    align="center" 
                                                    sx={{color: 'secondary.main', fontWeight: 600}}
                                                >
                                                    Type
                                                </TableCell>
                                                <TableCell 
                                                    align="center" 
                                                    sx={{color: 'secondary.main', fontWeight: 600}}
                                                >
                                                    Stock
                                                </TableCell>
                                                <TableCell 
                                                    align="center" 
                                                    sx={{color: 'secondary.main', fontWeight: 600}}
                                                >
                                                    Price
                                                </TableCell>
                                                <TableCell 
                                                    align="center" 
                                                    sx={{color: 'secondary.main', fontWeight: 600}}
                                                >
                                                    Created
                                                </TableCell>
                                                <TableCell 
                                                    align="center" 
                                                    sx={{color: 'secondary.main', fontWeight: 600}}
                                                >
                                                    Updated
                                                </TableCell>
                                                <TableCell 
                                                    align="center" 
                                                    sx={{color: 'secondary.main', fontWeight: 600}}
                                                >
                                                    Control
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {this.state.stockList.count === 0?
                                                <TableRow
                                                    key={"NODATA"}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell colSpan={7}>
                                                        <Alert 
                                                            variant="outlined" 
                                                            severity="warning"
                                                            sx={{ width: 'auto' }}
                                                        >
                                                            No Data Available
                                                        </Alert>
                                                    </TableCell>
                                                </TableRow>
                                                :
                                                this.state.stockList.data.map((element)=> {
                                                    return (
                                                        <TableRow
                                                            key={element._id}
                                                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                        >
                                                            
                                                            <TableCell align="center">
                                                                <Avatar 
                                                                    alt="FRESH HARVEST" 
                                                                    variant="rounded"
                                                                    src={
                                                                        element.mediaPresent === true?
                                                                            element.mediaUrl
                                                                            : 
                                                                            ""
                                                                        } 
                                                                >
                                                                    {element.mediaPresent === false? 
                                                                        <Thumbnail width="50px" height="50px"/>:""
                                                                    }
                                                                </Avatar>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {element.surplusId.name}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {element.surplusId.type.toUpperCase()}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {element.stock}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {element.unitPrice}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {moment(element.createdAt).format("ll")}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {moment(element.updatedAt).format("ll")}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Tooltip title="Update" placement="right">
                                                                    <IconButton 
                                                                        aria-label="update"
                                                                        onClick= {()=> {
                                                                            this.setState({
                                                                                ...this.state,
                                                                                selectedStock: {
                                                                                    stockId: element._id,
                                                                                    stock: element.stock,
                                                                                    unitPrice: element.unitPrice
                                                                                }
                                                                            }, ()=> {
                                                                                this.triggerStockUpdate();
                                                                            })                                                                        
                                                                        }}
                                                                    >
                                                                        <MediationOutlinedIcon />
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
                            </CardContent>
                        </Card>
                        
                    </React.Fragment>
                }
            </React.Fragment>   
            
        )
    }
}

export default FarmWidget;