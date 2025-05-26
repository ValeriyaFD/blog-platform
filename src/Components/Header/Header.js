import React from 'react';
import classes from './Header.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetCurrentUserQuery } from '../../blogApi';
import { logout } from '../../reducers/authSlice';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const {
    data: currentUser,
    error,
    isLoading,
  } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleCreateArticle = () => {
    navigate('/new-article');
  };

  const { username = '', image = '' } = currentUser || {};

  if (isLoading) {
    return (
      <div className={classes.container}>
        <div className={classes.main}>
          <Link to="/">Realworld Blog</Link>
        </div>
        <div className={classes.authorization}>
          <div>Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('User upload error:', error);
  }

  return (
    <div className={classes.container}>
      <div className={classes.main}>
        <Link to="/">Realworld Blog</Link>
      </div>
      <div className={classes.authorization}>
        {isAuthenticated ? (
          <div className={classes.auth}>
            <button className={classes.createArticle} onClick={handleCreateArticle}>
              Create article
            </button>
            <button className={classes.profile} onClick={handleProfileClick}>
              <span className={classes.username}>{username}</span>
              <img 
              src={image || 'https://static.productionready.io/images/smiley-cyrus.jpg'} 
              alt={`Avatar`} 
              className={classes.avatar} 
              />
            </button>
            <button className={classes.logOut} onClick={handleLogout}>
              Log Out
            </button>
          </div>
        ) : (
          <>
            <div to="/sign-in" className={classes.signIn}>
              <Link to="/sign-in" className={classes.signInText}>
                Sign In
              </Link>
            </div>
            <div className={classes.signUp}>
              <Link to="/sign-up" className={classes.signUpText}>
                Sign Up
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
