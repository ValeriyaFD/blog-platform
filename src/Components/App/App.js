import React, { useEffect } from 'react';
import Article from '../Article/Article';
import SignIn from '../SignIn/SignIn';
import SignUp from '../SignUp/SignUp';
import Header from '../Header/Header';
import BlogList from '../BlogList/BlogList';
import Profile from '../Profile/Profile';
import EditArticle from '../EditArticle/EditArticle';
import CreateArticle from '../CreateArticle/CreateArticle';
import PrivateRoute from '../PrivateRoute';
import AutoUpdateUser from '../AutoUpdaterUser';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth } from '../../reducers/authSlice';

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  return (
    <BrowserRouter>
      <AutoUpdateUser />
      <Header />
      <Routes>
        <Route path="/" element={<BlogList />} />
        <Route path="/articles" element={<BlogList />} />
        <Route path="/articles/:slug" element={<Article />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/new-article" element={<CreateArticle />} />
          <Route path="/articles/:slug/edit" element={<EditArticle />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
