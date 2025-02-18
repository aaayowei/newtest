module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define("Message", {
    sender_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    receiver_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    appointment_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'appointments',
        key: 'id'
      }
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
      comment: '加密后的消息内容'
    },
    encryption_key: {
      type: Sequelize.STRING,
      allowNull: false,
      comment: '消息加密密钥'
    },
    type: {
      type: Sequelize.ENUM('text', 'image', 'file'),
      allowNull: false,
      defaultValue: 'text'
    },
    status: {
      type: Sequelize.ENUM('sent', 'delivered', 'read'),
      allowNull: false,
      defaultValue: 'sent'
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        fields: ['sender_id']
      },
      {
        fields: ['receiver_id']
      },
      {
        fields: ['appointment_id']
      }
    ]
  });

  return Message;
}; 