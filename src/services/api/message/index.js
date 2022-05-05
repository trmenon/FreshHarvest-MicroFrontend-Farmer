import { fetchCall } from '../../endpoints';
import config from '../../../constants/config.json';

// Getting user list by pattern
const getUsersByPattern = (pattern)=> 
    fetchCall(
        `/message/getUsersByPattern/${pattern}`,
        config.requestMethod.GET,
        {},
        true,
    );

// Sending new message
const sendMessage = (data)=> 
    fetchCall(
        "/message/sendMessage",
        config.requestMethod.POST,
        data,
        true
    );

// Retreiving messages
const getMessages = (data)=> 
    fetchCall(
        "/message/getMessages",
        config.requestMethod.POST,
        {...data, isNotification: false},
        true
    );

// retreiving message by id
const getMessageById = (data)=>
    fetchCall(
        "/message/getMessageById",
        config.requestMethod.POST,
        data,
        true
    );

export {
    getUsersByPattern,
    sendMessage,
    getMessages,
    getMessageById
}