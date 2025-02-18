module.exports = (sequelize, Sequelize) => {
  const Notification = sequelize.define("Notification", {
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    type: {
      type: Sequelize.ENUM('appointment', 'message', 'system'),
      allowNull: false
    },
    related_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '相关记录ID，如预约ID、消息ID等'
    },
    is_read: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['is_read']
      }
    ]
  });

  return Notification;
}; 