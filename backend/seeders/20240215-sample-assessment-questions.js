'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 焦虑自评量表（SAS）标准题目
    const anxietyQuestions = [
      {
        assessment_type: 'anxiety',
        question: '我感到比平常更紧张和焦虑',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我无缘无故地感到害怕',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我容易心里烦乱或感到惊慌',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我感觉容易心跳加快',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我无缘无故感到疲劳',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我手脚发麻和麻木',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我因胃痛和消化不良而苦恼',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我常常要小便',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 8,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我感到面部潮红',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 9,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我容易出汗',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我因头痛、颈痛和背痛而苦恼',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 11,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我感觉精力充沛，坐立不安',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 12,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我感到手脚发抖和颤动',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 13,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我感到呼吸困难或气短',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 14,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我手脚麻木和刺痛',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我因胃部不适或消化不良而烦恼',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 16,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我经常要排尿',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 17,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我的手常常是干燥温暖的',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 18,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我感到脸发热',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 19,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'anxiety',
        question: '我容易入睡并且一夜睡得很好',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 20,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // 抑郁自评量表（SDS）标准题目
    const depressionQuestions = [
      {
        assessment_type: 'depression',
        question: '我感到情绪沮丧，郁闷',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得一天中早晨最好',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我常常哭或想哭',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我晚上睡眠不好',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我的胃口和以前一样好',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得做事情很困难',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我对未来抱有希望',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我比平常容易激动',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 8,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得做决定是容易的',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 9,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得自己是个有用的人，有人需要我',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我的生活过得很有意思',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 11,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得别人想要伤害我',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 12,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得生活没有希望',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 13,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我仍然喜欢自己曾经喜欢做的事',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 14,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得心烦意乱',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得容易受到别人的影响',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 16,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得身体状况良好',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 17,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得比以前容易疲劳',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 1,
          B: 2,
          C: 3,
          D: 4
        }),
        order: 18,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我对异性仍然感兴趣',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 19,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'depression',
        question: '我觉得生活充实',
        options: JSON.stringify({
          A: '很少或从来没有',
          B: '有时',
          C: '经常',
          D: '总是如此'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 20,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    // 人格特质测评题目
    const personalityQuestions = [
      {
        assessment_type: 'personality',
        question: '在社交场合中，我倾向于',
        options: JSON.stringify({
          A: '主动与他人交谈',
          B: '等待他人来与我交谈',
          C: '保持适度的社交',
          D: '避免社交互动'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 2,
          C: 3,
          D: 1
        }),
        order: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '面对新的工作任务时，我通常',
        options: JSON.stringify({
          A: '立即开始行动',
          B: '仔细规划后再开始',
          C: '等待他人指导',
          D: '感到焦虑和犹豫'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 2,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在团队合作中，我更喜欢',
        options: JSON.stringify({
          A: '担任领导角色',
          B: '积极参与讨论',
          C: '配合他人工作',
          D: '独立完成任务'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '遇到困难时，我通常会',
        options: JSON.stringify({
          A: '积极寻求解决方案',
          B: '寻求他人帮助',
          C: '等待问题自行解决',
          D: '回避问题'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 4,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在做决定时，我倾向于',
        options: JSON.stringify({
          A: '快速果断',
          B: '权衡利弊后决定',
          C: '征求他人意见',
          D: '推迟决定'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 5,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在处理压力时，我通常',
        options: JSON.stringify({
          A: '积极面对并寻找解决方案',
          B: '与他人分享并寻求支持',
          C: '尝试转移注意力',
          D: '感到不知所措'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 6,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '对于新的环境或变化，我',
        options: JSON.stringify({
          A: '感到兴奋并期待',
          B: '保持开放和适应的态度',
          C: '需要时间适应',
          D: '感到不安和抗拒'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 7,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在与他人交流时，我倾向于',
        options: JSON.stringify({
          A: '直接表达自己的想法',
          B: '考虑他人感受后再表达',
          C: '倾听多于表达',
          D: '避免表达个人观点'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 8,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '面对批评时，我通常会',
        options: JSON.stringify({
          A: '客观分析并积极改进',
          B: '认真听取并思考',
          C: '感到沮丧但会调整',
          D: '产生强烈的负面情绪'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 9,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在完成任务时，我更注重',
        options: JSON.stringify({
          A: '效率和结果',
          B: '质量和细节',
          C: '按部就班',
          D: '随遇而安'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在休闲时间，我喜欢',
        options: JSON.stringify({
          A: '参加社交活动',
          B: '进行户外运动',
          C: '独处和放松',
          D: '无所事事'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 11,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '对于规则和制度，我',
        options: JSON.stringify({
          A: '严格遵守并维护',
          B: '理解并配合执行',
          C: '被动接受',
          D: '经常质疑和抵触'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 12,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在团队中，我通常',
        options: JSON.stringify({
          A: '主动承担责任',
          B: '积极配合他人',
          C: '完成分配的任务',
          D: '较少参与互动'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 13,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '对于未来，我',
        options: JSON.stringify({
          A: '有明确的规划和目标',
          B: '保持乐观和期待',
          C: '随遇而安',
          D: '感到迷茫和担忧'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 14,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在学习新知识时，我倾向于',
        options: JSON.stringify({
          A: '主动探索和实践',
          B: '系统学习和总结',
          C: '跟随他人的步伐',
          D: '被动接受'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 15,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在处理矛盾时，我通常',
        options: JSON.stringify({
          A: '直面问题寻求解决',
          B: '寻求调解和共识',
          C: '选择妥协',
          D: '逃避或忽视'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 16,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '对于他人的情绪，我',
        options: JSON.stringify({
          A: '能敏锐察觉并积极回应',
          B: '试图理解和关心',
          C: '注意到但不确定如何回应',
          D: '较少关注'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 17,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在做重要决定时，我会',
        options: JSON.stringify({
          A: '全面分析后果断决定',
          B: '谨慎权衡后做出选择',
          C: '参考他人意见',
          D: '犹豫不决'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 18,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '对于生活中的挫折，我',
        options: JSON.stringify({
          A: '视为成长的机会',
          B: '努力克服和调整',
          C: '需要时间恢复',
          D: '难以承受'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 19,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在表达情感时，我',
        options: JSON.stringify({
          A: '自然流露且直接',
          B: '适度表达',
          C: '含蓄委婉',
          D: '难以表达'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 20,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '面对竞争时，我通常',
        options: JSON.stringify({
          A: '全力以赴争取胜利',
          B: '保持良性竞争',
          C: '随遇而安',
          D: '尽量回避'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 21,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在时间管理上，我',
        options: JSON.stringify({
          A: '计划周密且严格执行',
          B: '有计划但保持灵活',
          C: '随性但基本按时',
          D: '经常拖延'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 22,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '对于新的观点和想法，我',
        options: JSON.stringify({
          A: '积极接纳并尝试',
          B: '保持开放和思考',
          C: '持保留态度',
          D: '倾向于排斥'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 23,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在人际交往中，我注重',
        options: JSON.stringify({
          A: '建立广泛的社交网络',
          B: '维护稳定的关系',
          C: '保持适度的距离',
          D: '最小化社交活动'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 24,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '对于自己的缺点，我',
        options: JSON.stringify({
          A: '积极面对并改进',
          B: '承认并努力改善',
          C: '知道但较少改变',
          D: '回避或否认'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 25,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在工作或学习中，我追求',
        options: JSON.stringify({
          A: '卓越和创新',
          B: '稳定和进步',
          C: '达到基本要求',
          D: '完成即可'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 26,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '面对压力和挑战时，我的精力',
        options: JSON.stringify({
          A: '会显著提升',
          B: '保持稳定',
          C: '略有下降',
          D: '明显减退'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 27,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在团队讨论中，我通常',
        options: JSON.stringify({
          A: '主导话题和方向',
          B: '积极参与讨论',
          C: '适时发表意见',
          D: '很少发言'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 28,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '对于生活中的不确定性，我',
        options: JSON.stringify({
          A: '视为机遇和挑战',
          B: '保持积极应对',
          C: '感到些许不安',
          D: '非常担忧'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 29,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        assessment_type: 'personality',
        question: '在实现目标的过程中，我',
        options: JSON.stringify({
          A: '坚持不懈直到成功',
          B: '持续努力但适时调整',
          C: '容易失去动力',
          D: '经常放弃'
        }),
        score_rules: JSON.stringify({
          A: 4,
          B: 3,
          C: 2,
          D: 1
        }),
        order: 30,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    const allQuestions = [
      ...anxietyQuestions,
      ...depressionQuestions,
      ...personalityQuestions
    ];

    await queryInterface.bulkInsert('assessment_questions', allQuestions, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('assessment_questions', null, {});
  }
}; 