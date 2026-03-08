import React, { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import useAuthContext from '../hooks/useAuthContext';

const RegisterModal = ({ isOpen, onClose }) => {
  const { registerUser } = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    day: '1', month: 'Jan', year: '2000',
    gender: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`;
      await registerUser({
        name: fullName,
        email: formData.email,
        password: formData.password,
      });
      onClose();
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[432px] rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">Sign Up</h2>
            <p className="text-gray-500 text-sm">It's quick and easy.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="flex space-x-2">
            <input type="text" placeholder="First name" required className="reg-input" 
              onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            <input type="text" placeholder="Surname" required className="reg-input" 
              onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
          </div>
          
          <input type="email" placeholder="Mobile number or email address" required className="reg-input w-full" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} />
          
          <input type="password" placeholder="New password" required className="reg-input w-full" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} />

          {/* Date of Birth Section */}
          <div>
            <div className="flex items-center text-xs text-gray-600 mb-1">
              Date of birth <HelpCircle size={12} className="ml-1" />
            </div>
            <div className="flex space-x-2">
              <select className="reg-select flex-1"><option>1</option></select>
              <select className="reg-select flex-1"><option>Mar</option></select>
              <select className="reg-select flex-1"><option>2026</option></select>
            </div>
          </div>

          {/* Gender Section */}
          <div>
            <div className="flex items-center text-xs text-gray-600 mb-1">
              Gender <HelpCircle size={12} className="ml-1" />
            </div>
            <div className="flex space-x-2">
              {['Female', 'Male', 'Custom'].map((g) => (
                <label key={g} className="flex-1 flex justify-between items-center border border-gray-300 p-2 rounded-md text-sm">
                  {g}
                  <input type="radio" name="gender" value={g} 
                    onChange={(e) => setFormData({...formData, gender: e.target.value})} />
                </label>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-gray-500 leading-tight">
            By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy. 
            You may receive SMS notifications from us.
          </p>

          <div className="text-center pt-2 pb-2">
            <button type="submit" className="bg-[#00a400] text-white px-16 py-2 rounded-md font-bold text-lg hover:bg-[#008a00] transition">
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
