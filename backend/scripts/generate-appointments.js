const fs = require('fs');
const moment = require('moment');

// 生成随机预约数据
function generateAppointments() {
  const appointments = [];
  const statuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  const types = ['online', 'offline'];
  const descriptions = [
    '我最近感到很焦虑，想和咨询师聊聊。',
    '学习压力很大，需要一些建议。',
    '和室友相处有些问题，希望得到帮助。',
    '对未来感到迷茫，想讨论职业规划。',
    '最近睡眠质量不好，影响到学习。'
  ];
  const cancelReasons = [
    '临时有事无法参加',
    '身体不适需要休息',
    '与其他安排冲突',
    '个人原因取消'
  ];

  // 为每个学生生成2-3个预约记录
  for (let studentId = 201; studentId <= 210; studentId++) {
    const appointmentCount = 2 + Math.floor(Math.random() * 2); // 2-3个预约
    
    for (let i = 0; i < appointmentCount; i++) {
      const counselorId = 1 + Math.floor(Math.random() * 20); // 随机咨询师1-20
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const description = descriptions[Math.floor(Math.random() * descriptions.length)];
      const isAnonymous = Math.random() < 0.3; // 30%概率匿名
      
      // 生成预约时间（最近30天内）
      const daysAgo = Math.floor(Math.random() * 30);
      const appointmentDate = moment().subtract(daysAgo, 'days').format('YYYY-MM-DD');
      const timeSlots = ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
      const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
      
      // 生成创建时间（预约时间前1-7天）
      const createdAt = moment(appointmentDate).subtract(1 + Math.floor(Math.random() * 7), 'days').format('YYYY-MM-DD HH:mm:ss');
      const updatedAt = createdAt;

      // 如果是已完成状态，添加评分和反馈
      let rating = null;
      let feedback = null;
      if (status === 'completed') {
        rating = 3 + Math.floor(Math.random() * 3); // 3-5分
        feedback = '咨询很有帮助，感谢咨询师的建议。';
      }

      // 如果是已取消状态，添加取消原因
      let cancelReason = null;
      let cancelledBy = null;
      let cancelledAt = null;
      if (status === 'cancelled') {
        cancelReason = cancelReasons[Math.floor(Math.random() * cancelReasons.length)];
        cancelledBy = Math.random() < 0.7 ? 'student' : 'counselor'; // 70%由学生取消
        cancelledAt = moment(appointmentDate).subtract(1, 'days').format('YYYY-MM-DD HH:mm:ss');
      }

      // 查找对应的schedule_id
      const scheduleId = (counselorId - 1) * 50 + (Math.floor(Math.random() * 50) + 1);

      const appointment = {
        student_id: studentId,
        counselor_id: counselorId,
        schedule_id: scheduleId,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        duration: 50,
        type,
        status,
        description,
        is_anonymous: isAnonymous,
        rating,
        feedback,
        cancel_reason: cancelReason,
        cancelled_by: cancelledBy,
        cancelled_at: cancelledAt,
        created_at: createdAt,
        updated_at: updatedAt,
        online_meeting_url: type === 'online' ? 'https://meeting.example.com/room-' + Math.random().toString(36).substring(7) : null,
        room_number: type === 'offline' ? '心理咨询室' + (Math.floor(Math.random() * 5) + 1) : null
      };

      appointments.push(appointment);
    }
  }

  return appointments;
}

// 生成SQL语句
function generateSQL() {
  const appointments = generateAppointments();
  let sql = '-- 生成预约测试数据\n';
  
  // 添加预约记录
  appointments.forEach((appointment, index) => {
    sql += `INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      ${appointment.student_id},
      ${appointment.counselor_id},
      ${appointment.schedule_id},
      '${appointment.appointment_date}',
      '${appointment.time_slot}',
      ${appointment.duration},
      '${appointment.type}',
      '${appointment.status}',
      '${appointment.description}',
      ${appointment.is_anonymous ? 1 : 0},
      ${appointment.rating ? appointment.rating : 'NULL'},
      ${appointment.feedback ? `'${appointment.feedback}'` : 'NULL'},
      ${appointment.cancel_reason ? `'${appointment.cancel_reason}'` : 'NULL'},
      ${appointment.cancelled_by ? `'${appointment.cancelled_by}'` : 'NULL'},
      ${appointment.cancelled_at ? `'${appointment.cancelled_at}'` : 'NULL'},
      '${appointment.created_at}',
      '${appointment.updated_at}',
      ${appointment.online_meeting_url ? `'${appointment.online_meeting_url}'` : 'NULL'},
      ${appointment.room_number ? `'${appointment.room_number}'` : 'NULL'}
    );\n`;
  });

  // 更新咨询师的咨询次数和评分
  sql += '\n-- 更新咨询师统计数据\n';
  sql += `UPDATE counselors c 
    SET consultation_count = (
      SELECT COUNT(*) 
      FROM appointments a 
      WHERE a.counselor_id = c.id
    ),
    rating = (
      SELECT COALESCE(AVG(rating), c.rating)
      FROM appointments a 
      WHERE a.counselor_id = c.id 
      AND a.rating IS NOT NULL
    );\n`;

  return sql;
}

// 保存SQL文件
const sql = generateSQL();
fs.writeFileSync(path.join(__dirname, 'generated-appointments.sql'), sql);
console.log('生成的SQL文件已保存到 generated-appointments.sql'); 