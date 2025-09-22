import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext()

export const AppContextProvider =  (props) => {

     axios.defaults.withCredentials = true;

    const backend_url = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(false);

    const getAuthState = async () => {
        try{
            const {data} = await axios.get(backend_url + '/api/auth/is-auth');
            if(data.success){
                setIsLoggedIn(true);
                getUserData();
            
            }else {
            setIsLoggedIn(false);
            setUserData(null);
        }
        }
        catch(err){
        setIsLoggedIn(false);
        setUserData(null);
        // Don't show error toast for auth check failures
        console.log("Authentication check failed:", err.message);

        }
    }

    const getUserData = async () => {
        try{
            const { data } = await axios.get(backend_url + '/api/user/data');
            data.success ? setUserData(data.userData) : toast.error(data.message)
        }
        catch(err){
            toast.error(err.message)
        }
    }

    useEffect (()=>{
        getAuthState();
    },[])

    const value = {
        backend_url,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
        getUserData,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}