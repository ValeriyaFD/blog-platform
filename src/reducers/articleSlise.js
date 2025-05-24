import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPage: 1,
  limit: 5,
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
});

export const { setCurrentPage } = articleSlice.actions;
export default articleSlice.reducer;
