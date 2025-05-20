const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Proposal = require("../../models/Proposal");

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// GET all proposals for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const proposals = await Proposal.find({ userId: req.user.id });
    res.json(proposals);
  } catch (err) {
    console.error("Error fetching proposals:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST create new proposal
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, clientName, content } = req.body;

    const newProposal = new Proposal({
      title,
      clientName,
      content,
      userId: req.user.id,
    });

    await newProposal.save();
    res.status(201).json(newProposal);
  } catch (err) {
    console.error("Error creating proposal:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;