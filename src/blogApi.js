import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://blog-platform.kata.academy/api',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('Authorization', `Token ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Article', 'Articles'],
  endpoints: (builder) => ({
    getArticles: builder.query({
      query: ({ page = 1, limit = 5 }) => ({
        url: '/articles',
        params: {
          offset: (page - 1) * limit,
          limit,
        },
      }),
      transformResponse: (response, meta, arg) => ({
        articles: response.articles,
        total: response.articlesCount,
        currentPage: arg.page,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.articles.map((article) => ({ type: 'Article', id: article.slug })),
              { type: 'Articles', id: 'LIST' },
            ]
          : [{ type: 'Articles', id: 'LIST' }],
    }),

    getArticleBySlug: builder.query({
      query: (slug) => `/articles/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Article', id: slug }],
    }),

    favoriteArticle: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}/favorite`,
        method: 'POST',
      }),
      invalidatesTags: (_, __, slug) => [{ type: 'Article', id: slug }],
    }),

    unfavoriteArticle: builder.mutation({
      query: (slug) => ({
        url: `articles/${slug}/favorite`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, slug) => [{ type: 'Article', id: slug }],
    }),

    signUp: builder.mutation({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    signIn: builder.mutation({
      query: (userData) => ({
        url: '/users/login',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['CurrentUser'],
    }),

    getCurrentUser: builder.query({
      query: () => ({
        url: '/user',
        method: 'GET',
      }),
      providesTags: ['CurrentUser'],
      transformResponse: (response) => response.user,
    }),

    updateCurrentUser: builder.mutation({
      query: (userData) => ({
        url: '/user',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['CurrentUser'],
      transformResponse: (response) => response.user,
    }),

    createArticle: builder.mutation({
      query: (articleData) => ({
        url: '/articles',
        method: 'POST',
        body: articleData,
      }),
      invalidatesTags: [{ type: 'Articles', id: 'LIST' }],
    }),

    updateArticle: builder.mutation({
      query: ({ slug, article }) => ({
        url: `/articles/${slug}`,
        method: 'PUT',
        body: { article },
      }),
      invalidatesTags: (result, error, { slug }) => [
        { type: 'Article', id: slug },
        { type: 'Articles', id: 'LIST' },
      ],
    }),

    deleteArticle: builder.mutation({
      query: (slug) => ({
        url: `/articles/${slug}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Articles'],
    }),
  }),
});

export const {
  baseQuery,
  useDeleteArticleMutation,
  useUpdateArticleMutation,
  useCreateArticleMutation,
  useFavoriteArticleMutation,
  useUnfavoriteArticleMutation,
  useGetArticlesQuery,
  useGetArticleBySlugQuery,
  useSignUpMutation,
  useSignInMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} = blogApi;
