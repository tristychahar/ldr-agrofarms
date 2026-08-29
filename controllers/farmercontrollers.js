const Farmer = require("../models/farmer");

// Create Farmer
const createFarmer = async (req, res) => {
  try {
    const {
      farmerId,
      name,
      photo,
      phone,
      email,
      address,
      village,
      district,
      state,
      location,
      land,
      crops,
    } = req.body;

    if (!farmerId || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Farmer ID, name and phone are required",
      });
    }

    const existingFarmer = await Farmer.findOne({ farmerId });

    if (existingFarmer) {
      return res.status(409).json({
        success: false,
        message: "Farmer ID already exists",
      });
    }

    const farmer = await Farmer.create({
      farmerId,
      name,
      photo,
      phone,
      email,
      address,
      village,
      district,
      state,
      location,
      land,
      crops,
      assignedEmployee: req.user.employeeId,
    });

    res.status(201).json({
      success: true,
      message: "Farmer created successfully",
      data: farmer,
    });
  } catch (error) {
    console.error("Create farmer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create farmer",
      error: error.message,
    });
  }
};


// Get My Farmers
const getMyFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.find({
      assignedEmployee: req.user.employeeId,
      status: "ACTIVE",
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: farmers.length,
      data: farmers,
    });
  } catch (error) {
    console.error("Get farmers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch farmers",
    });
  }
};


// Get Single Farmer
const getFarmerById = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({
      _id: req.params.id,
      assignedEmployee: req.user.employeeId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    res.status(200).json({
      success: true,
      data: farmer,
    });
  } catch (error) {
    console.error("Get farmer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch farmer",
    });
  }
};


// Update Farmer
const updateFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({
      _id: req.params.id,
      assignedEmployee: req.user.employeeId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    Object.assign(farmer, req.body);

    await farmer.save();

    res.status(200).json({
      success: true,
      message: "Farmer updated successfully",
      data: farmer,
    });
  } catch (error) {
    console.error("Update farmer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update farmer",
    });
  }
};


// Deactivate Farmer
const deactivateFarmer = async (req, res) => {
  try {
    const farmer = await Farmer.findOne({
      _id: req.params.id,
      assignedEmployee: req.user.employeeId,
    });

    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: "Farmer not found",
      });
    }

    farmer.status = "INACTIVE";

    await farmer.save();

    res.status(200).json({
      success: true,
      message: "Farmer deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate farmer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to deactivate farmer",
    });
  }
};


module.exports = {
  createFarmer,
  getMyFarmers,
  getFarmerById,
  updateFarmer,
  deactivateFarmer,
};