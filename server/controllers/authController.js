const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    user.password = undefined;

    res.status(200).json({
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
    console.log("FORGOT PASSWORD HIT");
    
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        console.log("EMAIL RECEIVED:", email);
        console.log("USER FOUND:", !!user);
        if (!user) {
            // To prevent email enumeration, we send a generic success message.
            return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `
            <p>You are receiving this email because you (or someone else) have requested the reset of a password for your WorkWave account.</p>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
            <p>This link is valid for 15 minutes.</p>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `;

        try {
          console.log("ATTEMPTING TO SEND EMAIL");  
          await sendEmail({
                email: user.email,
                subject: 'Reset Your WorkWave Password',
                message
            });

            res.status(200).json({ message: 'Password reset link sent to your email.' });
        } catch (error) {
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent. Please try again later." });
        }

    } catch (error) {
        console.error("EMAIL ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const resetToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetToken,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const { password } = req.body;

        if (!password) {
             return res.status(400).json({ message: 'Please provide a new password.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};