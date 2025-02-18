-- 修改 assessment_type 字段
ALTER TABLE assessment_questions MODIFY COLUMN assessment_type ENUM('anxiety', 'depression', 'personality', 'other') NOT NULL;

-- 修改 options 字段
ALTER TABLE assessment_questions MODIFY COLUMN options JSON NOT NULL COMMENT '选项及其描述';

-- 修改 score_rules 字段
ALTER TABLE assessment_questions MODIFY COLUMN score_rules JSON NOT NULL COMMENT '计分规则';

-- 添加 order 字段（如果不存在）
ALTER TABLE assessment_questions ADD COLUMN IF NOT EXISTS `order` INT NOT NULL DEFAULT 0 COMMENT '题目顺序'; 