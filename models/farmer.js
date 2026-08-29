const mongoose = require("mongoose");

const farmerSchema = new mongoose.Schema(
  {
    farmerId: {
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
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    village: {
      type: String,
      trim: true,
      default: "",
    },

    district: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
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

    land: {
      area: {
        type: Number,
        default: null,
      },

      unit: {
        type: String,
        default: "acre",
      },

      details: {
        type: String,
        trim: true,
        default: "",
      },
    },

    crops: [
      {
        name: {
          type: String,
          trim: true,
        },

        season: {
          type: String,
          trim: true,
        },

        area: {
          type: Number,
          default: null,
        },
      },
    ],

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    registrationDate: {
      type: Date,
      default: Date.now,
    },

    activities: [
      {
        type: {
          type: String,
          trim: true,
        },

        description: {
          type: String,
          trim: true,
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    documents: [
      {
        name: {
          type: String,
          trim: true,
        },

        url: {
          type: String,
          trim: true,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Farmer", farmerSchema);