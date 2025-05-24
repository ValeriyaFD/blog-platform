import React from 'react';
import classes from './SignIn.module.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSignInMutation } from '../../blogApi';
import { useDispatch } from 'react-redux';
import { setCredentials, logout } from '../../reducers/authSlice';

const schema = Yup.object().shape({
  email: Yup.string().required('Email обязателен').email('Введите корректный email'),
  password: Yup.string().required('Пароль обязателен').min(6, 'Минимум 6 символов'),
});

export default function SignIn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [signIn] = useSignInMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (formData) => {
    try {
      const result = await signIn({ user: formData }).unwrap();

      if (!result.user || !result.user.token) {
        throw new Error('Invalid server response');
      }

      dispatch(
        setCredentials({
          user: result.user,
          token: result.user.token,
          isAuthenticated: true,
        })
      );

      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('token', result.user.token);

      navigate('/');
    } catch (err) {
      console.error('Login error:', err);

      if (err.status === 401) {
        dispatch(logout());
        navigate('/login');
        return;
      }

      if (err.data?.errors) {
        Object.entries(err.data.errors).forEach(([key, value]) => {
          setError(key.toLowerCase(), {
            type: 'server',
            message: Array.isArray(value) ? value.join(', ') : value,
          });
        });
      } else {
        setError('root', {
          type: 'manual',
          message: err.message || 'Login failed. Please try again.',
        });
      }
    }
  };
  return (
    <div className={classes.container}>
      <div className={classes.title}>Sign In</div>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={classes.email}>
          <p className={classes.text}>Email address</p>
          <input
            type="email"
            {...register('email')}
            className={`${classes.input} ${errors.email ? classes.inputError : ''}`}
            placeholder="Email address"
          />
          {errors.email && <p className={classes.error}>{errors.email.message}</p>}
        </div>

        <div className={classes.password}>
          <p className={classes.text}>Password</p>
          <input
            {...register('password')}
            type="password"
            className={`${classes.input} ${errors.password ? classes.inputError : ''}`}
            placeholder="Password"
          />
          {errors.password && <p className={classes.error}>{errors.password.message}</p>}
        </div>

        {Object.keys(errors).length === 0 && errors.root?.serverError && (
          <p className={classes.apiError}>{errors.root.serverError.message}</p>
        )}

        <button type="submit" className={classes.login}>
          Login
        </button>
      </form>

      <div className={classes.infoBlock}>
        <p className={classes.info}>
          Don&apos;t have an account?{' '}
          <Link to="/sign-up" className={classes.sign}>
            Sign Up
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
