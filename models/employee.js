const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    photo: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["ADMIN", "RM", "TM", "FA"],
    },

    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    joiningDate: {
      type: Date,
    },

    leavingDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ON_LEAVE"],
      default: "ACTIVE",
    },

    assignedArea: {
      type: String,
      trim: true,
    },

    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      accuracy: {
        type: Number,
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },

   performance: {
  visits: {
    type: Number,
    default: 0,
  },

  farmersAdded: {
    type: Number,
    default: 0,
  },

  farmersMet: {
    type: Number,
    default: 0,
  },

  farmerMeetings: {
    type: Number,
    default: 0,
  },

  tasksCompleted: {
    type: Number,
    default: 0,
  },
}
    },
  
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Employee ||
  mongoose.model("Employee", employeeSchema);