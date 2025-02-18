import api from '@/plugins/axios';

class ArticleService {
  // 获取文章列表
  getArticles(params) {
    return api.get('/articles', { params });
  }

  // 获取文章详情
  getArticle(id) {
    return api.get(`/articles/${id}`);
  }

  // 创建文章
  createArticle(data) {
    return api.post('/articles', data);
  }

  // 更新文章
  updateArticle(id, data) {
    return api.put(`/articles/${id}`, data);
  }

  // 删除文章
  deleteArticle(id) {
    return api.delete(`/articles/${id}`);
  }

  // 收藏文章
  favoriteArticle(id) {
    return api.post(`/articles/${id}/favorite`);
  }

  // 取消收藏
  unfavoriteArticle(id) {
    return api.delete(`/articles/${id}/favorite`);
  }

  // 获取收藏的文章
  getFavorites(params) {
    return api.get('/articles/user/favorites', { params });
  }
}

export default new ArticleService(); 