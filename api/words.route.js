import express from 'express';
import WordsController from './words.controller.js';

const router = express.Router();

// register routes
// get word
router.route('/').get((req, res, next) => {
  res.send('hello world');
});

router.route('/word').get(WordsController.apiGetWord);

// 收藏单词
router.route('/collect/:wordId').put(WordsController.apiCollectWord);

// 添加错词本
router.route('/wrong/:wordId').put(WordsController.apiAddWrongWord);

export default router;

