const FieldVisit = require("../models/feildvisit");

const createFieldVisit = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const {
      farmer,
      purpose,
      notes,
      latitude,
      longitude,
      accuracy,
    } = req.body;

    if (!farmer || !purpose) {
      return res.status(400).json({
        success: false,
        message: "Farmer and purpose are required",
      });
    }

    const visit = await FieldVisit.create({
      employee: employeeId,
      farmer,
      purpose,
      notes: notes || "",
      location: {
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        accuracy: accuracy ?? null,
      },
      visitDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Field visit created successfully",
      data: visit,
    });
  } catch (error) {
    console.error("Create field visit error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create field visit",
    });
  }
};

const getMyFieldVisits = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const visits = await FieldVisit.find({
      employee: employeeId,
    })
      .populate("farmer", "farmerId name phone village")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    console.error("Get field visits error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch field visits",
    });
  }
};

const getTodayFieldVisits = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const visits = await FieldVisit.find({
      employee: employeeId,
      visitDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("farmer", "farmerId name phone village")
      .sort({ visitDate: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error) {
    console.error("Get today's field visits error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch today's field visits",
    });
  }
};

module.exports = {
  createFieldVisit,
  getMyFieldVisits,
  getTodayFieldVisits,
};