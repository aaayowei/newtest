module.exports = (sequelize, Sequelize) => {
  const CounselorSchedule = sequelize.define("CounselorSchedule", {
    counselor_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Counselors',
        key: 'id'
      }
    },
    date: {
      type: Sequelize.DATEONLY,
      allowNull: false,
      comment: '日期'
    },
    time_slot: {
      type: Sequelize.STRING(20),
      allowNull: false,
      comment: '时间段'
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'available',
      comment: '状态：available-可用，booked-已预约，unavailable-不可用'
    }
  }, {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return CounselorSchedule;
}; 