import { configureStore } from '@reduxjs/toolkit';
import articleReducer from './reducers/articleSlise';
import authReducer from './reducers/authSlice';
import { blogApi } from './blogApi';

const store = configureStore({
  reducer: {
    articles: articleReducer,
    auth: authReducer,
    [blogApi.reducerPath]: blogApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(blogApi.middleware),
});

export default store;
