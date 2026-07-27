import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, refreshProfile } = useContext(AuthContext);
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put('/auth/me', profile);
      if (data.success) {
        toast.success('Profile updated successfully!');
        refreshProfile();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put('/auth/change-password', passwordData);
      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/addresses', newAddr);
      if (data.success) {
        toast.success('Address added successfully!');
        setNewAddr({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', isDefault: false });
        refreshProfile();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const { data } = await API.delete(`/auth/addresses/${addressId}`);
      if (data.success) {
        toast.success('Address deleted successfully!');
        refreshProfile();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="py-5 bg-light">
      <div className="container" style={{ maxWidth: '960px' }}>
        <h1 className="h3 fw-bold text-dark mb-4">My Account</h1>

        <div className="row g-4">
          
          {/* PROFILE & PASSWORD */}
          <div className="col-md-6">
            
            {/* Edit Profile */}
            <div className="card shadow-sm border-0 p-4 mb-4 bg-white rounded">
              <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Edit Profile</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">Phone Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-hero-primary btn-sm w-100">
                  Update Profile
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card shadow-sm border-0 p-4 bg-white rounded">
              <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Current Password</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small text-muted">New Password</label>
                  <input
                    type="password"
                    className="form-control form-control-sm"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-hero-primary btn-sm w-100">
                  Update Password
                </button>
              </form>
            </div>

          </div>

          {/* ADDRESS BOOK */}
          <div className="col-md-6">
            
            {/* Address List */}
            <div className="card shadow-sm border-0 p-4 mb-4 bg-white rounded">
              <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Saved Addresses</h3>
              {user?.addresses?.length === 0 ? (
                <p className="text-muted small">No saved addresses found.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {user?.addresses?.map((addr) => (
                    <div key={addr._id} className="border p-3 rounded position-relative">
                      <h4 className="h6 fw-bold mb-1 d-flex align-items-center gap-2">
                        {addr.label}
                        {addr.isDefault && <span className="badge bg-success small">Default</span>}
                      </h4>
                      <p className="small text-muted mb-0">
                        <strong>{addr.fullName}</strong><br />
                        {addr.line1}, {addr.line2 && `${addr.line2}, `}
                        {addr.city}, {addr.state} - {addr.pincode}<br />
                        Phone: {addr.phone}
                      </p>
                      <button
                        className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 mt-2 me-2 p-0"
                        onClick={() => handleDeleteAddress(addr._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Address */}
            <div className="card shadow-sm border-0 p-4 bg-white rounded">
              <h3 className="h6 fw-bold mb-3 border-bottom pb-2">Add New Address</h3>
              <form onSubmit={handleAddAddress}>
                <div className="row g-2">
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Address Label (e.g. Home, Office)"
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Receiver's Name"
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Receiver's Phone"
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Address Line 1"
                      value={newAddr.line1}
                      onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Address Line 2 (Optional)"
                      value={newAddr.line2}
                      onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="State"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Pincode"
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-12 form-check ms-2 mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="defaultAddr"
                      checked={newAddr.isDefault}
                      onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    />
                    <label className="form-check-label small text-muted" htmlFor="defaultAddr">Set as default address</label>
                  </div>
                </div>
                <button type="submit" className="btn btn-hero-primary btn-sm w-100 mt-3">
                  Save Address
                </button>
              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
