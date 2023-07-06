import express from 'express';
import PracticeController from './practice.controller.js';

const router = express.Router();

// register routes
// get word
router.route('/').get((req, res, next) => {
  res.send('hello practice api');
});

router.route('/practice/:word').get(PracticeController.apiGetPractice);
router.route('/practice-list/:num').get(PracticeController.apiGetPracticeList);
router.route('/practicelist-user').get(PracticeController.apiGetPracticeListByUser);
router.route('/practice/feedback/:wordid').post(PracticeController.apiPostPracticeFeedback);

export default router;

