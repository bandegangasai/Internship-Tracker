const mongoose = require("mongoose");

const allowedStatuses = ["Applied", "Interview", "Selected", "Rejected"];

const internshipSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: allowedStatuses,
        message: "Status must be Applied, Interview, Selected, or Rejected",
      },
      default: "Applied",
    },
    appliedDate: {
      type: Date,
      required: [true, "Applied date is required"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
      validate: {
        validator(value) {
          return !this.appliedDate || value >= this.appliedDate;
        },
        message: "Deadline must be on or after the applied date",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = {
  Internship: mongoose.model("Internship", internshipSchema),
  allowedStatuses,
};
