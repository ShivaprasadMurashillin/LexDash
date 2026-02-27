/**
 * Tasks CRUD Routes  –  /api/tasks
 */
const express              = require('express');
const router               = express.Router();
const Task                 = require('../models/Task');
const { createNotification } = require('../utils/notificationHelper');

const who = (req) => req.headers['x-user-name'] || 'An attorney';

// ── GET /api/tasks ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page       = parseInt(req.query.page)  || 1;
    const limit      = parseInt(req.query.limit) || 10;
    const search     = req.query.search     || '';
    const status     = req.query.status     || '';
    const priority   = req.query.priority   || '';
    const assignedTo = req.query.assignedTo || '';
    const caseId     = req.query.caseId     || '';

    const query = {};

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { assignedTo:  { $regex: search, $options: 'i' } },
      ];
    }
    if (status)     query.status     = status;
    if (priority)   query.priority   = priority;
    if (assignedTo) query.assignedTo = { $regex: assignedTo, $options: 'i' };
    if (caseId)     query.caseId     = caseId;

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate('caseId', 'title caseNumber')
      .sort({ dueDate: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: tasks,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('caseId', 'title caseNumber');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/tasks ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const task      = await Task.create(req.body);
    const populated = await task.populate('caseId', 'title caseNumber');
    await createNotification({ entity: 'Task', action: 'created', name: task.title, createdBy: who(req) });
    res.status(201).json({ success: true, data: populated, message: 'Task created successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('caseId', 'title caseNumber');

    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await createNotification({ entity: 'Task', action: 'updated', name: task.title, createdBy: who(req) });
    res.json({ success: true, data: task, message: 'Task updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    await createNotification({ entity: 'Task', action: 'deleted', name: task.title, createdBy: who(req) });
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
