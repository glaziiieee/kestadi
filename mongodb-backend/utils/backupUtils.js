// utils/backupUtils.js
const fs = require('fs');
const path = require('path');
const Profile = require('../models/Profile');
const User = require('../models/User');

// Create backup directory if it doesn't exist
const createBackupDir = () => {
  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
};

// Export all profiles to JSON
const exportProfilesToJSON = async () => {
  try {
    const profiles = await Profile.find({}).lean();
    const backupDir = createBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `profiles_backup_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(profiles, null, 2));
    
    return {
      success: true,
      filename,
      filepath,
      count: profiles.length
    };
  } catch (error) {
    console.error('Error exporting profiles to JSON:', error);
    throw new Error('Could not export profiles');
  }
};

// Export profiles to CSV
const exportProfilesToCSV = async () => {
  try {
    const profiles = await Profile.find({}).lean();
    const backupDir = createBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `profiles_backup_${timestamp}.csv`;
    const filepath = path.join(backupDir, filename);
    
    // Create CSV header
    const fields = [
      'studentId', 'firstName', 'lastName', 'middleName', 'birthdate',
      'gender', 'course', 'yearLevel', 'email', 'contactNumber',
      'enrollmentStatus', 'academicStatus', 'createdAt'
    ];
    
    let csvContent = fields.join(',') + '\r\n';
    
    // Add data rows
    profiles.forEach(profile => {
      const row = fields.map(field => {
        let value = profile[field] || '';
        
        // Format date fields
        if (field === 'birthdate' || field === 'createdAt') {
          value = value ? new Date(value).toISOString().split('T')[0] : '';
        }
        
        // Escape commas in values
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        
        return value;
      });
      
      csvContent += row.join(',') + '\r\n';
    });
    
    fs.writeFileSync(filepath, csvContent);
    
    return {
      success: true,
      filename,
      filepath,
      count: profiles.length
    };
  } catch (error) {
    console.error('Error exporting profiles to CSV:', error);
    throw new Error('Could not export profiles to CSV');
  }
};

// Full database backup (all collections)
const createFullBackup = async () => {
  try {
    const backupDir = createBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(backupDir, `full_backup_${timestamp}`);
    
    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder, { recursive: true });
    }
    
    // Back up profiles
    const profiles = await Profile.find({}).lean();
    fs.writeFileSync(
      path.join(backupFolder, 'profiles.json'),
      JSON.stringify(profiles, null, 2)
    );
    
    // Back up users (exclude passwords for security)
    const users = await User.find({})
      .select('-password')
      .lean();
    fs.writeFileSync(
      path.join(backupFolder, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    
    return {
      success: true,
      backupFolder,
      timestamp,
      collections: ['profiles', 'users']
    };
  } catch (error) {
    console.error('Error creating full backup:', error);
    throw new Error('Could not create full backup');
  }
};

module.exports = {
  exportProfilesToJSON,
  exportProfilesToCSV,
  createFullBackup
};