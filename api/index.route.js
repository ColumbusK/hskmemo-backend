import express from 'express';


const router = express.Router();

router.route('/').get((req, res, next) => {
  res.send('weapp | hello world');
});

export default router;
