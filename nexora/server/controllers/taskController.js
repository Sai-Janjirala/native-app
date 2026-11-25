const Task = require('../models/Task');

function taskQuery(req) {
  return Task.find({ userId: req.user._id });
}

async function getAllTasks(req, res, next) {
  try {
    const tasks = await taskQuery(req).sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (err) {
    return next(err);
  }
}

async function getTaskById(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

async function createTask(req, res, next) {
  try {
    const { title, description, priority, category, dueDate } = req.body;

    if (!title || String(title).trim().length === 0) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      userId: req.user._id,
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      priority: priority || 'medium',
      category: category || 'personal',
      dueDate: dueDate || null,
    });

    return res.status(201).json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors)[0]?.message });
    }
    return next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, priority, category, dueDate } = req.body;

    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();
    return res.json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors)[0]?.message });
    }
    return next(err);
  }
}

async function toggleComplete(req, res, next) {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date() : null;
    await task.save();

    return res.json({ task });
  } catch (err) {
    return next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    return next(err);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const [total, completed, todayTasks, overdue] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, isCompleted: true }),
      Task.countDocuments({ userId, dueDate: { $gte: todayStart, $lt: todayEnd } }),
      Task.countDocuments({ userId, isCompleted: false, dueDate: { $lt: now } }),
    ]);

    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return res.json({ total, completed, pending, todayTasks, overdue, completionRate });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, toggleComplete, deleteTask, getDashboardStats };
