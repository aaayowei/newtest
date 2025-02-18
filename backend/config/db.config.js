module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "12345678",
  DB: "psychological_counseling",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  development: {
    username: "root",
    password: "12345678",
    database: "psychological_counseling",
    host: "localhost",
    dialect: "mysql",
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    seederStorage: "sequelize",
    seederStorageTableName: "SequelizeData"
  }
}; 