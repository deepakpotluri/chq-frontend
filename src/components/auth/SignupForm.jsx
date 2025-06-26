// src/components/auth/SignupForm.jsx - Fixed typing issue for institution signup
import React, { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ChevronRight, Building2, User, Phone, MapPin, AlertCircle, Eye, EyeOff } from 'lucide-react';
import api from '../../../services/api';

// Move InputField outside the component and memoize it
const InputField = memo(({ label, name, type = "text", value, onChange, placeholder, required = false, error, className = "", showPasswordToggle, showPassword, onTogglePassword }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 ${
          error 
            ? 'border-red-300 focus:border-red-500 bg-red-50' 
            : 'border-gray-200 focus:border-slate-600 bg-gray-50 focus:bg-white'
        }`}
        placeholder={placeholder}
        required={required}
        autoComplete={name === 'password' ? 'new-password' : name === 'email' ? 'email' : 'off'}
      />
      {showPasswordToggle && (
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

// Move SelectField outside and memoize it
const SelectField = memo(({ label, name, value, onChange, options, placeholder, required = false, error, className = "" }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 ${
        error 
          ? 'border-red-300 focus:border-red-500 bg-red-50' 
          : 'border-gray-200 focus:border-slate-600 bg-gray-50 focus:bg-white'
      }`}
      required={required}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

// Move TextAreaField outside and memoize it
const TextAreaField = memo(({ label, name, value, onChange, placeholder, required = false, error, className = "", rows = 3 }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 ${
        error 
          ? 'border-red-300 focus:border-red-500 bg-red-50' 
          : 'border-gray-200 focus:border-slate-600 bg-gray-50 focus:bg-white'
      }`}
      placeholder={placeholder}
      rows={rows}
      required={required}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'aspirant',
    adminCode: ''
  });
  
  const [institutionData, setInstitutionData] = useState({
    confirmPassword: '',
    institutionName: '',
    institutionType: '',
    establishedYear: '',
    description: '',
    ownerName: '',
    ownerEmail: '',
    contactName: '',
    contactDesignation: '',
    contactPhone: '',
    contactEmail: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    fullAddress: '',
    googleMapsLink: ''
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectPath = location.state?.from || '/';
  const requiredRole = location.state?.requiredRole;
  
  useEffect(() => {
    if (requiredRole) {
      setFormData(prev => ({ ...prev, role: requiredRole }));
      if (requiredRole === 'institution') {
        setCurrentStep(1);
      }
    }
  }, [requiredRole]);

  const institutionSteps = [
    { number: 1, title: 'Account Setup', icon: User },
    { number: 2, title: 'Institution Info', icon: Building2 },
    { number: 3, title: 'Owner Details', icon: User },
    { number: 4, title: 'Contact Person', icon: Phone },
    { number: 5, title: 'Location', icon: MapPin }
  ];
  
  const institutionTypes = [
    { value: 'university', label: 'University' },
    { value: 'college', label: 'College' },
    { value: 'training_center', label: 'Training Center' },
    { value: 'coaching_institute', label: 'Coaching Institute' },
    { value: 'online_academy', label: 'Online Academy' },
    { value: 'other', label: 'Other' }
  ];

  // Use useCallback to memoize handleChange
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    
    if (name === 'role') {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (value === 'institution') {
        setCurrentStep(1);
      } else {
        setCurrentStep(0);
      }
      // Clear errors when role changes
      setErrors({});
      setError('');
    } else if (formData.role === 'institution') {
      // For institution fields, check if it's a formData field or institutionData field
      if (name === 'email' || name === 'password') {
        setFormData(prev => ({ ...prev, [name]: value }));
      } else {
        setInstitutionData(prev => ({ ...prev, [name]: value }));
      }
      
      // Clear specific field error
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, [formData.role, errors]);

  const validateInstitutionStep = (step) => {
    const newErrors = {};
    
    switch(step) {
      case 1:
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        
        if (!institutionData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
        else if (formData.password !== institutionData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;
        
      case 2:
        if (!institutionData.institutionName) newErrors.institutionName = 'Institution name is required';
        if (!institutionData.institutionType) newErrors.institutionType = 'Institution type is required';
        break;
        
      case 3:
        if (!institutionData.ownerName) newErrors.ownerName = 'Owner name is required';
        if (!institutionData.ownerEmail) newErrors.ownerEmail = 'Owner email is required';
        else if (!/\S+@\S+\.\S+/.test(institutionData.ownerEmail)) newErrors.ownerEmail = 'Email is invalid';
        break;
        
      case 4:
        if (!institutionData.contactName) newErrors.contactName = 'Contact name is required';
        if (!institutionData.contactDesignation) newErrors.contactDesignation = 'Designation is required';
        if (!institutionData.contactPhone) newErrors.contactPhone = 'Phone number is required';
        if (!institutionData.contactEmail) newErrors.contactEmail = 'Contact email is required';
        else if (!/\S+@\S+\.\S+/.test(institutionData.contactEmail)) newErrors.contactEmail = 'Email is invalid';
        break;
        
      case 5:
        if (!institutionData.fullAddress) newErrors.fullAddress = 'Full address is required';
        if (!institutionData.googleMapsLink) newErrors.googleMapsLink = 'Google Maps link is required';
        // More flexible Google Maps link validation - accept various formats
        else if (institutionData.googleMapsLink && 
                 !institutionData.googleMapsLink.includes('google.com/maps') && 
                 !institutionData.googleMapsLink.includes('maps.google.com') && 
                 !institutionData.googleMapsLink.includes('goo.gl/maps') &&
                 !institutionData.googleMapsLink.includes('maps.app.goo.gl') &&
                 !institutionData.googleMapsLink.includes('google.com/maps/place')) {
          newErrors.googleMapsLink = 'Please provide a valid Google Maps link';
        }
        break;
    }
    
    return newErrors;
  };

  const handleInstitutionNext = () => {
    const newErrors = validateInstitutionStep(currentStep);
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    } else {
      handleSubmit({ preventDefault: () => {} });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Regular signup for aspirants and admins
      if (formData.role !== 'institution') {
        if (!formData.name || !formData.email || !formData.password) {
          setError('Please fill all fields');
          setLoading(false);
          return;
        }
        
        if (formData.role === 'admin' && !formData.adminCode) {
          setError('Admin code is required');
          setLoading(false);
          return;
        }
      }
      
      // Prepare signup data based on role
      let signupData;
      
      if (formData.role === 'institution') {
  // Validate all institution fields
  const finalErrors = {};
  for (let i = 1; i <= 5; i++) {
    Object.assign(finalErrors, validateInstitutionStep(i));
  }
  
  if (Object.keys(finalErrors).length > 0) {
    setErrors(finalErrors);
    setError('Please complete all required fields');
    setLoading(false);
    return;
  }
  
  // Build full address if not provided
  const fullAddress = institutionData.fullAddress || [
    institutionData.street,
    institutionData.city,
    institutionData.state,
    institutionData.country,
    institutionData.zipCode
  ].filter(Boolean).join(', ');
  
  signupData = {
    role: 'institution',
    email: formData.email,
    password: formData.password,
    name: institutionData.institutionName,
    institutionProfile: {
      institutionName: institutionData.institutionName,
      institutionType: institutionData.institutionType,
      description: institutionData.description,
      establishedYear: institutionData.establishedYear,
      owner: {
        name: institutionData.ownerName,
        email: institutionData.ownerEmail
      },
      contactPerson: {
        name: institutionData.contactName,
        designation: institutionData.contactDesignation,
        phone: institutionData.contactPhone,
        email: institutionData.contactEmail
      },
      address: {
        street: institutionData.street,
        city: institutionData.city,
        state: institutionData.state,
        country: institutionData.country,
        zipCode: institutionData.zipCode,
        fullAddress: fullAddress
      },
      googleMapsLink: institutionData.googleMapsLink
    }
  };
} else {
        signupData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          adminCode: formData.role === 'admin' ? formData.adminCode : undefined
        };
      }
      
      const response = await api.post('/api/auth/signup', signupData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }
      
      // Handle institution verification requirement
      if (response.data.requiresVerification) {
        setSuccess(true);
        return;
      }
      
      // For other users, save token and redirect
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      
      window.dispatchEvent(new Event('authChange'));
      
      // Redirect based on role
      if (redirectPath !== '/') {
        navigate(redirectPath);
      } else if (response.data.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/aspirant/dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInstitutionStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Create Your Account</h3>
              <p className="text-gray-600 mt-2">Set up your institution account credentials</p>
            </div>
            
            <InputField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="institution@example.com"
              required
              error={errors.email}
            />
            
            <InputField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a strong password"
              required
              error={errors.password}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
            
            <InputField
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={institutionData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              error={errors.confirmPassword}
              showPasswordToggle
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Institution Information</h3>
              <p className="text-gray-600 mt-2">Tell us about your institution</p>
            </div>
            
            <InputField
              label="Institution Name"
              name="institutionName"
              value={institutionData.institutionName}
              onChange={handleChange}
              placeholder="Enter your institution name"
              required
              error={errors.institutionName}
            />
            
            <SelectField
              label="Institution Type"
              name="institutionType"
              value={institutionData.institutionType}
              onChange={handleChange}
              options={institutionTypes}
              placeholder="Select institution type"
              required
              error={errors.institutionType}
            />
            
            <InputField
              label="Established Year (Optional)"
              name="establishedYear"
              type="number"
              value={institutionData.establishedYear}
              onChange={handleChange}
              placeholder="e.g., 1995"
            />
            
            <TextAreaField
              label="Description (Optional)"
              name="description"
              value={institutionData.description}
              onChange={handleChange}
              placeholder="Brief description of your institution"
            />
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Owner Details</h3>
              <p className="text-gray-600 mt-2">Information about the institution owner</p>
            </div>
            
            <InputField
              label="Owner Name"
              name="ownerName"
              value={institutionData.ownerName}
              onChange={handleChange}
              placeholder="Full name of the owner"
              required
              error={errors.ownerName}
            />
            
            <InputField
              label="Owner Email"
              name="ownerEmail"
              type="email"
              value={institutionData.ownerEmail}
              onChange={handleChange}
              placeholder="owner@example.com"
              required
              error={errors.ownerEmail}
            />
            
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Privacy Note:</strong> Owner details are only visible to administrators for verification purposes and will be kept confidential.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Contact Person</h3>
              <p className="text-gray-600 mt-2">Primary contact for communications</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Contact Person Name"
                name="contactName"
                value={institutionData.contactName}
                onChange={handleChange}
                placeholder="Full name"
                required
                error={errors.contactName}
              />
              
              <InputField
                label="Designation"
                name="contactDesignation"
                value={institutionData.contactDesignation}
                onChange={handleChange}
                placeholder="e.g., Director, Administrator"
                required
                error={errors.contactDesignation}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Phone Number"
                name="contactPhone"
                type="tel"
                value={institutionData.contactPhone}
                onChange={handleChange}
                placeholder="+1234567890"
                required
                error={errors.contactPhone}
              />
              
              <InputField
                label="Contact Email"
                name="contactEmail"
                type="email"
                value={institutionData.contactEmail}
                onChange={handleChange}
                placeholder="contact@institution.com"
                required
                error={errors.contactEmail}
              />
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Location Details</h3>
              <p className="text-gray-600 mt-2">Where is your institution located?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Street Address"
                name="street"
                value={institutionData.street}
                onChange={handleChange}
                placeholder="Street address"
              />
              
              <InputField
                label="City"
                name="city"
                value={institutionData.city}
                onChange={handleChange}
                placeholder="City"
              />
              
              <InputField
                label="State/Province"
                name="state"
                value={institutionData.state}
                onChange={handleChange}
                placeholder="State"
              />
              
              <InputField
                label="Country"
                name="country"
                value={institutionData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
            
            <InputField
              label="ZIP/Postal Code"
              name="zipCode"
              value={institutionData.zipCode}
              onChange={handleChange}
              placeholder="ZIP code"
              className="md:w-1/2"
            />
            
            <TextAreaField
              label="Full Address"
              name="fullAddress"
              value={institutionData.fullAddress}
              onChange={handleChange}
              placeholder="Complete address including landmarks"
              required
              error={errors.fullAddress}
              rows={2}
            />
            
            <div>
              <InputField
                label="Google Maps Link"
                name="googleMapsLink"
                type="url"
                value={institutionData.googleMapsLink}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                required
                error={errors.googleMapsLink}
              />
              <p className="text-sm text-gray-500 mt-2">
                Go to Google Maps, find your location, click Share and copy the link
              </p>
            </div>
          </div>
        );
    }
  };

  // Success screen for institutions
  if (success && formData.role === 'institution') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-lg w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-8 text-lg">
              Your institution has been registered successfully. Please wait for admin verification before accessing the dashboard.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
              <ul className="text-left text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>We'll review your institution details within 24-48 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>You'll receive an email notification once verified</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">✓</span>
                  <span>After verification, you can log in and start creating courses</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-slate-700 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl mx-auto">
        {formData.role === 'institution' ? (
          // Institution multi-step signup
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            {/* Progress Bar */}
            <div className="bg-gradient-to-r from-slate-600 to-slate-800 p-6">
              <div className="flex items-center justify-between mb-8">
                {institutionSteps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      currentStep >= step.number 
                        ? 'bg-white text-slate-700' 
                        : 'bg-slate-500 text-white'
                    } transition-all duration-300`}>
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < institutionSteps.length - 1 && (
                      <div className={`w-12 sm:w-20 md:w-32 h-1 mx-2 ${
                        currentStep > step.number 
                          ? 'bg-white' 
                          : 'bg-slate-500'
                      } transition-all duration-300`} />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold">{institutionSteps[currentStep - 1]?.title}</h2>
                <p className="text-slate-200 mt-1">Step {currentStep} of 5</p>
              </div>
            </div>
            
            {/* Form Content */}
            <div className="p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}
              
              {renderInstitutionStep()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/login')}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  {currentStep === 1 ? 'Back to Login' : 'Previous'}
                </button>
                
                <button
                  type="button"
                  onClick={handleInstitutionNext}
                  disabled={loading}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : currentStep === 5 ? (
                    <>Complete Registration</>
                  ) : (
                    <>Next <ChevronRight className="w-4 h-4 ml-2" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Regular signup form
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">
                Sign up for Civils HQ
              </h2>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div className="mb-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    I am registering as
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  >
                    <option value="aspirant">Aspirant</option>
                    <option value="institution">Institution</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                {formData.role !== 'institution' && (
                  <>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Full name"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Email address"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                      />
                    </div>
                    
                    {formData.role === 'admin' && (
                      <div className="mb-4">
                        <label htmlFor="adminCode" className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Code
                        </label>
                        <input
                          id="adminCode"
                          name="adminCode"
                          type="password"
                          required
                          value={formData.adminCode}
                          onChange={handleChange}
                          className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                          placeholder="Enter admin code"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              {formData.role !== 'institution' && (
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </div>
              )}
            </form>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a 
                  href="/login" 
                  className="font-medium text-gray-700 hover:text-gray-800"
                  onClick={(e) => {
                    if (requiredRole) {
                      e.preventDefault();
                      navigate('/login', { 
                        state: { from: redirectPath, requiredRole } 
                      });
                    }
                  }}
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignupForm;