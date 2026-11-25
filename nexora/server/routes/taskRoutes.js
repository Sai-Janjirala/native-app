const express = require('express');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleComplete,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/toggle', toggleComplete);
router.delete('/:id', deleteTask);

module.exports = router;
