const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken } = require('../utils/tokenUtils');
const RefreshToken = require('../models/RefreshToken');

/**
 * GET /auth/google
 * Redirect to Google for authentication
 */
router.get('/google', passport.authenticate('google', { // กำหนด scope ที่ต้องการจาก Google เช่น profile และ email เพื่อให้เราสามารถเข้าถึงข้อมูลเหล่านี้ได้เมื่อผู้ใช้เข้าสู่ระบบผ่าน Google
  scope: ['profile', 'email'] // passport.authenticate -> parameter นี้ เป็นส่งข้อมูลไปขอ Google ว่าเราต้องการข้อมูลอะไรจากผู้ใช้บ้าง เช่น profile และ email ซึ่งจะทำให้ Google ส่งข้อมูลเหล่านี้กลับมาให้เราเมื่อผู้ใช้เข้าสู่ระบบผ่าน Google สำเร็จ
})); // profile และ email เป็น key เฉพาะที่จะบอกว่าเราต้องการข้อมูลอะไรจาก Google // api นี้ไม่ได้รับข้อมูลจาก Google โดยตรง แต่จะเป็นการส่งผู้ใช้ไปยังหน้าเข้าสู่ระบบของ Google และเมื่อผู้ใช้เข้าสู่ระบบผ่าน Google สำเร็จ Google จะส่งผู้ใช้กลับมาที่ callback api ที่เรากำหนดไว้ใน passport configuration ซึ่งจะมีข้อมูลโปรไฟล์ของผู้ใช้จาก Google อยู่ในตัวแปร profile ที่เราสามารถนำไปใช้ในการตรวจสอบหรือสร้างผู้ใช้ในฐานข้อมูลของเราได้

/**
 * GET /auth/google/callback
 * Google OAuth callback
 */
router.get('/google/callback', passport.authenticate('google', { // เมื่อผู้ใช้เข้าสู่ระบบเสร็จสิ้น Google จะส่งข้อมูลกลับมาที่ api นี้ แต่ต้องผ่าน passport ก่อน โดย passport จะมี parameter ที่ 3  ซึ่งเป็น logic สำหรับจัดการข้อมูลเช่นกัน จากนั้นจึงค่อยนำผลลัพธ์จาก logic นั้นส่งมาที่ callback api เพื่อนำไปใช้ ประมวลผลใหม่ๆต่อไป
}), (req, res) => {
  // Successful authentication
  const user = req.user; //นำข้อมูลจาก scope profile มาเก็บไว้ในตัวแปร user
  // Generate access token
  const accessToken = generateToken(user);
  
  // Create refresh token
  RefreshToken.create(user.id, 'web-client', null, (err, refreshToken) => {
    if (err) {
      console.error('Error creating refresh token:', err);
      return res.status(500).json({
        success: false,
        message: 'Error creating refresh token',
        error: err.message
      });
    }

    // Set session data
    req.session.accessToken = accessToken;
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.email = user.email;

    // Redirect to frontend with tokens
    // Replace 'http://localhost:3000' with your frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/success?token=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}&username=${user.username}`
    );
  });
});

/**
 * GET /auth/google/failure
 * Google OAuth failure
 */
router.get('/google/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Google authentication failed'
  });
});

/**
 * GET /auth/logout
 * Logout user
 */
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Error logging out',
        error: err.message
      });
    }
    req.session = null; // clear cookies
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });
});

/**
 * GET /auth/user
 * Get current authenticated user
 */
router.get('/user', (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      phone: req.user.phone,
      googleId: req.user.googleId
    }
  });
});

module.exports = router;
