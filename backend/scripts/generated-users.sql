
-- 插入用户数据
INSERT INTO users (id, username, password, email, real_name, user_type, phone, status, created_at, updated_at) VALUES
(111, 'counselor11', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor11@example.com', '咨询师11', 'counselor', '13800000101', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(112, 'counselor12', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor12@example.com', '咨询师12', 'counselor', '13800000102', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(113, 'counselor13', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor13@example.com', '咨询师13', 'counselor', '13800000103', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(114, 'counselor14', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor14@example.com', '咨询师14', 'counselor', '13800000104', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(115, 'counselor15', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor15@example.com', '咨询师15', 'counselor', '13800000105', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(116, 'counselor16', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor16@example.com', '咨询师16', 'counselor', '13800000106', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(117, 'counselor17', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor17@example.com', '咨询师17', 'counselor', '13800000107', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(118, 'counselor18', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor18@example.com', '咨询师18', 'counselor', '13800000108', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(119, 'counselor19', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor19@example.com', '咨询师19', 'counselor', '13800000109', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(120, 'counselor20', '$2b$10$YqHhgQxlGWMO4AJFBxVXZOVBFy3YJtZEYyHZJB3q4Z1Yx9Qz1yHxO', 'counselor20@example.com', '咨询师10', 'counselor', '13800000110', 1, '2024-12-29 16:11:39', '2024-12-29 16:11:39');

-- 插入咨询师数据
INSERT INTO counselors (id, user_id, title, expertise, introduction, avatar, rating, consultation_count, satisfaction_rate, status, created_at, updated_at) VALUES
(11, 111, '资深心理咨询师', '人际关系,情感问题', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor2.jpg', 4.8, 31, 92, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(12, 112, '资深心理咨询师', '人际关系,情感问题', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor3.jpg', 4.5, 37, 88, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(13, 113, '心理治疗师', '人际关系,情感问题', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor4.jpg', 4.6, 16, 93, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(14, 114, '资深心理咨询师', '抑郁症,焦虑症', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor5.jpg', 3.3, 63, 88, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(15, 115, '心理咨询师', '生涯规划,心理健康', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor1.jpg', 2.6, 90, 90, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(16, 116, '资深心理咨询师', '生涯规划,心理健康', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor2.jpg', 4.9, 92, 91, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(17, 117, '临床心理学家', '人际关系,情感问题', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor3.jpg', 3.9, 18, 96, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(18, 118, '高级心理咨询师', '学业压力,自我认知', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor4.jpg', 4.8, 76, 95, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(19, 119, '临床心理学家', '抑郁症,焦虑症', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor5.jpg', 3.5, 71, 92, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39'),
(20, 120, '心理治疗师', '人际关系,情感问题', '我是一名专业的心理咨询师，有着丰富的咨询经验。', '/avatars/counselor1.jpg', 4.5, 52, 89, 'available', '2024-12-29 16:11:39', '2024-12-29 16:11:39');
