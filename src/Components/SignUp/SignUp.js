import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useSignUpMutation } from '../../blogApi';
import { setCredentials } from '../../reducers/authSlice';
import classes from './SignUp.module.scss';

// Схема валидации
const schema = yup.object().shape({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must not exceed 20 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(40, 'Password must not exceed 40 characters'),
  repeatPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  agree: yup
    .boolean()
    .oneOf([true], 'You must agree to the terms')
});

export default function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: yupResolver(schema)
  });

  const [signUp] = useSignUpMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // Правильная структура запроса для API
      const response = await signUp({ user: data }).unwrap();

      dispatch(setCredentials({
        user: response.user,
        token: response.user.token
      }));
      navigate('/');
    } catch (err) {
      if (err.data?.errors) {
        // Обработка серверных ошибок
        Object.entries(err.data.errors).forEach(([key, value]) => {
          setError(key.toLowerCase(), {
            type: 'server',
            message: Array.isArray(value) ? value.join(', ') : value
          });
        });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Registration failed. Please try again.'
        });
      }
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.title}>Create new account</div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Поле username */}
        <div className={classes.username}>
          <p className={classes.text}>Username</p>
          <input
            {...register('username')}
            className={`${classes.input} ${errors.username ? classes.inputError : ''}`}
            placeholder="Username"
            disabled={isSubmitting}
          />
          {errors.username && (
            <p className={classes.error}>{errors.username.message}</p>
          )}
        </div>

        {/* Поле email */}
        <div className={classes.email}>
          <p className={classes.text}>Email address</p>
          <input
            type="email"
            {...register('email')}
            className={`${classes.input} ${errors.email ? classes.inputError : ''}`}
            placeholder="Email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className={classes.error}>{errors.email.message}</p>
          )}
        </div>

        {/* Поле password */}
        <div className={classes.password}>
          <p className={classes.text}>Password</p>
          <input
            type="password"
            {...register('password')}
            className={`${classes.input} ${errors.password ? classes.inputError : ''}`}
            placeholder="Password"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className={classes.error}>{errors.password.message}</p>
          )}
        </div>

        {/* Поле repeatPassword */}
        <div className={classes.repeatPassword}>
          <p className={classes.text}>Repeat Password</p>
          <input
            type="password"
            {...register('repeatPassword')}
            className={`${classes.input} ${errors.repeatPassword ? classes.inputError : ''}`}
            placeholder="Repeat Password"
            disabled={isSubmitting}
          />
          {errors.repeatPassword && (
            <p className={classes.error}>{errors.repeatPassword.message}</p>
          )}
        </div>

        {/* Чекбокс согласия */}
        <div className={classes.agree}>
          <input
            type="checkbox"
            id="agree"
            {...register('agree')}
            className={classes.checkbox}
            disabled={isSubmitting}
          />
          <label htmlFor="agree" className={classes.agreeText}>
            I agree to the processing of my personal information
          </label>
          {errors.agree && (
            <p className={classes.error}>{errors.agree.message}</p>
          )}
        </div>

        {/* Общие ошибки сервера */}
        {errors.root && (
          <div className={classes.serverError}>
            {errors.root.message}
          </div>
        )}

        <button 
          type="submit" 
          className={classes.create}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </form>

      <div>
        <p className={classes.info}>
          Already have an account?{' '}
          <Link to="/sign-in" className={classes.sign}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}