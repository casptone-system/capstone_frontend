const router = require('express').Router();
const reviewController = require('../controllers/reviewController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/queue', authorize('area_in_charge', 'program_chair', 'dean', 'qa', 'vpaa'), reviewController.queue);
router.post('/:documentId/decision', authorize('area_in_charge', 'program_chair', 'dean', 'qa', 'vpaa'), reviewController.decide);

module.exports = router;
