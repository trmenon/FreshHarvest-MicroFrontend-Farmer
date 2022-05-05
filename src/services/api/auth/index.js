import { fetchCall } from '../../endpoints';
import config from '../../../constants/config.json';

const signin = (data)=> 
    fetchCall(
        "/auth/signin",
        config.requestMethod.POST,
        data
    );

const signup = (data)=> 
    fetchCall(
        "/auth/signup",
        config.requestMethod.POST,
        data
    );

const signout = ()=> 
    fetchCall(
        "/auth/signout",
        config.requestMethod.GET
    );

export {
    signin,
    signout,
    signup
};