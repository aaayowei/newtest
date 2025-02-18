-- 插入咨询师排班数据
INSERT INTO counselor_schedules (counselor_id, date, time_slot, status, created_at, updated_at)
VALUES 
(2, '2024-03-20', '09:00-10:00', 'booked', NOW(), NOW()),
(2, '2024-03-20', '10:00-11:00', 'booked', NOW(), NOW()),
(2, '2024-03-20', '14:00-15:00', 'available', NOW(), NOW()),
(2, '2024-03-21', '09:00-10:00', 'available', NOW(), NOW()),
(3, '2024-03-20', '09:00-10:00', 'booked', NOW(), NOW()),
(3, '2024-03-20', '14:00-15:00', 'available', NOW(), NOW());

-- 插入预约数据（包含评价）
INSERT INTO appointments (student_id, counselor_id, schedule_id, type, status, description, is_anonymous, rating, feedback, created_at, updated_at)
VALUES 
-- 已完成的预约（带评价）
(4, 2, 1, 'online', 'completed', '学习压力问题咨询', false, 5, '咨询师很专业，帮助我找到了问题的根源，并提供了实用的建议。', NOW() - INTERVAL '5 day', NOW()),
(5, 2, 2, 'offline', 'completed', '人际关系困扰', true, 4, '咨询过程很愉快，获得了很多启发。', NOW() - INTERVAL '3 day', NOW()),
(4, 3, 5, 'online', 'completed', '职业规划咨询', false, 5, '非常感谢咨询师的耐心指导，让我对未来的职业方向更清晰了。', NOW() - INTERVAL '2 day', NOW()),

-- 待确认的预约
(5, 2, 3, 'online', 'pending', '学业问题咨询', false, NULL, NULL, NOW(), NOW()),
(4, 3, 6, 'offline', 'pending', '压力管理咨询', false, NULL, NULL, NOW(), NOW()); 