import React, { useEffect } from 'react';
import classes from './Profile.module.scss';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useUpdateCurrentUserMutation, useGetCurrentUserQuery } from '../../blogApi';
import { setCredentials, logout } from '../../reducers/authSlice';

const schema = yup.object().shape({
  username: yup.string().required('Username is required').max(20, 'Username must not exceed 20 characters'),
  email: yup.string().required('Email is required').email('Unvalid email address'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(40, 'Password must not exceed 40 characters')
    .nullable(),
  image: yup
    .string()
    .required('Image is required')
    .url('Unvalid URL')
    .nullable()
    .test('is-url', 'Please enter a valid URL', (value) => !value || /^https?:\/\/.+/i.test(value)),
});

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const { data: currentUser, error: userError } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      image: '',
    },
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        username: currentUser.username,
        email: currentUser.email,
        password: '',
        image: currentUser.image,
      });
    }
  }, [currentUser, reset]);

  const [updateUser] = useUpdateCurrentUserMutation();

  useEffect(() => {
    if (userError && userError.status === 401) {
      dispatch(logout());
      navigate('/sign-in');
    }
  }, [userError, dispatch, navigate]);

  const onSubmit = async (data) => {
    try {
      const updateData = {
        user: {
          username: data.username,
          email: data.email,
          ...(data.password && { password: data.password }),
          ...(data.image && { image: data.image }),
        },
      };
      navigate('/');
      const response = await updateUser(updateData).unwrap();

      dispatch(
        setCredentials({
          user: response.user,
          token: response.token,
        })
      );
    } catch (err) {
      if (err.status === 401) {
        dispatch(logout());
        navigate('/sign-in');
      } else if (err.data?.errors) {
        Object.entries(err.data.errors).forEach(([key, value]) => {
          setError(key.toLowerCase(), {
            type: 'server',
            message: Array.isArray(value) ? value.join(', ') : value,
          });
        });
      } else {
        setError('root', {
          type: 'manual',
          message: err.message || 'Update failed. Please try again.',
        });
      }
    }
  };

  if (!token) {
    navigate('/sign-in');
    return null;
  }

  if (userError) {
    return <div className={classes.error}>Error loading user data</div>;
  }

  if (!currentUser) {
    return <div className={classes.loading}>Loading...</div>;
  }

  return (
    <div className={classes.container}>
      <div className={classes.title}>Edit Profile</div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={classes.username}>
          <p className={classes.text}>Username</p>
          <input
            {...register('username')}
            className={`${classes.input} ${errors.username ? classes.inputError : ''}`}
            placeholder="Username"
            disabled={isSubmitting}
          />
          {errors.username && <p className={classes.error}>{errors.username.message}</p>}
        </div>

        <div className={classes.email}>
          <p className={classes.text}>Email address</p>
          <input
            type="email"
            {...register('email')}
            className={`${classes.input} ${errors.email ? classes.inputError : ''}`}
            placeholder="Email address"
            disabled={isSubmitting}
          />
          {errors.email && <p className={classes.error}>{errors.email.message}</p>}
        </div>

        <div className={classes.password}>
          <p className={classes.text}>New password</p>
          <input
            type="password"
            {...register('password')}
            className={`${classes.input} ${errors.password ? classes.inputError : ''}`}
            placeholder="New password"
            disabled={isSubmitting}
          />
          {errors.password && <p className={classes.error}>{errors.password.message}</p>}
        </div>

        <div className={classes.avatarImage}>
          <p className={classes.text}>Avatar image (url)</p>
          <input
            {...register('image')}
            type="url"
            className={`${classes.input} ${errors.image ? classes.inputError : ''}`}
            placeholder="Avatar image URL"
            disabled={isSubmitting}
          />
          {errors.image && <p className={classes.error}>{errors.image.message}</p>}
        </div>

        {errors.root && <p className={classes.error}>{errors.root.message}</p>}

        <button type="submit" className={classes.create} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}
