const Attendance = require("../models/attendance");

const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { latitude, longitude, accuracy } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (existingAttendance?.checkIn?.time) {
      return res.status(409).json({
        success: false,
        message: "Already checked in today",
      });
    }

    const attendance =
      existingAttendance ||
      new Attendance({
        employee: employeeId,
        date: today,
      });

    attendance.status = "PRESENT";
    attendance.checkIn.time = new Date();

    attendance.checkIn.location = {
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      accuracy: accuracy ?? null,
    };

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check-in successful",
      data: attendance,
    });
  } catch (error) {
    console.error("Check-in error:", error);

    res.status(500).json({
      success: false,
      message: "Check-in failed",
    });
  }
};

const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;
    const { latitude, longitude, accuracy } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Check-in record not found",
      });
    }

    if (!attendance.checkIn?.time) {
      return res.status(400).json({
        success: false,
        message: "Please check in first",
      });
    }

    if (attendance.checkOut?.time) {
      return res.status(409).json({
        success: false,
        message: "Already checked out today",
      });
    }

    const checkOutTime = new Date();

    attendance.checkOut.time = checkOutTime;

    attendance.checkOut.location = {
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      accuracy: accuracy ?? null,
    };

    const duration =
      checkOutTime.getTime() -
      attendance.checkIn.time.getTime();

    attendance.workingHours =
      Math.round((duration / (1000 * 60 * 60)) * 100) / 100;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Check-out successful",
      data: attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);

    res.status(500).json({
      success: false,
      message: "Check-out failed",
    });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
};