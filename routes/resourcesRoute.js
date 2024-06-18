import express from 'express';
import ResourcesController from '../controllers/resourcesController.js';


const router = express.Router();

router.route('/').get((req, res, next) => {
  res.send('dictRoute');
});
// get dicts
router.route('/simple-dict/').get(ResourcesController.apiSimpleDictSearch);

// 简明字典查词
// router.route('/simple-dict/').get(DictsController.apiSearchWord);


export default router;
