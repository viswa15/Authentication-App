import {create} from "zustand";
import {devtools} from "zustand/middleware";
import axios  from "axios";

const API_URL = import.meta.env.MODE = "development" ? "http://localhost:5000" : "";

axios.defaults.withCredentials = true;


export const useAuthStore = create(devtools((set) => ({
    user : null,
    isAuthenticated : false,
    error : null,
    isLoading : false,
    isCheckingAuth : false,
    message : null,

    signup : async(email,password,name) =>{
        set({isLoading : true,error : null})
        try{
            const response = await axios.post(`${API_URL}/api/auth/signup`,{email,password,name});
            set({isLoading : false, user : response.data.user,isAuthenticated : true})
        }catch(e){
            set({error : e.response.data.message,isLoading : false})
            throw e;
        }
    },

    verifyEmail : async(code)=>{
        set({isLoading : true, error : null})
        try{
                const res = await axios.post(`${API_URL}/api/auth/verify-email`,{code});
                set({isLoading : false, user : res.data.user, isAuthenticated : true})
                return res.data;
        }catch(e){
            set({error : e.response.data.message,isLoading : false})
            throw e;
        }
    },

    login : async(email,password) =>{
        set({isLoading : true, error : null});
        try{
            const response = await axios.post(`${API_URL}/api/auth/login`,{email,password});
            set({
                isLoading : false,
                user : response.data.user,
                isAuthenticated : true
            })
        }catch(e){
            set({error : e.response.data.message,isLoading : false});
            throw e;
        }
    },

    logout : async() =>{
        set({isLoading :true, error : null});
        try{
            await axios.post(`${API_URL}/api/auth/logout`);
            set({isLoading : false, user : null, isAuthenticated : false});
        }catch(e){
            set({error : e.response.data.message,isLoading : false});
            throw e;
        }
    },

    checkAuth : async() => {
        set({isCheckingAuth : true, error : null});
        try{
            console.log("checking auth...")
            const response = await axios.get(`${API_URL}/api/auth/check-auth`);
            set({
                isCheckingAuth : false,
                user : response.data.user,
                isAuthenticated : true
            })
        }catch(e){
            set({error : e.response.data.message,isCheckingAuth : false});
            throw e;
        }
    },

    forgotPassword : async(email) =>{
        set({isLoading : true, error : null});
        try{
           await axios.post(`${API_URL}/api/auth/forgot-password`,{email});
           set({isLoading : false, message : "Password reset link sent successfully"})
        }catch(e){
            set({error : e.response.data.message || "Error sending Password reset email",isLoading : false});
            throw e;
        }
    },

    resetPassword : async(token,password) =>{
        set({isLoading : true, error : null});
        try{
           const res = await axios.post(`${API_URL}/api/auth/reset-password/${token}`,{password});
           set({isLoading : false, message : res.data.message})
        }catch(e){
            set({error : e.response.data.message || "Error resetting Password",isLoading : false});
            throw e;
        }
    }
})));