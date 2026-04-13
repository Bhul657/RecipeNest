import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:      user?.name      || '',
    bio:       user?.bio       || '',
    specialty: user?.specialty || '',
    instagram: user?.socialLinks?.instagram || '',
    twitter:   user?.socialLinks?.twitter   || '',
    youtube:   user?.socialLinks?.youtube   || '',
  });
  const [image,   setImage]   = useState(null);
  const [preview, setPreview] = useState(
    user?.profileImage ? `http://localhost:5000${user.profileImage}` : null
  );
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('profileImage', image);

      const { data } = await updateProfile(fd);
      updateUser(data.user);
      setSuccess('Profile updated successfully! ✅');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  };

  return (
    <div className="dashboard-page">
      <div className="container" style={{ maxWidth: 680 }}>
        <div className="dashboard-header">
          <div>
            <h1>Edit Profile</h1>
            <p>Update your chef profile information</p>
          </div>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="form-panel" onSubmit={handleSubmit}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
              background: 'var(--rust)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, border: '3px solid var(--border)'
            }}>
              {preview
                ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>{user?.name?.charAt(0)}</span>
              }
            </div>
            <div>
              <label className="image-upload-label" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--cream)', border: '1.5px dashed var(--border)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--slate)' }}>
                <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                📷 Change Profile Photo
              </label>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate)', marginTop: 4 }}>JPG, PNG or WebP · max 5MB</p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="form-label">Specialty</label>
            <input className="form-input" value={form.specialty} onChange={e => set('specialty', e.target.value)} placeholder="e.g. French Cuisine, Pastry" />
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-input form-textarea" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell food lovers about yourself..." style={{ minHeight: 120 }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <p className="form-label" style={{ marginBottom: 12 }}>Social Media Links</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 32, textAlign: 'center' }}>📸</span>
                <input className="form-input" value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="Instagram URL" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 32, textAlign: 'center' }}>🐦</span>
                <input className="form-input" value={form.twitter} onChange={e => set('twitter', e.target.value)} placeholder="Twitter URL" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 32, textAlign: 'center' }}>▶️</span>
                <input className="form-input" value={form.youtube} onChange={e => set('youtube', e.target.value)} placeholder="YouTube URL" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
