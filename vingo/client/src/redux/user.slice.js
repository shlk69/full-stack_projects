import { createSlice, current } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: 'user',
    initialState: {
        userData: null,
        city: null,
        state: null,
        currentAdd: null,
        shopsInMyCity: null,
        itemsInMyCity: null,
        cartItems: [],
        totalAmount: 0
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        setCity: (state, action) => {
            state.city = action.payload
        },
        setState: (state, action) => {
            state.state = action.payload
        },
        setCurrentAdd: (state, action) => {
            state.currentAdd = action.payload
        },
        setShopsInMyCity: (state, action) => {
            state.shopsInMyCity = action.payload
        },
        setItemsInMyCity: (state, action) => {
            state.itemsInMyCity = action.payload
        },
        addToCart: (state, action) => {
            const cartItem = action.payload
            const exists = state.cartItems.find(i => i.id == cartItem.id)
            if (exists) {
                exists.quantity += cartItem.quantity
            } else {
                state.cartItems.push(exists)
            }
            console.log(state.cartItems)

            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * quantity, 0)
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload
            const item = state.cartItems.find(i => i.id == id)
            if (item) {
                item.quantity = quantity
            }
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * quantity, 0)

        },
        removeCartItem: (state, action) => {
            state.cartItems = state.cartItems.filter(i => i.id !== action.payload)
            state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * quantity, 0)
        }


    }
})


export const { removeCartItem, updateQuantity, setUserData, setCity, addToCart, setState, setShopsInMyCity, setItemsInMyCity } = userSlice.actions
export default userSlice.reducer