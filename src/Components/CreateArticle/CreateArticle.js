import React, { useState } from 'react';
import classes from './CreateArticle.module.scss';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useCreateArticleMutation } from '../../blogApi';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const articleSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3).max(100),
  shortDesc: yup.string().required('Description is required').max(200),
  body: yup.string().required('Article text is required').min(10),
});

export default function CreateArticle() {
  const navigate = useNavigate();
  const [createArticle, { isLoading }] = useCreateArticleMutation();
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(articleSchema),
    mode: 'onBlur',
  });

  const clearForm = () => {
    setCurrentTag('');
  };
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      const articleData = {
        article: {
          title: data.title,
          description: data.shortDesc,
          body: data.body,
          tagList: tags,
        },
      };
      await createArticle(articleData).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Failed to create article:', err);
    }
  };
  const isFormValid = watch('title') && watch('shortDesc') && watch('body') && !Object.keys(errors).length;
  return (
    <div className={classes.container}>
      <h2 className={classes.header}>Create new article</h2>
      {serverError && <div className={classes.serverError}>{serverError}</div>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={classes.title}>
          <p className={classes.text}>Title</p>
          <input
            {...register('title')}
            className={`${classes.input} ${errors.title ? classes.inputError : ''}`}
            placeholder="Title"
          />
          {errors.title && <p className={classes.error}>{errors.title.message}</p>}
        </div>
        <div className={classes.shortDesc}>
          <p className={classes.text}>Short description</p>
          <input
            {...register('shortDesc')}
            className={`${classes.input} ${errors.shortDesc ? classes.inputError : ''}`}
            placeholder="Title"
          />
          {errors.shortDesc && <p className={classes.error}>{errors.shortDesc.message}</p>}
        </div>
        <div className={classes.mainText}>
          <p className={classes.text}>Text</p>
          <textarea
            {...register('body', { required: 'Article text is required' })}
            className={`${classes.textarea} ${errors.body ? classes.inputError : ''}`}
            placeholder="Text"
            rows={6}
          />
          {errors.body && <p className={classes.error}>{errors.body.message}</p>}
        </div>
        <p className={classes.text}>Tags</p>
        <div className={classes.table}>
          {tags.map((tag, index) => (
            <div key={index} className={classes.tagItem}>
              <div className={classes.inputTag}>{tag}</div>
              <button type="button" className={classes.delete} onClick={() => removeTag(tag)}>
                Delete
              </button>
            </div>
          ))}
          <div className={classes.tagInputGroup}>
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              className={classes.inputTag}
              placeholder="Tag"
            />
            <button type="button" className={classes.delete} onClick={clearForm}>
              Delete
            </button>
            <button type="button" className={classes.addTag} onClick={addTag}>
              Add tag
            </button>
          </div>
        </div>
        <button type="submit" disabled={!isFormValid || isLoading} className={classes.submitButton}>
          Send
        </button>
      </form>
    </div>
  );
}
