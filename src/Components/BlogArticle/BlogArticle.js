import React, { useState } from 'react';
import classes from './BlogArticle.module.scss';
import { HeartTwoTone, HeartFilled } from '@ant-design/icons';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { useFavoriteArticleMutation, useUnfavoriteArticleMutation } from '../../blogApi';

export default function BlogArticle({ article: initialArticle }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [favorite] = useFavoriteArticleMutation();
  const [unfavorite] = useUnfavoriteArticleMutation();
  const [article, setArticle] = useState(initialArticle);

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    try {
      if (article.favorited) {
        await unfavorite(article.slug).unwrap();
        setArticle({
          ...article,
          favorited: false,
          favoritesCount: article.favoritesCount - 1,
        });
      } else {
        await favorite(article.slug).unwrap();
        setArticle({
          ...article,
          favorited: true,
          favoritesCount: article.favoritesCount + 1,
        });
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  return (
    <div className={classes.container}>
      <div>
        <div className={classes.title}>
          {article.title}
          <button className={classes.likes} onClick={handleLikeClick} disabled={!isAuthenticated}>
            {article.favorited ? (
              <HeartFilled style={{ color: '#ff4d4f', fontSize: '14px' }} />
            ) : (
              <HeartTwoTone twoToneColor="#ccc" style={{ fontSize: '14px' }} />
            )}{' '}
            {article.favoritesCount}
          </button>
        </div>

        <div className={classes.profile}>
          <div>
            <p className={classes.userName}>{article.author.username}</p>
            <p className={classes.created}>{format(new Date(article.createdAt), 'MMMM d, yyyy')}</p>
          </div>
          {article.author.image && (
            <img
              src={article.author.image}
              alt={`${article.author.username}'s profile`}
              className={classes.profileImage}
            />
          )}
        </div>
      </div>
      {article.tagList.length === 0 ? (
        <div className={classes.tags}>No tags</div>
      ) : (
        <div className={classes.tags}>
          {article.tagList.map((tag, index) => (
            <span key={index} className={classes.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className={classes.description}>{article.description}</div>
    </div>
  );
}
