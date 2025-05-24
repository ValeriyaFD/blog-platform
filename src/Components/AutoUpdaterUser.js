import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from '../reducers/authSlice';

export default function AutoUpdateUser() {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(checkAuth());
    }
  }, [dispatch, isAuthenticated, token]);

  return null;
}
