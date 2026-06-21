import React, { createContext, useState, useContext } from "react";
import { Children } from "react";

export const UserContext = createContext()


export const UserProvider = ({ children }) => {
    const [user, setUser] = useState()
    return (
        <UserContext.Provider value={{user,setUser}}>
            {children}
        </UserContext.Provider>
    )
}
 
