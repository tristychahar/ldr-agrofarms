const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Employee = require("../models/employee");

// Get FA profile
const getMyProfile = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const employee = await Employee.findById(employeeId)
      .select("-__v")
      .populate("supervisorId", "employeeId name role phone email");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};

// Update FA profile
const updateMyProfile = async (req, res) => {
  try {
    const employeeId = req.user.employeeId;

    const {
      name,
      photo,
      phone,
      email,
      assignedArea,
      location,
    } = req.body;

    const employee = await Employee.findById(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee profile not found",
      });
    }

    if (name !== undefined) employee.name = name;
    if (photo !== undefined) employee.photo = photo;
    if (phone !== undefined) employee.phone = phone;
    if (email !== undefined) employee.email = email;
    if (assignedArea !== undefined) {
      employee.assignedArea = assignedArea;
    }

    if (location !== undefined) {
      employee.location = {
        latitude: location.latitude ?? employee.location.latitude,
        longitude: location.longitude ?? employee.location.longitude,
        accuracy: location.accuracy ?? employee.location.accuracy,
        updatedAt: new Date(),
      };
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// Change password for the currently authenticated employee
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ employee: req.user.employeeId }).select("+passwordHash");

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!matches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
};