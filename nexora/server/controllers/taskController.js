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

async function getAnalytics(req, res, next) {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Last 7 days (today + 6 prior)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      days.push({ start, end, label: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) });
    }

    const weekly = await Promise.all(
      days.map(async ({ start, end, label }) => {
        const [created, completed] = await Promise.all([
          Task.countDocuments({ userId, createdAt: { $gte: start, $lt: end } }),
          Task.countDocuments({ userId, isCompleted: true, completedAt: { $gte: start, $lt: end } }),
        ]);
        return { label, created, completed };
      })
    );

    // By priority
    const [highTotal, highDone, medTotal, medDone, lowTotal, lowDone] = await Promise.all([
      Task.countDocuments({ userId, priority: 'high' }),
      Task.countDocuments({ userId, priority: 'high', isCompleted: true }),
      Task.countDocuments({ userId, priority: 'medium' }),
      Task.countDocuments({ userId, priority: 'medium', isCompleted: true }),
      Task.countDocuments({ userId, priority: 'low' }),
      Task.countDocuments({ userId, priority: 'low', isCompleted: true }),
    ]);

    // By category
    const [workTotal, workDone, studyTotal, studyDone, personalTotal, personalDone] = await Promise.all([
      Task.countDocuments({ userId, category: 'work' }),
      Task.countDocuments({ userId, category: 'work', isCompleted: true }),
      Task.countDocuments({ userId, category: 'study' }),
      Task.countDocuments({ userId, category: 'study', isCompleted: true }),
      Task.countDocuments({ userId, category: 'personal' }),
      Task.countDocuments({ userId, category: 'personal', isCompleted: true }),
    ]);

    // Last 10 completed tasks
    const recentCompleted = await Task.find({ userId, isCompleted: true })
      .sort({ completedAt: -1 })
      .limit(10)
      .select('title category priority completedAt');

    return res.json({
      weekly,
      byPriority: [
        { label: 'High', total: highTotal, completed: highDone },
        { label: 'Medium', total: medTotal, completed: medDone },
        { label: 'Low', total: lowTotal, completed: lowDone },
      ],
      byCategory: [
        { label: 'Work', total: workTotal, completed: workDone },
        { label: 'Study', total: studyTotal, completed: studyDone },
        { label: 'Personal', total: personalTotal, completed: personalDone },
      ],
      recentCompleted,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, toggleComplete, deleteTask, getDashboardStats, getAnalytics };
