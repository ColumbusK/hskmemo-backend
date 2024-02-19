import express from 'express';


const router = express.Router();

router.route('/').get((req, res, next) => {
  res.render('index', { title: 'WeApp Backend' });
});

export default router;
