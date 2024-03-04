import express from 'express';
import LoginController from './user.controller.js';

const router = express.Router();

// register routes
// get word
router.route('/').get((req, res, next) => {
  res.send('hello world');
});

router.route('/login').post(LoginController.apiLogin);
router.route('/code/:code').get(LoginController.apiGetToken);
// 更新用户信息登录并返回token
router.route('/code/:code').post(LoginController.apiUpdateLogin);
router.route('/times').put(LoginController.apiUpdateUser);
router.route('/displayinfo').get(LoginController.apiGetUserDisplayInfo);
router.route('/plan').put(LoginController.apiUpdateUserPlan);
router.route('/dicts').get(LoginController.apiGetUserDicts);
router.route('/info').get(LoginController.apiGetUserInfo);
// 用户收藏单词
router.route('/collects').get(LoginController.apiGetCollectWords);
// 获取用户错词
router.route('/wrongs').get(LoginController.apiGetWrongWords);
// 用户打卡日历
router.route('/clockin').post(LoginController.apiUpdateUserCheck);
router.route('/clockin').get(LoginController.apiGetUserCheck);
// 添加用户做题记录
router.route('/record').post(LoginController.apiUpdateUserRecord);
// 获取用户学习时间
router.route('/studytime').get(LoginController.apiGetUserStudyTime);
// 检查用户今日计划完成情况
router.route('/checkplan').get(LoginController.apiCheckUserPlan);


export default router;
