import { Observable, BehaviorSubject } from 'rxjs';
import config from '../../constants/config.json';
import { getCookie } from '../../authentication';

const loaderObservable = new BehaviorSubject(false);

export const fetchCall = (
    url = "",
    method = config.requestMethod.GET,
    data = {},    
    isSigninRequired= false,
    header = {},
    isFormData = false,
) => {

    // Options
    let options = {
        method: method,
        mode: "cors",
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    };
    // Checking if call is a GET call to add body
    if(method !== config.requestMethod.GET) {
        options = {
            ...options, 
            body: isFormData=== true? data: JSON.stringify(data),
        };
        
    }

    if(isSigninRequired === true) {
        const bearerToken = "Bearer "+ getCookie('token');
        options={...options, headers:{...options.headers, Authorization: bearerToken}};
    }

    if (isFormData=== true) {
        delete options.headers["Content-Type"];
    }

    return Observable.create((observer)=> {
        try {
            loaderObservable.next(true);
            const finalUrl = config.server.base_url+ url;
            fetch(finalUrl, options)
                .then((res)=> {
                    if(
                        res.headers.get("Content-Type") &&
                        res.headers.get("Content-Type")?.includes("application/json") 
                    ) {
                        try {
                            return res.json();
                        }catch(samp) {
                            console.log(samp);
                        }
                    }else {
                        return res.blob();
                    }
                })
                .then((body)=> {
                    loaderObservable.next(false);
                    observer.next(body);
                    observer.complete();
                    // TODO status code
                })
                .catch((err)=> {
                    observer.error(err);
                    loaderObservable.next(false);
                });
        } catch(error) {
            loaderObservable.error(false);
            observer.error(error);
        }        
    });
};