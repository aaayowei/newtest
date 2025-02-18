const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const socketConfig = require("./config/socket.config");
const SocketService = require("./services/socket.service");
const path = require('path');
const routes = require('./routes');
// 导入预约状态更新服务
const appointmentService = require('./services/appointment.service');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, socketConfig.options);

// 初始化WebSocket服务
const socketService = new SocketService(io);

// CORS配置
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

// 解析请求
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/avatars', express.static(path.join(__dirname, 'public/avatars')));
app.use('/api/articles', express.static(path.join(__dirname, 'public/articles')));

// API 路由
app.use('/api', routes);

// 处理 404 错误
app.use((req, res, next) => {
  res.status(404).json({
    message: "找不到请求的资源"
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "服务器内部错误",
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 数据库同步
const db = require("./models");
db.sequelize.sync()
  .then(() => {
    console.log('数据库同步成功');
  })
  .catch((err) => {
    console.error('数据库同步失败:', err);
  });

// 启动服务器
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
  // 初始化预约状态更新服务
  console.log('初始化预约状态更新服务...');
}); 