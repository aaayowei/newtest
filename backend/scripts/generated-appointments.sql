-- 生成预约测试数据
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      5,
      1,
      614,
      '2024-12-04',
      '09:00-10:00',
      50,
      'offline',
      'confirmed',
      '最近睡眠质量不好，影响到学习。',
      1,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-11-29 00:00:00',
      '2024-11-29 00:00:00',
      NULL,
      '心理咨询室5'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      201,
      12,
      589,
      '2024-12-09',
      '16:00-17:00',
      50,
      'offline',
      'cancelled',
      '和室友相处有些问题，希望得到帮助。',
      0,
      NULL,
      NULL,
      '身体不适需要休息',
      'student',
      '2024-12-08 00:00:00',
      '2024-12-08 00:00:00',
      '2024-12-08 00:00:00',
      NULL,
      '心理咨询室4'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      201,
      18,
      869,
      '2024-12-29',
      '09:00-10:00',
      50,
      'online',
      'completed',
      '我最近感到很焦虑，想和咨询师聊聊。',
      1,
      5,
      '咨询很有帮助，感谢咨询师的建议。',
      NULL,
      NULL,
      NULL,
      '2024-12-24 00:00:00',
      '2024-12-24 00:00:00',
      'https://meeting.example.com/room-b16rv8',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      202,
      12,
      569,
      '2024-12-11',
      '15:00-16:00',
      50,
      'offline',
      'cancelled',
      '对未来感到迷茫，想讨论职业规划。',
      1,
      NULL,
      NULL,
      '个人原因取消',
      'student',
      '2024-12-10 00:00:00',
      '2024-12-05 00:00:00',
      '2024-12-05 00:00:00',
      NULL,
      '心理咨询室5'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      202,
      12,
      574,
      '2024-12-11',
      '10:00-11:00',
      50,
      'offline',
      'confirmed',
      '和室友相处有些问题，希望得到帮助。',
      0,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-12-05 00:00:00',
      '2024-12-05 00:00:00',
      NULL,
      '心理咨询室4'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      203,
      1,
      3,
      '2024-12-06',
      '15:00-16:00',
      50,
      'online',
      'cancelled',
      '对未来感到迷茫，想讨论职业规划。',
      0,
      NULL,
      NULL,
      '临时有事无法参加',
      'counselor',
      '2024-12-05 00:00:00',
      '2024-11-29 00:00:00',
      '2024-11-29 00:00:00',
      'https://meeting.example.com/room-yg05mp',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      203,
      6,
      279,
      '2024-12-21',
      '09:00-10:00',
      50,
      'offline',
      'confirmed',
      '对未来感到迷茫，想讨论职业规划。',
      0,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-12-17 00:00:00',
      '2024-12-17 00:00:00',
      NULL,
      '心理咨询室3'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      204,
      18,
      897,
      '2024-12-29',
      '16:00-17:00',
      50,
      'online',
      'cancelled',
      '和室友相处有些问题，希望得到帮助。',
      0,
      NULL,
      NULL,
      '身体不适需要休息',
      'student',
      '2024-12-28 00:00:00',
      '2024-12-25 00:00:00',
      '2024-12-25 00:00:00',
      'https://meeting.example.com/room-tdljn',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      204,
      7,
      323,
      '2024-12-23',
      '10:00-11:00',
      50,
      'offline',
      'completed',
      '对未来感到迷茫，想讨论职业规划。',
      0,
      4,
      '咨询很有帮助，感谢咨询师的建议。',
      NULL,
      NULL,
      NULL,
      '2024-12-17 00:00:00',
      '2024-12-17 00:00:00',
      NULL,
      '心理咨询室3'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      204,
      5,
      249,
      '2024-12-22',
      '16:00-17:00',
      50,
      'offline',
      'completed',
      '我最近感到很焦虑，想和咨询师聊聊。',
      0,
      3,
      '咨询很有帮助，感谢咨询师的建议。',
      NULL,
      NULL,
      NULL,
      '2024-12-16 00:00:00',
      '2024-12-16 00:00:00',
      NULL,
      '心理咨询室4'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      205,
      5,
      238,
      '2024-12-16',
      '09:00-10:00',
      50,
      'online',
      'cancelled',
      '最近睡眠质量不好，影响到学习。',
      0,
      NULL,
      NULL,
      '与其他安排冲突',
      'counselor',
      '2024-12-15 00:00:00',
      '2024-12-10 00:00:00',
      '2024-12-10 00:00:00',
      'https://meeting.example.com/room-m2318',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      205,
      5,
      227,
      '2024-12-03',
      '14:00-15:00',
      50,
      'offline',
      'cancelled',
      '和室友相处有些问题，希望得到帮助。',
      0,
      NULL,
      NULL,
      '身体不适需要休息',
      'counselor',
      '2024-12-02 00:00:00',
      '2024-11-29 00:00:00',
      '2024-11-29 00:00:00',
      NULL,
      '心理咨询室5'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      206,
      5,
      217,
      '2024-12-11',
      '15:00-16:00',
      50,
      'offline',
      'confirmed',
      '我最近感到很焦虑，想和咨询师聊聊。',
      0,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-12-07 00:00:00',
      '2024-12-07 00:00:00',
      NULL,
      '心理咨询室5'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      206,
      16,
      759,
      '2024-12-11',
      '09:00-10:00',
      50,
      'offline',
      'completed',
      '最近睡眠质量不好，影响到学习。',
      0,
      3,
      '咨询很有帮助，感谢咨询师的建议。',
      NULL,
      NULL,
      NULL,
      '2024-12-07 00:00:00',
      '2024-12-07 00:00:00',
      NULL,
      '心理咨询室2'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      207,
      12,
      569,
      '2024-12-05',
      '15:00-16:00',
      50,
      'online',
      'confirmed',
      '最近睡眠质量不好，影响到学习。',
      0,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-11-30 00:00:00',
      '2024-11-30 00:00:00',
      'https://meeting.example.com/room-dgqkox',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      207,
      19,
      948,
      '2024-12-13',
      '16:00-17:00',
      50,
      'offline',
      'completed',
      '最近睡眠质量不好，影响到学习。',
      0,
      5,
      '咨询很有帮助，感谢咨询师的建议。',
      NULL,
      NULL,
      NULL,
      '2024-12-09 00:00:00',
      '2024-12-09 00:00:00',
      NULL,
      '心理咨询室1'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      207,
      12,
      575,
      '2024-12-10',
      '10:00-11:00',
      50,
      'online',
      'cancelled',
      '和室友相处有些问题，希望得到帮助。',
      0,
      NULL,
      NULL,
      '与其他安排冲突',
      'counselor',
      '2024-12-09 00:00:00',
      '2024-12-04 00:00:00',
      '2024-12-04 00:00:00',
      'https://meeting.example.com/room-czae23',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      208,
      16,
      799,
      '2024-12-13',
      '16:00-17:00',
      50,
      'online',
      'completed',
      '对未来感到迷茫，想讨论职业规划。',
      0,
      5,
      '咨询很有帮助，感谢咨询师的建议。',
      NULL,
      NULL,
      NULL,
      '2024-12-12 00:00:00',
      '2024-12-12 00:00:00',
      'https://meeting.example.com/room-h2qaus',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      208,
      1,
      44,
      '2024-12-11',
      '16:00-17:00',
      50,
      'offline',
      'pending',
      '和室友相处有些问题，希望得到帮助。',
      0,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-12-07 00:00:00',
      '2024-12-07 00:00:00',
      NULL,
      '心理咨询室4'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      208,
      7,
      315,
      '2024-12-05',
      '10:00-11:00',
      50,
      'offline',
      'pending',
      '我最近感到很焦虑，想和咨询师聊聊。',
      0,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-11-28 00:00:00',
      '2024-11-28 00:00:00',
      NULL,
      '心理咨询室2'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      209,
      15,
      743,
      '2024-12-08',
      '09:00-10:00',
      50,
      'online',
      'pending',
      '和室友相处有些问题，希望得到帮助。',
      0,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-12-05 00:00:00',
      '2024-12-05 00:00:00',
      'https://meeting.example.com/room-l4cf8s',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      209,
      14,
      696,
      '2024-12-16',
      '09:00-10:00',
      50,
      'offline',
      'cancelled',
      '对未来感到迷茫，想讨论职业规划。',
      0,
      NULL,
      NULL,
      '临时有事无法参加',
      'student',
      '2024-12-15 00:00:00',
      '2024-12-14 00:00:00',
      '2024-12-14 00:00:00',
      NULL,
      '心理咨询室1'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      210,
      18,
      857,
      '2024-12-11',
      '09:00-10:00',
      50,
      'online',
      'cancelled',
      '我最近感到很焦虑，想和咨询师聊聊。',
      0,
      NULL,
      NULL,
      '个人原因取消',
      'student',
      '2024-12-10 00:00:00',
      '2024-12-06 00:00:00',
      '2024-12-06 00:00:00',
      'https://meeting.example.com/room-mu8m8',
      NULL
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      210,
      8,
      357,
      '2024-12-21',
      '15:00-16:00',
      50,
      'offline',
      'completed',
      '我最近感到很焦虑，想和咨询师聊聊。',
      1,
      4,
      '咨询很有帮助，感谢咨询师的建议。',
      NULL,
      NULL,
      NULL,
      '2024-12-16 00:00:00',
      '2024-12-16 00:00:00',
      NULL,
      '心理咨询室1'
    );
INSERT INTO appointments (
      student_id, counselor_id, schedule_id, appointment_date, time_slot, 
      duration, type, status, description, is_anonymous, rating, feedback,
      cancel_reason, cancelled_by, cancelled_at, created_at, updated_at,
      online_meeting_url, room_number
    ) VALUES (
      210,
      5,
      245,
      '2024-12-18',
      '16:00-17:00',
      50,
      'offline',
      'pending',
      '对未来感到迷茫，想讨论职业规划。',
      0,
      NULL,
      NULL,
      NULL,
      NULL,
      NULL,
      '2024-12-12 00:00:00',
      '2024-12-12 00:00:00',
      NULL,
      '心理咨询室2'
    );

-- 更新咨询师统计数据
UPDATE counselors c 
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
    );
