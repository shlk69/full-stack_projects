import { createSlice, current } from "@reduxjs/toolkit";

 const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null,
        city: null,
        state: null,
        currentAdd: null,
        shopsInMyCity:null
    },
    reducers: {
        setUserData :(state,action) => {
            state.userData = action.payload
        },
        setCity :(state,action) => {
            state.city = action.payload
        },
        setState:(state,action) => {
            state.state = action.payload
        },
        setCurrentAdd: (state, action) => {
            state.currentAdd=action.payload
        },
        setShopsInMyCity: (state, action) => {
            state.shopsInMyCity=action.payload
        }
    }
})


export const { setUserData,setCity ,setState,setShopsInMyCity} = userSlice.actions
export default userSlice.reducer