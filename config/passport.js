const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// passport เป็นสื่อกลางในการติดต่อระหว่าง backend และ Google โดยใช้ Starategy ที่กำหนดไว้
// Configure Google OAuth strategy
passport.use('google', new GoogleStrategy({ // 'google' เป็นแค่ชื่อ ของกลยุทธ์ ที่ passport ใช้ ส่วนด้านหลังเป็นกลยุทธ์
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback' // api ที่ Google จะส่งผู้ใช้กลับมาหลังจากที่เข้าสู่ระบบผ่าน Google สำเร็จ โดยต้องผ่าน passport ก่อน
}, async (accessToken, refreshToken, profile, done) => { // ฟังก์ชันนี้จะถูกเรียกเมื่อผู้ใช้เข้าสู่ระบบผ่าน Google สำเร็จ โดยจะได้รับข้อมูลโปรไฟล์ของผู้ใช้จาก Google และเราจะใช้ข้อมูลนั้นในการตรวจสอบหรือสร้างผู้ใช้ในฐานข้อมูลของเรา(4 parameters นั้น Google จะส่งมาให้เราเอง)
  try { //ข้อมูลที่ได้รับมาจจาก Google จะอยู่ในตัวแปร profile ซึ่งจะมีข้อมูลต่าง ๆ เช่น id, displayName, emails เป็นต้น เราจะใช้ข้อมูลเหล่านี้ในการตรวจสอบหรือสร้างผู้ใช้ในฐานข้อมูลของเราก่อนจะส่งไปให้ api callback
    const email = profile.emails[0].value; // ดึงอีเมลจากโปรไฟล์ Google
    const googleId = profile.id; // ดึง Google ID จากโปรไฟล์

    // Check if user already exists
    let user = await User.findByGoogleId(googleId); // ค้นหาผู้ใช้ในฐานข้อมูลของเราโดยใช้ Google ID

    if (!user) {
      // Create new user with Google info
      user = await User.createGoogleUser( // ถ้าไม่พบผู้ใช้ในฐานข้อมูลของเรา ให้สร้างผู้ใช้ใหม่โดยใช้ข้อมูลจาก Google
        googleId,
        email,
        profile.displayName || profile.name?.givenName
      );
    }

    return done(null, user); // เมื่อเสร็จสิ้นการตรวจสอบหรือสร้างผู้ใช้แล้ว ให้เรียกฟังก์ชัน done เพื่อส่งข้อมูลผู้ใช้กลับไปยัง callback api ซึ่งจะทำให้ผู้ใช้เข้าสู่ระบบสำเร็จ
  } catch (err) {
    return done(err);
  }
}));

// Serialize user
passport.serializeUser((user, done) => { // เมื่อผู้ใช้เข้าสู่ระบบสำเร็จ จะเรียกฟังก์ชันนี้เพื่อเก็บข้อมูลผู้ใช้ใน session (โดยปกติจะเก็บเฉพาะ ID)
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => { // เมื่อมีการร้องขอที่ต้องการข้อมูลผู้ใช้จาก session จะเรียกฟังก์ชันนี้เพื่อดึงข้อมูลผู้ใช้จากฐานข้อมูลโดยใช้ ID ที่เก็บไว้ใน session
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
