const Meeting = require("../models/meetings");
const Farmer = require("../models/farmer");

const createMeeting = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const {
      farmer,
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      remarks,
    } = req.body;

    if (!farmer || !title || !date) {
      return res.status(400).json({
        success: false,
        message: "Farmer, title and date are required",
      });
    }

    const farmerExists = await Farmer.findOne({
      _id: farmer,
      assignedEmployee: employeeId,
      status: "ACTIVE",
    });

    if (!farmerExists) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found or not assigned to you",
      });
    }

    const meeting = await Meeting.create({
      employee: employeeId,
      farmer,
      title,
      description: description || "",
      date,
      startTime: startTime || null,
      endTime: endTime || null,
      location: location || {},
      remarks: remarks || "",
    });

    res.status(201).json({
      success: true,
      message: "Meeting created successfully",
      data: meeting,
    });
  } catch (error) {
    console.error("Create meeting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create meeting",
    });
  }
};

const getMyMeetings = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const meetings = await Meeting.find({
      employee: employeeId,
    })
      .populate("farmer", "farmerId name phone village")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: meetings.length,
      data: meetings,
    });
  } catch (error) {
    console.error("Get meetings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch meetings",
    });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const meeting = await Meeting.findOne({
      _id: req.params.id,
      employee: employeeId,
    }).populate("farmer", "farmerId name phone village");

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error("Get meeting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch meeting",
    });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const meeting = await Meeting.findOneAndUpdate(
      {
        _id: req.params.id,
        employee: employeeId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meeting updated successfully",
      data: meeting,
    });
  } catch (error) {
    console.error("Update meeting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update meeting",
    });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const meeting = await Meeting.findOneAndDelete({
      _id: req.params.id,
      employee: employeeId,
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("Delete meeting error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete meeting",
    });
  }
};

module.exports = {
  createMeeting,
  getMyMeetings,
  getMeetingById,
  updateMeeting,
  deleteMeeting,
};