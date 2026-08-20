import { configureStore } from '@reduxjs/toolkit'
import userSlice from './user.slice'

export const store = configureStore({
    reducer: {
       user:userSlice
    },
    devTools:true
})

