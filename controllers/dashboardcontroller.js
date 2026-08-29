const Farmer = require("../models/farmer");
const Meeting = require("../models/meetings");
const FieldVisit = require("../models/feildvisit");
const Task = require("../models/tasks");
const Attendance = require("../models/attendance");
const Notification = require("../models/notification");

const getFADashboard = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const [
      totalFarmers,
      activeFarmers,
      todayMeetings,
      todayFieldVisits,
      pendingTasks,
      attendance,
      unreadNotifications,
    ] = await Promise.all([
      Farmer.countDocuments({
        assignedEmployee: employeeId,
      }),

      Farmer.countDocuments({
        assignedEmployee: employeeId,
        status: "ACTIVE",
      }),

      Meeting.countDocuments({
        employee: employeeId,
        meetingDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }),

      FieldVisit.countDocuments({
        employee: employeeId,
        visitDate: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }),

      Task.countDocuments({
        assignedTo: employeeId,
        status: {
          $in: ["PENDING", "IN_PROGRESS"],
        },
      }),

      Attendance.findOne({
        employee: employeeId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }),

      Notification.countDocuments({
        recipient: employeeId,
        isRead: false,
      }),
    ]);

    res.status(200).json({
      success: true,

      data: {
        farmers: {
          total: totalFarmers,
          active: activeFarmers,
        },

        today: {
          meetings: todayMeetings,
          fieldVisits: todayFieldVisits,
        },

        tasks: {
          pending: pendingTasks,
        },

        attendance,

        notifications: {
          unread: unreadNotifications,
        },
      },
    });
  } catch (error) {
    console.error("FA dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load FA dashboard",
    });
  }
};

module.exports = {
  getFADashboard,
};