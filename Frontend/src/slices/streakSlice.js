import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    currentStreak: 0,
    lastStreakDate: null, // Store the last date when the streak was updated
};

const streakSlice = createSlice({
    name: 'streak',
    initialState,
    reducers: {
        setStreak(state, action) {
            const { currentStreak, lastStreakDate } = action.payload;
            state.currentStreak = currentStreak;
            state.lastStreakDate = lastStreakDate;
        }
    },
});

export const { setStreak } = streakSlice.actions;
export default streakSlice.reducer;