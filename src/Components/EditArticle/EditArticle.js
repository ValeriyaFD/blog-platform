import React, { useEffect, useState } from 'react';
import classes from './EditArticle.module.scss';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetArticleBySlugQuery, useUpdateArticleMutation } from '../../blogApi';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const articleSchema = yup.object().shape({
  title: yup.string().required('Title is required').min(3).max(100),
  shortDesc: yup.string().required('Description is required').min(10).max(200),
  body: yup.string().required('Article text is required').min(20),
});

export default function EditArticle() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [serverError, setServerError] = useState(null);

  const { data: articleData, isLoading: isFetching } = useGetArticleBySlugQuery(slug);
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(articleSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    if (articleData?.article) {
      const article = articleData.article;
      reset({
        title: article.title,
        shortDesc: article.description,
        body: article.body,
      });
      setTags(article.tagList || []);
    }
  }, [articleData, reset]);

  const addTag = () => {
    const trimmed = currentTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const clearForm = () => {
    setCurrentTag('');
  };

  const onSubmit = async (data) => {
    try {
      setServerError(null);

      await updateArticle({
        slug,
        article: {
          title: data.title,
          description: data.shortDesc,
          body: data.body,
          tagList: tags,
        },
      }).unwrap();

      navigate(`/articles/${slug}`);
    } catch (err) {
      console.error('Update error:', err);
      setServerError(err.data?.errors || 'Couldn\'t update the article');
    }
  };

  if (isFetching) {
    return <div className={classes.loading}>Загрузка...</div>;
  }

  if (!articleData?.article) {
    return <div className={classes.error}>Статья не найдена</div>;
  }
  return (
    <div className={classes.container}>
      <h2 className={classes.header}>Edit article</h2>
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
            {...register('body')}
            className={`${classes.textarea} ${errors.body ? classes.inputError : ''}`}
            placeholder="Text"
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
        <button type="submit" className={classes.submitButton} disabled={isUpdating}>
          {isUpdating ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
