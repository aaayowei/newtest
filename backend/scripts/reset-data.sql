SET FOREIGN_KEY_CHECKS=0;
TRUNCATE TABLE appointments;
TRUNCATE TABLE counselor_schedules;
TRUNCATE TABLE counselors;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS=1;

-- 插入用户数据
INSERT INTO users (id, username, password, user_type, real_name, email, phone, status, created_at, updated_at) VALUES
(1, 'counselor1', '123456', 'counselor', '张医生', 'counselor1@example.com', '13800000001', 1, NOW(), NOW()),
(2, 'counselor2', '123456', 'counselor', '李医生', 'counselor2@example.com', '13800000002', 1, NOW(), NOW()),
(3, 'counselor3', '123456', 'counselor', '王医生', 'counselor3@example.com', '13800000003', 1, NOW(), NOW()),
(101, 'student1', '123456', 'student', '张同学', 'student1@example.com', '13900000001', 1, NOW(), NOW()),
(102, 'student2', '123456', 'student', '李同学', 'student2@example.com', '13900000002', 1, NOW(), NOW());

-- 插入咨询师数据
INSERT INTO counselors (id, user_id, title, avatar, expertise, introduction, education, consultation_count, rating, satisfaction_rate, status, created_at, updated_at) VALUES
(1, 1, '高级心理咨询师', '/avatars/counselor1.jpg', '情感咨询,压力管理', '从事心理咨询工作10年，擅长处理情感问题、压力管理等方面的咨询。', '北京大学心理学博士,中国心理学会注册心理师', 50, 4.8, 95, 'available', NOW(), NOW()),
(2, 2, '资深心理咨询师', '/avatars/counselor2.jpg', '学业压力,生涯规划', '专注于学生心理健康辅导，帮助学生解决学习压力和职业规划问题。', '清华大学应用心理学硕士,国家二级心理咨询师', 30, 4.5, 92, 'available', NOW(), NOW()),
(3, 3, '心理治疗师', '/avatars/counselor3.jpg', '人际关系,自我认知', '擅长处理人际关系问题，帮助来访者提升自我认知和社交能力。', '中科院心理研究所硕士,美国心理协会会员', 40, 4.7, 94, 'available', NOW(), NOW());

-- 插入咨询师排班数据（未来7天）
INSERT INTO counselor_schedules (counselor_id, date, time_slot, status, created_at, updated_at)
SELECT 
  c.id as counselor_id,
  DATE_ADD(CURDATE(), INTERVAL n.num DAY) as date,
  t.time_slot,
  'available' as status,
  NOW() as created_at,
  NOW() as updated_at
FROM counselors c
CROSS JOIN (
  SELECT 0 as num UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
  UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) n
CROSS JOIN (
  SELECT '09:00-10:00' as time_slot UNION
  SELECT '10:00-11:00' UNION
  SELECT '14:00-15:00' UNION
  SELECT '15:00-16:00' UNION
  SELECT '16:00-17:00'
) t
WHERE DAYOFWEEK(DATE_ADD(CURDATE(), INTERVAL n.num DAY)) NOT IN (1, 7);

-- 插入一些预约记录
INSERT INTO appointments (student_id, counselor_id, schedule_id, appointment_date, time_slot, duration, type, status, description, is_anonymous, rating, feedback, created_at, updated_at) VALUES
(101, 1, 1, CURDATE(), '09:00-10:00', 50, 'online', 'completed', '最近学习压力很大，想和咨询师聊聊。', 0, 5, '咨询很有帮助，老师很专业！', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(102, 2, 6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00-11:00', 50, 'offline', 'confirmed', '想讨论一下职业规划的问题。', 0, NULL, NULL, NOW(), NOW()); 