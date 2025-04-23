const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authenticate = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all tasks for the logged-in user
router.get('/tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }); // Fetch tasks for the logged-in user
    res.json(tasks);
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send('Server Error');
  }
});

// Create a new task
router.post('/tasks', authenticate, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;
    const newTask = new Task({
      title,
      description,
      dueDate,
      status,
      user: req.user.id,
    });
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update a task
router.put('/tasks/:id', authenticate, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.status = status || task.status;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete a task
router.delete('/tasks/:id', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid task ID'); // Log invalid task ID
      return res.status(400).json({ message: 'Invalid task ID' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      console.log('Task not found');
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      console.log('Not authorized');
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Use deleteOne() instead of remove()
    await task.deleteOne();
    console.log('Task removed');
    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;