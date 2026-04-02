const express = require("express");
const mongoose = require("mongoose");
const { Internship } = require("../models/Internship");

const router = express.Router();

const normalizePayload = (payload) => ({
  company: payload.company?.trim(),
  role: payload.role?.trim(),
  status: payload.status,
  appliedDate: payload.appliedDate,
  deadline: payload.deadline,
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const hasValidDateRange = (payload) =>
  !payload.appliedDate ||
  !payload.deadline ||
  new Date(payload.deadline) >= new Date(payload.appliedDate);

router.get("/", async (req, res, next) => {
  try {
    const internships = await Internship.find().sort({
      appliedDate: -1,
      createdAt: -1,
    });
    res.json(internships);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid internship ID" });
    }

    const internship = await Internship.findById(id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    res.json(internship);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const payload = normalizePayload(req.body);

    if (!hasValidDateRange(payload)) {
      return res
        .status(400)
        .json({ message: "Deadline must be on or after the applied date" });
    }

    const internship = await Internship.create(payload);
    res.status(201).json(internship);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid internship ID" });
    }

    const payload = normalizePayload(req.body);

    if (!hasValidDateRange(payload)) {
      return res
        .status(400)
        .json({ message: "Deadline must be on or after the applied date" });
    }

    const internship = await Internship.findByIdAndUpdate(
      id,
      payload,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    res.json(internship);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid internship ID" });
    }

    const internship = await Internship.findByIdAndDelete(id);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    res.json({ message: "Internship deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
