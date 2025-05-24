import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BlogArticle from '../BlogArticle/BlogArticle';
import { Pagination, Spin, Alert } from 'antd';
import classes from './BlogList.module.scss';
import { useGetArticlesQuery } from '../../blogApi';
import { setCurrentPage } from '../../reducers/articleSlise';
import { Link } from 'react-router-dom';

export default function BlogList() {
  const dispatch = useDispatch();
  const currentPage = useSelector((state) => state.articles.currentPage);
  const limit = useSelector((state) => state.articles.limit);

  const { data, isLoading, isError } = useGetArticlesQuery({ page: currentPage, limit });

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  if (isLoading) {
    return (
      <div className={classes.loadingOverlay}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Warning"
        description="Couldn't upload articles"
        type="error"
        showIcon
        className={classes.errorAlert}
      />
    );
  }

  return (
    <div className={classes.blogListContainer}>
      <div className={classes.articlesGrid}>
        {data?.articles.length > 0 ? (
          data.articles.map((article) => {
            if (!article.slug) {
              console.error('Article not found:', article);
              return null;
            }
            return (
              <Link key={article.slug} style={{ cursor: 'pointer' }} to={`/articles/${article.slug}`}>
                <BlogArticle article={article} />
              </Link>
            );
          })
        ) : (
          <p className={classes.noArticles}>Статей не найдено</p>
        )}
      </div>
      <Pagination
        className={classes.pagination}
        align="center"
        current={currentPage}
        total={data?.total}
        pageSize={limit}
        onChange={handlePageChange}
        disabled={isLoading}
        showSizeChanger={false}
        showLessItems
      />
    </div>
  );
}
