module.exports = (sequelize, Sequelize) => {
  const Appointment = sequelize.define("Appointment", {
    student_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    counselor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    schedule_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'CounselorSchedules',
        key: 'id'
      }
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 50,
      comment: '咨询时长（分钟）'
    },
    type: {
      type: Sequelize.ENUM('online', 'offline'),
      allowNull: false
    },
    online_meeting_url: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '线上咨询会议链接'
    },
    room_number: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '线下咨询房间号'
    },
    status: {
      type: Sequelize.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '咨询问题描述'
    },
    is_anonymous: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: '是否匿名咨询'
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '咨询记录'
    },
    feedback: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: '咨询反馈'
    },
    rating: {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: '评分（1-5）'
    },
    cancel_reason: {
      type: Sequelize.STRING,
      allowNull: true,
      comment: '取消原因'
    },
    cancelled_by: {
      type: Sequelize.ENUM('student', 'counselor', 'system'),
      allowNull: true,
      comment: '取消人'
    },
    cancelled_at: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: '取消时间'
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Appointment;
}; 