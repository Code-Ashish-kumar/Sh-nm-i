import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    token : localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null,
    user_id: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuth(state, action) {
            state.isAuthenticated = true;
            state.user_id = action.payload.user_id;
        },
        setToken(state, action) {
            state.token = action.payload.token;
            // localStorage.setItem("token", JSON.stringify(action.payload.token));
        },
        clearAuth(state) {
            state.isAuthenticated = false;
            state.user_id = null;
            state.token = null;
        },
    },
});

export const { setAuth, setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;