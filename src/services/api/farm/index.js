import { fetchCall } from '../../endpoints';
import config from '../../../constants/config.json';

// Creating new surplus
const createFarm = (data)=> 
    fetchCall(
        "/farmer/createFarm",
        config.requestMethod.POST,
        data,
        true
    );

// Getting farm data of owner
const getFarmOfOwner = (data)=> 
    fetchCall(
        `/farmer/getOwnerFarm/${data}`,
        config.requestMethod.GET,
        {},
        true
    );

// Getting surplus data with or without filters
const getSurplusDetails = (data)=> 
    fetchCall(
        "/farmer/getSurplusDetails",
        config.requestMethod.POST,
        data,
        true
    );

// Getting surplus data with or without filters
const createNewStock = (data)=> 
    fetchCall(
        "/farmer/createStock",
        config.requestMethod.POST,
        data,
        true
    );

// Getting stock list with or without filters
const getStockDetails = (data)=> 
    fetchCall(
        "/farmer/getStock",
        config.requestMethod.POST,
        data,
        true
    );

// Updating stock by Id
const updateStock = (data, id)=> 
    fetchCall(
        `/farmer/updateStock/${id}`,
        config.requestMethod.PUT,
        data,
        true
    );

// Getting stock list with or without filters
const getFarmerSales = (data)=> 
    fetchCall(
        "/farmer/getFarmerSales",
        config.requestMethod.POST,
        data,
        true
    );

// Getting stock list with or without filters
const despatchOrder = (data)=> 
    fetchCall(
        "/farmer/despatchOrder",
        config.requestMethod.PUT,
        data,
        true
    );

export {
    createFarm,
    getFarmOfOwner,
    getSurplusDetails,
    createNewStock,
    getStockDetails,
    updateStock,
    getFarmerSales,
    despatchOrder
};