const Leave = require("../models/leave");

// Apply for leave
const applyLeave = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const {
      leaveType,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (!leaveType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Leave type, start date and end date are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    const existingLeave = await Leave.findOne({
      employee: employeeId,
      status: "PENDING",
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (existingLeave) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending leave for these dates",
      });
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      reason: reason || "",
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Apply leave error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to apply for leave",
    });
  }
};


// Get my leaves
const getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const leaves = await Leave.find({
      employee: employeeId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error("Get leaves error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leave history",
    });
  }
};


// Get single leave
const getLeaveById = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: employeeId,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("Get leave error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch leave",
    });
  }
};


// Cancel pending leave
const cancelLeave = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: employeeId,
    });

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    if (leave.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending leave can be cancelled",
      });
    }

    leave.status = "CANCELLED";

    await leave.save();

    res.status(200).json({
      success: true,
      message: "Leave cancelled successfully",
      data: leave,
    });
  } catch (error) {
    console.error("Cancel leave error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to cancel leave",
    });
  }
};


module.exports = {
  applyLeave,
  getMyLeaves,
  getLeaveById,
  cancelLeave,
};