const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");


// ===============================
// CREATE USER
// ===============================
const createUser = async (req, res) => {
  try {
    const { username, password, employee, role } = req.body;

    if (!username || !password || !employee || !role) {
      return res.status(400).json({
        success: false,
        message: "Username, password, employee and role are required",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const existingUser = await User.findOne({
      username: normalizedUsername,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username: normalizedUsername,
      passwordHash,
      employee,
      role,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        id: user._id,
        username: user.username,
        employee: user.employee,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// LOGIN USER
// ===============================
const loginUser = async (req, res) => {
  try {

    console.log("LOGIN JWT CHECK:", process.env.JWT_SECRET ? "JWT_SECRET FOUND" : "JWT_SECRET MISSING");
    const username = req.body.username?.trim().toLowerCase();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Find user and include passwordHash
    const user = await User.findOne({
      username: username,
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // JWT secret check
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is missing in .env",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        employeeId: user.employee,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        employee: user.employee,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// EXPORTS
// ===============================
module.exports = {
  createUser,
  loginUser,
};