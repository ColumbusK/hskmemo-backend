import express from 'express';
import DictsController from './dicts.controller.js';


const router = express.Router();

router.route('/').get((req, res, next) => {
  res.send('hello world');
});
// get dicts
router.route('/dicts/').get(DictsController.apiGetDicts);

export default router;

