import { fetchCall } from '../../endpoints';
import config from '../../../constants/config.json';

// Getting stock list with or without filters
const uploadFile = (data)=> 
    fetchCall(
        "/asset/upload",
        config.requestMethod.POST,
        data,
        true,
        {},
        true
    );

// Getting stock media of owner
const getStockMedia = (data)=> 
    fetchCall(
        `/asset/getStockMedia/${data}`,
        config.requestMethod.GET,
        {},
        true
    );

export {
    uploadFile,
    getStockMedia
}