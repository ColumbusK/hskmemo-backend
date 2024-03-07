import express from 'express';
import UserController from './user.controller.js';
import multer from 'multer';
import path from 'path';



const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/home/yunfan/uploads/'); // 设置上传目录，确保目录存在
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });
// register routes
// get word
router.route('/').get((req, res, next) => {
  res.send('hello world');
});
//
router.route('/login').post(UserController.apiLogin);
router.route('/code/:code').get(UserController.apiGetToken);
// 更新用户信息登录并返回token
router.route('/code/:code').post(UserController.apiUpdateLogin);
router.route('/times').put(UserController.apiUpdateUser);
router.route('/displayinfo').get(UserController.apiGetUserDisplayInfo);
router.route('/plan').put(UserController.apiUpdateUserPlan);
router.route('/dicts').get(UserController.apiGetUserDicts);
router.route('/info').get(UserController.apiGetUserInfo);
// 用户收藏单词
router.route('/collects').get(UserController.apiGetCollectWords);
// 获取用户错词
router.route('/wrongs').get(UserController.apiGetWrongWords);
// 用户打卡日历
router.route('/clockin').post(UserController.apiUpdateUserCheck);
router.route('/clockin').get(UserController.apiGetUserCheck);
// 添加用户做题记录
router.route('/record').post(UserController.apiUpdateUserRecord);
// 获取用户学习时间
router.route('/studytime').get(UserController.apiGetUserStudyTime);
// 检查用户今日计划完成情况
router.route('/checkplan').get(UserController.apiCheckUserPlan);
// 用户头像上传
router.route('/profile').get(UserController.apiGetProfile);
router.route('/profile').post(upload.single('file'), UserController.apiUpdateProfile);


export default router;
