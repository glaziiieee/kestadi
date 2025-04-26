// utils/qrCodeUtils.js
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Generate QR code as data URL
const generateQRCodeDataURL = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Could not generate QR code');
  }
};

// Generate QR code and save as image file
const generateQRCodeImage = async (data, filename) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads/qrcodes');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filepath = path.join(uploadDir, `${filename}.png`);
    await QRCode.toFile(filepath, JSON.stringify(data));
    
    return `/uploads/qrcodes/${filename}.png`;
  } catch (error) {
    console.error('Error generating QR code image:', error);
    throw new Error('Could not generate QR code image');
  }
};

// Generate QR code for student profile
const generateStudentQRCode = async (student) => {
  const qrData = {
    id: student._id,
    studentId: student.studentId,
    name: `${student.firstName} ${student.lastName}`,
    course: student.course,
    yearLevel: student.yearLevel
  };
  
  // Generate both data URL and image file
  const dataURL = await generateQRCodeDataURL(qrData);
  const imagePath = await generateQRCodeImage(qrData, student.studentId);
  
  return {
    dataURL,
    imagePath
  };
};

module.exports = {
  generateQRCodeDataURL,
  generateQRCodeImage,
  generateStudentQRCode
};