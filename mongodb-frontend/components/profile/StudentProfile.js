// components/profile/StudentProfile.js
import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { getProfile, updateProfile } from '../../services/profileService';
import { exportProfileToQR } from '../../utils/qrCode';

const StudentProfile = ({ id, onUpdate }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile(id);
        setProfile(data);
        setFormData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProfile = await updateProfile(id, formData);
      setProfile(updatedProfile);
      setEditing(false);
      if (onUpdate) onUpdate(updatedProfile);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportQR = async () => {
    try {
      await exportProfileToQR(profile);
    } catch (err) {
      setError('Failed to export QR code');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="not-found">Profile not found</div>;

  return (
    <div className="student-profile">
      <div className="profile-header">
        <h2>{profile.firstName} {profile.middleName} {profile.lastName}</h2>
        <div className="profile-actions">
          {!editing && (
            <>
              <button onClick={() => setEditing(true)} className="btn btn-edit">
                Edit Profile
              </button>
              <button onClick={handlePrint} className="btn btn-print">
                Print Profile
              </button>
              <button onClick={handleExportQR} className="btn btn-qr">
                Export QR Code
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="middleName">Middle Name</label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="course">Course</label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="yearLevel">Year Level</label>
            <select
              id="yearLevel"
              name="yearLevel"
              value={formData.yearLevel}
              onChange={handleChange}
              required
            >
              {[1, 2, 3, 4, 5, 6].map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="enrollmentStatus">Enrollment Status</label>
            <select
              id="enrollmentStatus"
              name="enrollmentStatus"
              value={formData.enrollmentStatus}
              onChange={handleChange}
              required
            >
              <option value="Enrolled">Enrolled</option>
              <option value="Not Enrolled">Not Enrolled</option>
              <option value="Leave of Absence">Leave of Absence</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-save">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormData(profile);
              }}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="profile-details">
          <div className="profile-info">
            <div className="student-id">
              <strong>Student ID:</strong> {profile.studentId}
            </div>
            <div className="contact-info">
              <div><strong>Email:</strong> {profile.email}</div>
              <div><strong>Phone:</strong> {profile.contactNumber || 'Not provided'}</div>
            </div>
            <div className="academic-info">
              <div><strong>Course:</strong> {profile.course}</div>
              <div><strong>Year Level:</strong> {profile.yearLevel}</div>
              <div><strong>Status:</strong> {profile.enrollmentStatus}</div>
              <div><strong>Academic Standing:</strong> {profile.academicStatus}</div>
            </div>
            <div className="personal-info">
              <div><strong>Birthdate:</strong> {new Date(profile.birthdate).toLocaleDateString()}</div>
              <div><strong>Gender:</strong> {profile.gender}</div>
            </div>
            <div className="guardian-info">
              <div><strong>Guardian:</strong> {profile.guardianName || 'Not provided'}</div>
              <div><strong>Guardian Contact:</strong> {profile.guardianContact || 'Not provided'}</div>
            </div>
          </div>
          <div className="profile-qr">
            <h3>Student QR Code</h3>
            <QRCode
              value={JSON.stringify({
                id: profile._id,
                studentId: profile.studentId,
                name: `${profile.firstName} ${profile.lastName}`,
                course: profile.course
              })}
              size={200}
              level="H"
            />
            <p className="qr-note">Scan for quick student identification</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;