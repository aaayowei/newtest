const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 按顺序导入模型
db.User = require("./user.model.js")(sequelize, Sequelize);
db.Student = require("./student.model.js")(sequelize, Sequelize);
db.Counselor = require("./counselor.model.js")(sequelize, Sequelize);
db.CounselorSchedule = require("./counselor_schedule.model.js")(sequelize, Sequelize);
db.Appointment = require("./appointment.model.js")(sequelize, Sequelize);
db.Article = require("./article.model.js")(sequelize, Sequelize);
db.AssessmentQuestion = require("./assessment_question.model.js")(sequelize, Sequelize);
db.Assessment = require("./assessment.model.js")(sequelize, Sequelize);
db.AssessmentAnswer = require("./assessment_answer.model.js")(sequelize, Sequelize);
db.Message = require("./message.model.js")(sequelize, Sequelize);
db.Notification = require("./notification.model.js")(sequelize, Sequelize);
db.ArticleFavorite = require("./article_favorite.model.js")(sequelize, Sequelize);

// 设置模型关联
// User - Student (一对一)
db.User.hasOne(db.Student, {
  foreignKey: 'user_id',
  as: 'student_profile'
});
db.Student.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User - Counselor (一对一)
db.User.hasOne(db.Counselor, {
  foreignKey: 'user_id',
  as: 'counselor_profile'
});
db.Counselor.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Counselor - CounselorSchedule (一对多)
db.Counselor.hasMany(db.CounselorSchedule, {
  foreignKey: 'counselor_id',
  as: 'schedules'
});
db.CounselorSchedule.belongsTo(db.Counselor, {
  foreignKey: 'counselor_id',
  as: 'counselor'
});

// Appointment 关联
db.User.hasMany(db.Appointment, {
  foreignKey: 'student_id',
  as: 'student_appointments'
});
db.Appointment.belongsTo(db.User, {
  foreignKey: 'student_id',
  as: 'student'
});

db.User.hasMany(db.Appointment, {
  foreignKey: 'counselor_id',
  as: 'counselor_appointments'
});
db.Appointment.belongsTo(db.User, {
  foreignKey: 'counselor_id',
  as: 'counselor'
});

db.CounselorSchedule.hasOne(db.Appointment, {
  foreignKey: 'schedule_id',
  as: 'appointment'
});
db.Appointment.belongsTo(db.CounselorSchedule, {
  foreignKey: 'schedule_id',
  as: 'schedule'
});

// Article 关联
db.User.hasMany(db.Article, {
  foreignKey: 'author_id',
  as: 'articles'
});
db.Article.belongsTo(db.User, {
  foreignKey: 'author_id',
  as: 'author'
});

// Assessment 关联
db.User.hasMany(db.Assessment, {
  foreignKey: 'user_id',
  as: 'assessments'
});
db.Assessment.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});

db.Assessment.hasMany(db.AssessmentAnswer, {
  foreignKey: 'assessment_id',
  as: 'answers'
});
db.AssessmentAnswer.belongsTo(db.Assessment, {
  foreignKey: 'assessment_id',
  as: 'assessment'
});

db.AssessmentQuestion.hasMany(db.AssessmentAnswer, {
  foreignKey: 'question_id',
  as: 'answers'
});
db.AssessmentAnswer.belongsTo(db.AssessmentQuestion, {
  foreignKey: 'question_id',
  as: 'question'
});

// Message 关联
db.User.hasMany(db.Message, {
  foreignKey: 'sender_id',
  as: 'sent_messages'
});
db.Message.belongsTo(db.User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

db.User.hasMany(db.Message, {
  foreignKey: 'receiver_id',
  as: 'received_messages'
});
db.Message.belongsTo(db.User, {
  foreignKey: 'receiver_id',
  as: 'receiver'
});

db.Appointment.hasMany(db.Message, {
  foreignKey: 'appointment_id',
  as: 'messages'
});
db.Message.belongsTo(db.Appointment, {
  foreignKey: 'appointment_id',
  as: 'appointment'
});

// Notification 关联
db.User.hasMany(db.Notification, {
  foreignKey: 'user_id',
  as: 'notifications'
});
db.Notification.belongsTo(db.User, {
  foreignKey: 'user_id',
  as: 'user'
});

// 添加文章与收藏的关联关系
db.Article.belongsToMany(db.User, {
  through: 'article_favorites',
  foreignKey: 'article_id',
  otherKey: 'user_id',
  as: 'favoritedBy'
});

db.User.belongsToMany(db.Article, {
  through: 'article_favorites',
  foreignKey: 'user_id',
  otherKey: 'article_id',
  as: 'favoriteArticles'
});

module.exports = db; 