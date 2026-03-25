// src/components/EditProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { ref, get, update } from 'firebase/database';

const EditProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user email from localStorage (or from your auth context)
        const storedUser = localStorage.getItem('current_user');
        if (!storedUser) {
          setError('No user found. Please sign in again.');
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        const userEmail = parsedUser.email?.toLowerCase();
        if (!userEmail) {
          setError('Invalid user data.');
          setLoading(false);
          return;
        }

        // Fetch all users and find this one
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        if (snapshot.exists()) {
          const usersData = snapshot.val();
          const userId = Object.keys(usersData).find(
            key => usersData[key].email?.toLowerCase() === userEmail
          );
          if (userId) {
            const data = usersData[userId];
            setUserData(data);
            setFullName(data.fullName || data.displayName || data.name || '');
            setEmail(data.email || '');
            setPhone(data.phone || data.phoneNumber || '');
          } else {
            setError('User not found in database.');
          }
        } else {
          setError('No users found.');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Find user ID again (we could store it in state, but re-fetch for safety)
      const storedUser = localStorage.getItem('current_user');
      if (!storedUser) throw new Error('No user found.');

      const parsedUser = JSON.parse(storedUser);
      const userEmail = parsedUser.email?.toLowerCase();
      if (!userEmail) throw new Error('Invalid user email.');

      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      if (!snapshot.exists()) throw new Error('No users data.');

      const usersData = snapshot.val();
      const userId = Object.keys(usersData).find(
        key => usersData[key].email?.toLowerCase() === userEmail
      );
      if (!userId) throw new Error('User not found.');

      // Prepare update object (only fields that exist in your DB)
      const updates = {};
      if (fullName !== (userData?.fullName || userData?.displayName || userData?.name)) {
        updates.fullName = fullName; // adjust field name as needed
      }
      if (phone !== (userData?.phone || userData?.phoneNumber)) {
        updates.phone = phone; // adjust field name as needed
      }
      // Email is usually not editable, but you can add logic if needed

      if (Object.keys(updates).length === 0) {
        setSuccess('No changes to save.');
        setSaving(false);
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      // Update Firebase
      await update(ref(db, `users/${userId}`), updates);

      // Update localStorage to reflect changes (optional)
      const updatedUser = { ...parsedUser, ...updates };
      localStorage.setItem('current_user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary/90 flex items-center justify-center">
        <div className="text-light text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-secondary mb-4"></i>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen bg-primary/90 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md w-full text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-secondary text-dark px-6 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/90 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-primary/50 backdrop-blur-sm border border-secondary/30 rounded-lg shadow-neon p-8">
        <h2 className="text-2xl font-bold text-secondary mb-6 text-center">Edit Profile</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded text-green-400 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-primary/80 border border-gray-600 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-secondary transition-colors"
              placeholder="Your full name"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full bg-primary/80 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-primary/80 border border-gray-600 rounded-lg px-4 py-3 text-light focus:outline-none focus:border-secondary transition-colors"
              placeholder="Your phone number"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-secondary text-dark font-medium py-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="flex-1 border border-gray-600 text-light font-medium py-3 rounded-lg hover:bg-primary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;