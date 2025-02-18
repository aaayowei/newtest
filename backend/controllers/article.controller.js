'use strict';

const { Article, User, ArticleFavorite } = require('../models');
const { Op } = require('sequelize');

// 获取文章列表
exports.getArticles = async (req, res) => {
  try {
    console.log('getArticles called with query:', req.query);
    console.log('User info:', req.user);
    
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    
    // 根据用户角色和查询参数设置查询条件
    if (req.user) {
      if (req.user.user_type === 'student') {
        // 学生只能看到已发布的文章
        where.status = 'published';
        console.log('Student role: setting status to published');
      } else if (req.user.user_type === 'counselor') {
        console.log('Counselor role, includeOwn:', req.query.includeOwn);
        if (String(req.query.includeOwn).toLowerCase() === 'true') {
          // 咨询师在后台查看自己的所有文章（包括草稿和已发布）
          where.author_id = req.user.id;
          console.log('Counselor viewing own articles, author_id:', req.user.id);
        } else {
          // 在前台页面只能看到已发布的文章
          where.status = 'published';
          console.log('Counselor viewing published articles only');
        }
      } else if (req.user.user_type === 'admin') {
        console.log('Admin role, includeAll:', req.query.includeAll);
        if (String(req.query.includeAll).toLowerCase() === 'true') {
          // 管理员在后台可以看到所有文章
          console.log('Admin viewing all articles');
          // 如果有状态筛选，添加状态条件
          if (req.query.status) {
            where.status = req.query.status;
          }
        } else {
          // 在前台页面只看已发布的文章
          where.status = 'published';
          console.log('Admin viewing published articles only');
        }
      }
    } else {
      // 未登录用户只能看到已发布的文章
      where.status = 'published';
      console.log('Guest user: setting status to published');
    }
    
    if (category) {
      where.category = category;
      console.log('Added category filter:', category);
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
      console.log('Added search filter:', search);
    }

    // 如果是管理员且提供了作者筛选
    if (req.user?.user_type === 'admin' && req.query.author) {
      const author = await User.findOne({
        where: {
          [Op.or]: [
            { username: req.query.author },
            { real_name: req.query.author }
          ]
        }
      });
      if (author) {
        where.author_id = author.id;
      }
    }

    console.log('Final where clause:', JSON.stringify(where, null, 2));
    
    const { count, rows } = await Article.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'real_name']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 处理文章的额外信息
    const articles = await Promise.all(rows.map(async (article) => {
      const articleData = article.toJSON();
      articleData.isFavorited = false;
      articleData.isAuthor = req.user ? article.author_id === req.user.id : false;

      if (req.user) {
        // 检查是否收藏
        const favorite = await ArticleFavorite.findOne({
          where: {
            user_id: req.user.id,
            article_id: article.id
          }
        });
        articleData.isFavorited = !!favorite;
      }

      return articleData;
    }));

    const response = {
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      articles: articles
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in getArticles:', error);
    res.status(500).json({ 
      message: '获取文章列表失败',
      error: error.message 
    });
  }
};

// 获取文章详情
exports.getArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'real_name']
      }]
    });

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // 检查是否被当前用户收藏
    if (req.user) {
      const favorite = await ArticleFavorite.findOne({
        where: {
          user_id: req.user.id,
          article_id: article.id
        }
      });
      article.dataValues.isFavorited = !!favorite;
    }

    // 更新浏览次数
    await article.increment('view_count');

    res.json(article);
  } catch (error) {
    console.error('Error in getArticle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 创建文章（咨询师和管理员）
exports.createArticle = async (req, res) => {
  try {
    if (!['counselor', 'admin'].includes(req.user.user_type)) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const article = await Article.create({
      ...req.body,
      author_id: req.user.id,
      status: req.user.user_type === 'admin' ? 'published' : 'draft'
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Error in createArticle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 更新文章
exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // 检查权限
    if (req.user.user_type !== 'admin' && article.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await article.update(req.body);
    res.json(article);
  } catch (error) {
    console.error('Error in updateArticle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 删除文章
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // 检查权限
    if (req.user.user_type !== 'admin' && article.author_id !== req.user.id) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await article.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteArticle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 收藏文章
exports.favoriteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const [favorite, created] = await ArticleFavorite.findOrCreate({
      where: {
        user_id: userId,
        article_id: id
      }
    });

    // 更新文章的收藏数
    const favoriteCount = await ArticleFavorite.count({
      where: { article_id: id }
    });

    await article.update({ favorite_count: favoriteCount });

    res.json({ 
      message: created ? '收藏成功' : '已经收藏过了',
      isFavorited: true,
      favorite_count: favoriteCount
    });
  } catch (error) {
    console.error('Error in favoriteArticle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 取消收藏文章
exports.unfavoriteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await ArticleFavorite.destroy({
      where: {
        user_id: userId,
        article_id: id
      }
    });

    if (deleted) {
      // 更新文章的收藏数
      const favoriteCount = await ArticleFavorite.count({
        where: { article_id: id }
      });

      await Article.update(
        { favorite_count: favoriteCount },
        { where: { id } }
      );

      res.json({ 
        message: '取消收藏成功',
        isFavorited: false,
        favorite_count: favoriteCount
      });
    } else {
      res.status(404).json({ message: '未找到收藏记录' });
    }
  } catch (error) {
    console.error('Error in unfavoriteArticle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 获取用户收藏的文章
exports.getFavorites = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 先获取用户收藏的文章ID
    const favorites = await ArticleFavorite.findAll({
      where: { user_id: req.user.id },
      attributes: ['article_id']
    });

    const articleIds = favorites.map(f => f.article_id);

    // 然后查询这些文章的详细信息
    const { count, rows } = await Article.findAndCountAll({
      where: {
        id: articleIds
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'real_name']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    // 添加收藏标记
    rows.forEach(article => {
      article.dataValues.isFavorited = true;
    });

    res.json({
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      articles: rows
    });
  } catch (error) {
    console.error('Error in getFavorites:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// 上传文章封面
exports.uploadCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    // 返回文件路径
    const filePath = `/articles/${req.file.filename}`;
    res.json({
      message: '上传成功',
      url: filePath
    });
  } catch (error) {
    console.error('Error in uploadCover:', error);
    res.status(500).json({ 
      message: '文件上传失败',
      error: error.message 
    });
  }
};

// 上传文章内容图片
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的图片' });
    }

    // 返回文件路径
    const filePath = `/articles/${req.file.filename}`;
    res.json({
      url: filePath
    });
  } catch (error) {
    console.error('Error in uploadImage:', error);
    res.status(500).json({ 
      message: '图片上传失败',
      error: error.message 
    });
  }
}; 