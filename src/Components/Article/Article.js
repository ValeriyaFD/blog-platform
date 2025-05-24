import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { HeartTwoTone, HeartFilled, LoadingOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useGetArticleBySlugQuery, useDeleteArticleMutation } from '../../blogApi';
import styles from './Article.module.scss';
import { Spin, Alert, Button, Popconfirm } from 'antd';
import { useSelector } from 'react-redux';

export default function Article() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetArticleBySlugQuery(slug);
  const [deleteArticle] = useDeleteArticleMutation();
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

  const handleEdit = () => {
    navigate(`/articles/${slug}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteArticle(slug).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Error when deleting an article:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingOverlay}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 60 }} spin />} />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        message="Warning"
        description="Couldn't upload the article"
        type="error"
        showIcon
        className={styles.errorAlert}
      />
    );
  }

  if (!data?.article) {
    return <Alert message="Article not found" type="warning" showIcon className={styles.errorAlert} />;
  }

  const currentArticle = data.article;
  const isAuthor =
    isAuthenticated &&
    currentUser?.username &&
    currentArticle?.author?.username &&
    currentUser.username === currentArticle.author.username;

  return (
    <div className={styles.container}>
      <div>
        <div className={styles.title}>
          {currentArticle.title}
          <div className={styles.likes}>
            {data.article.favorited ? (
              <HeartFilled style={{ color: '#ff4d4f', fontSize: '14px' }} />
            ) : (
              <HeartTwoTone twoToneColor="#ccc" style={{ fontSize: '14px' }} />
            )}{' '}
            {currentArticle.favoritesCount}
          </div>
        </div>

        <div className={styles.profile}>
          <div>
            <p className={styles.userName}>{currentArticle.author.username}</p>
            <p className={styles.created}>{format(new Date(currentArticle.createdAt), 'MMMM d, yyyy')}</p>
          </div>
          {currentArticle.author.image && (
            <img
              src={currentArticle.author.image}
              alt={`${currentArticle.author.username}'s profile`}
              className={styles.profileImage}
            />
          )}
        </div>
      </div>
      {isAuthor && (
        <div className={styles.authorButtons}>
          <Popconfirm
            okText="Yes"
            cancelText="No"
            onConfirm={handleDelete}
            title="Are you sure to delete this article?"
            placement="bottom"
          >
            <Button danger className={styles.deleteButton}>
              Delete
            </Button>
          </Popconfirm>
          <Button onClick={handleEdit} className={styles.editButton}>
            Edit
          </Button>
        </div>
      )}
      <div className={styles.tags}>
        {currentArticle.tagList.map((tag, index) => (
          <span key={index} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.description}>{currentArticle.description}</div>
      <div className={styles.markdownContent}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentArticle.body}</ReactMarkdown>
      </div>
    </div>
  );
}
