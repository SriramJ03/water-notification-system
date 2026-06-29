const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      house_number: user.house_number,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      house_number,
      family_name,
      members_count,
      address,
    } = req.body;

    if (!name || !email || !password || !house_number) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and house number are required.",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users
      (name, email, password, mobile, house_number, family_name, members_count, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashed,
        mobile || null,
        house_number,
        family_name || null,
        members_count || 1,
        address || null,
      ]
    );

    await pool.query(
      `INSERT INTO houses
      (house_number, family_name, members_count, user_id)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      user_id = VALUES(user_id)`,
      [
        house_number,
        family_name || null,
        members_count || 1,
        result.insertId,
      ]
    );

    const [users] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );

    const token = generateToken(users[0]);

    const { password: _, ...userOut } = users[0];

    res.status(201).json({
      success: true,
      message: "Registered successfully.",
      token,
      user: userOut,
    });
  } catch (err) {
    console.log("\n================ REGISTER ERROR ================");
    console.error("Message      :", err.message);
    console.error("Code         :", err.code);
    console.error("Errno        :", err.errno);
    console.error("SQL State    :", err.sqlState);
    console.error("SQL Message  :", err.sqlMessage);
    console.error("SQL          :", err.sql);
    console.error("Stack        :", err.stack);
    console.log("===============================================\n");

    return res.status(500).json({
      success: false,
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND is_active = TRUE",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const user = users[0];

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const token = generateToken(user);

    await pool.query(
      `INSERT INTO user_sessions
      (user_id, token, ip_address, expires_at)
      VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, token, req.ip]
    );

    const { password: _, ...userOut } = user;

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: userOut,
    });
  } catch (err) {
    console.log("\n================ LOGIN ERROR ===================");
    console.error("Message      :", err.message);
    console.error("Code         :", err.code);
    console.error("SQL Message  :", err.sqlMessage);
    console.error("Stack        :", err.stack);
    console.log("===============================================\n");

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      await pool.query(
        "UPDATE user_sessions SET is_active = FALSE WHERE token = ?",
        [token]
      );
    }

    res.json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Logout error.",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const [users] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [req.user.id]
    );

    const user = users[0];

    const valid = await bcrypt.compare(
      current_password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashed = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashed, req.user.id]
    );

    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error changing password.",
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id,name,email,mobile,house_number,family_name,
      members_count,address,profile_picture,role,created_at
      FROM users WHERE id=?`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      user: users[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile.",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      mobile,
      family_name,
      members_count,
      address,
    } = req.body;

    await pool.query(
      `UPDATE users
      SET name=?, mobile=?, family_name=?, members_count=?, address=?
      WHERE id=?`,
      [
        name,
        mobile,
        family_name,
        members_count,
        address,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      message: "Profile updated.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error updating profile.",
    });
  }
};