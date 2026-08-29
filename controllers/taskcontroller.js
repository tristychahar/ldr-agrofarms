const Task = require("../models/tasks");

// Create Task
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      relatedFarmer,
      remarks,
    } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Title and assignedTo are required",
      });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user.employeeId,
      priority,
      dueDate,
      relatedFarmer,
      remarks,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};


// Get My Tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.employeeId,
    })
      .populate("relatedFarmer", "farmerId name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};


// Get Single Task
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user.employeeId,
    }).populate("relatedFarmer", "farmerId name phone");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
    });
  }
};


// Update Task Status
const updateTaskStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user.employeeId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (status) {
      task.status = status;

      if (status === "COMPLETED") {
        task.completedAt = new Date();
      }
    }

    if (remarks !== undefined) {
      task.remarks = remarks;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};


// Get Pending Tasks
const getPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user.employeeId,
      status: {
        $in: ["PENDING", "IN_PROGRESS"],
      },
    })
      .populate("relatedFarmer", "farmerId name phone")
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get pending tasks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending tasks",
    });
  }
};


module.exports = {
  createTask,
  getMyTasks,
  getTaskById,
  updateTaskStatus,
  getPendingTasks,
};