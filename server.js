const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const transporter = nodemailer.createTransport({
  service: "gmail", // or your provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: "ryan20020719@gmail.com",
  subject: "New Message Received",
  text: `New message: ${message}`,
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error("Email error:", err);
  } else {
    console.log("Email sent:", info.response);
  }
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection error:", err);
    return;
  }
  console.log("Connected to MySQL");

  // Create the table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error("Error creating messages table:", err);
    } else {
      console.log("Messages table ensured.");
    }
  });
});

// POST endpoint to save message
app.post("/api/messages", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const query = "INSERT INTO messages (content) VALUES (?)";
  db.query(query, [message], (err, results) => {
    if (err) {
      console.error("Error inserting message:", err);
      res.status(500).json({ error: "Database error" });
    } else {
      res.status(201).json({ success: true, id: results.insertId });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
