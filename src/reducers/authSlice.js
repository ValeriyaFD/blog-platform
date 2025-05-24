import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://blog-platform.kata.academy/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('Authorization', `Token ${token}`);
    return headers;
  },
});

const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem('auth');
    return serializedState
      ? JSON.parse(serializedState)
      : {
          user: null,
          token: null,
          isAuthenticated: false,
        };
  } catch (e) {
    console.error('Failed to load auth state', e);
    return {
      user: null,
      token: null,
      isAuthenticated: false,
    };
  }
};

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { getState, rejectWithValue }) => {
  const { token } = getState().auth;

  if (!token) return rejectWithValue('Token undefiend');

  try {
    const result = await baseQuery('/user', { getState }, {});

    if (result.error) {
      throw new Error(result.error.data?.message || 'Authorization error');
    }

    return result.data?.user || rejectWithValue('Incorrect response format');
  } catch (err) {
    console.error('Auth check error:', err);
    return rejectWithValue(err.message);
  }
});

const initialState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem(
        'auth',
        JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
        })
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;

        localStorage.setItem(
          'auth',
          JSON.stringify({
            ...state,
            user: action.payload,
          })
        );
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('auth');
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
