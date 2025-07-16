// src/components/auth/SignupForm.jsx - Gray theme (no purple)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ChevronRight, Building2, User, Phone, MapPin, AlertCircle, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import api from '../../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'aspirant',
    adminCode: ''
  });
  
  const [institutionData, setInstitutionData] = useState({
    // Basic Information
    institutionName: '',
    institutionType: '',
    description: '',
    establishedYear: '',
    // Owner Information
    ownerName: '',
    ownerEmail: '',
    // Contact Person
    contactName: '',
    contactDesignation: '',
    contactPhone: '',
    contactEmail: '',
    // Address
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    fullAddress: '',
    googleMapsLink: '',
    // Password
    confirmPassword: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP related state
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [sendingOTP, setSendingOTP] = useState(false);
  const otpRefs = useRef([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectPath = location.state?.from || '/';
  const requiredRole = location.state?.requiredRole;
  
  // Constants
  const steps = [
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

  // Handle change function
  const handleChange = (e) => {
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
  };
  
  // Timer effect for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  
  // OTP related functions
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };
  
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      otpRefs.current[5]?.focus();
    }
  };
  
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  
  const sendOTP = async () => {
    setSendingOTP(true);
    setOtpError('');
    
    try {
      const response = await api.post('/api/auth/send-otp', {
        email: formData.email,
        name: formData.role === 'institution' ? institutionData.institutionName : formData.name,
        role: formData.role
      });
      
      if (response.data.success) {
        setShowOTPVerification(true);
        setResendTimer(60);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };
  
  const verifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setOtpError('Please enter complete OTP');
      return;
    }
    
    setOtpLoading(true);
    setOtpError('');
    
    try {
      const response = await api.post('/api/auth/verify-otp', {
        otp: otpString,
        email: formData.email
      });
      
      if (response.data.success) {
        setIsEmailVerified(true);
        setShowOTPVerification(false);
        // Don't call handleSubmit here - just mark as verified
        // The user will see the success indicators and the form will auto-submit
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };
  
  // Loading overlay for OTP sending
  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center">
          <Mail className="w-12 h-12 text-gray-700 mb-4 animate-bounce" />
          <Loader2 className="w-8 h-8 text-gray-700 animate-spin mb-4" />
          <p className="text-lg font-semibold text-gray-800">Sending OTP...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait while we send the verification code</p>
        </div>
      </div>
    </div>
  );
  
  // OTP Verification Modal
  const renderOTPVerification = () => {
    if (!showOTPVerification) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit code to<br />
              <span className="font-semibold text-gray-900">{formData.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-12 h-12 text-center text-xl border-2 focus:border-gray-700"
                  maxLength="1"
                />
              ))}
            </div>
            
            {otpError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{otpError}</AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={verifyOTP}
              disabled={otpLoading || otp.join('').length !== 6}
              className="w-full bg-gray-700 hover:bg-gray-800 text-white"
            >
              {otpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {otpLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500">Resend OTP in {resendTimer}s</p>
              ) : (
                <Button
                  variant="link"
                  onClick={sendOTP}
                  disabled={otpLoading}
                  className="text-gray-700 hover:text-gray-800"
                >
                  Resend OTP
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              onClick={() => {
                setShowOTPVerification(false);
                setOtpError('');
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

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
    
    // Prevent double submission
    if (loading || sendingOTP) {
      return;
    }
    
    // If email not verified, send OTP first
    if (!isEmailVerified) {
      // Validate email before sending OTP
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      // For regular signup, also validate name and password before sending OTP
      if (formData.role !== 'institution') {
        if (!formData.name || !formData.password) {
          setError('Please fill all fields before verifying email');
          return;
        }
        
        if (formData.role === 'admin' && !formData.adminCode) {
          setError('Admin code is required');
          return;
        }
      }
      
      await sendOTP();
      return;
    }
    
    // If email is already verified, proceed with signup
    setError('');
    setLoading(true);
    
    try {
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
          isEmailVerified: true,
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
          isEmailVerified: true,
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
              <h3 className="text-2xl font-bold text-gray-900">Create Your Account</h3>
              <p className="text-gray-600 mt-2">Set up your institution account credentials</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="institution@example.com"
                  className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.email ? "border-red-500" : ""} ${isEmailVerified ? "pr-10" : ""}`}
                  disabled={isEmailVerified}
                />
                {isEmailVerified && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              {isEmailVerified && <p className="text-sm text-green-600">Email verified ✓</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a strong password"
                  className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.password ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={institutionData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Institution Details</h3>
              <p className="text-gray-600 mt-2">Tell us about your institution</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="institutionName" className="text-gray-700">Institution Name</Label>
              <Input
                id="institutionName"
                name="institutionName"
                value={institutionData.institutionName}
                onChange={handleChange}
                placeholder="Enter your institution name"
                className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.institutionName ? "border-red-500" : ""}`}
              />
              {errors.institutionName && <p className="text-sm text-red-500">{errors.institutionName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="institutionType" className="text-gray-700">Institution Type</Label>
              <Select 
                value={institutionData.institutionType}
                onValueChange={(value) => handleChange({ target: { name: 'institutionType', value } })}
              >
                <SelectTrigger className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.institutionType ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Select institution type" />
                </SelectTrigger>
                <SelectContent>
                  {institutionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.institutionType && <p className="text-sm text-red-500">{errors.institutionType}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-700">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={institutionData.description}
                onChange={handleChange}
                placeholder="Brief description of your institution"
                rows={4}
                className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="establishedYear" className="text-gray-700">Established Year (Optional)</Label>
              <Input
                id="establishedYear"
                name="establishedYear"
                type="number"
                value={institutionData.establishedYear}
                onChange={handleChange}
                placeholder="e.g., 2010"
                className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Owner Information</h3>
              <p className="text-gray-600 mt-2">Institution owner details</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownerName" className="text-gray-700">Owner Name</Label>
              <Input
                id="ownerName"
                name="ownerName"
                value={institutionData.ownerName}
                onChange={handleChange}
                placeholder="Full name of the owner"
                className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.ownerName ? "border-red-500" : ""}`}
              />
              {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ownerEmail" className="text-gray-700">Owner Email</Label>
              <Input
                id="ownerEmail"
                name="ownerEmail"
                type="email"
                value={institutionData.ownerEmail}
                onChange={handleChange}
                placeholder="owner@example.com"
                className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.ownerEmail ? "border-red-500" : ""}`}
              />
              {errors.ownerEmail && <p className="text-sm text-red-500">{errors.ownerEmail}</p>}
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Privacy Note:</strong> Owner details are only visible to administrators for verification purposes and will be kept confidential.
              </AlertDescription>
            </Alert>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Contact Person</h3>
              <p className="text-gray-600 mt-2">Primary contact for communications</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactName" className="text-gray-700">Contact Person Name</Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={institutionData.contactName}
                  onChange={handleChange}
                  placeholder="Full name"
                  className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.contactName ? "border-red-500" : ""}`}
                />
                {errors.contactName && <p className="text-sm text-red-500">{errors.contactName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactDesignation" className="text-gray-700">Designation</Label>
                <Input
                  id="contactDesignation"
                  name="contactDesignation"
                  value={institutionData.contactDesignation}
                  onChange={handleChange}
                  placeholder="e.g., Director, Administrator"
                  className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.contactDesignation ? "border-red-500" : ""}`}
                />
                {errors.contactDesignation && <p className="text-sm text-red-500">{errors.contactDesignation}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-gray-700">Phone Number</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={institutionData.contactPhone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.contactPhone ? "border-red-500" : ""}`}
                />
                {errors.contactPhone && <p className="text-sm text-red-500">{errors.contactPhone}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-gray-700">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={institutionData.contactEmail}
                  onChange={handleChange}
                  placeholder="contact@institution.com"
                  className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.contactEmail ? "border-red-500" : ""}`}
                />
                {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Location Details</h3>
              <p className="text-gray-600 mt-2">Where is your institution located?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="street" className="text-gray-700">Street Address</Label>
                <Input
                  id="street"
                  name="street"
                  value={institutionData.street}
                  onChange={handleChange}
                  placeholder="Street address"
                  className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city" className="text-gray-700">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={institutionData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state" className="text-gray-700">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={institutionData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country" className="text-gray-700">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={institutionData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                />
              </div>
            </div>
            
            <div className="space-y-2 md:w-1/2">
              <Label htmlFor="zipCode" className="text-gray-700">ZIP/Postal Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={institutionData.zipCode}
                onChange={handleChange}
                placeholder="ZIP code"
                className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullAddress" className="text-gray-700">Full Address</Label>
              <Textarea
                id="fullAddress"
                name="fullAddress"
                value={institutionData.fullAddress}
                onChange={handleChange}
                placeholder="Complete address including landmarks"
                rows={2}
                className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.fullAddress ? "border-red-500" : ""}`}
              />
              {errors.fullAddress && <p className="text-sm text-red-500">{errors.fullAddress}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="googleMapsLink" className="text-gray-700">Google Maps Link</Label>
              <Input
                id="googleMapsLink"
                name="googleMapsLink"
                type="url"
                value={institutionData.googleMapsLink}
                onChange={handleChange}
                placeholder="https://maps.google.com/..."
                className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${errors.googleMapsLink ? "border-red-500" : ""}`}
              />
              {errors.googleMapsLink && <p className="text-sm text-red-500">{errors.googleMapsLink}</p>}
              <p className="text-sm text-gray-500">
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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg bg-white shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Your institution has been registered successfully. Please wait for admin verification before accessing the dashboard.
              </p>
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  You will receive an email notification once your account is verified by our team. This usually takes 1-2 business days.
                </AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Loading Overlay */}
      {sendingOTP && <LoadingOverlay />}
      
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {formData.role === 'institution' && !success ? (
          // Institution multi-step form
          <Card className="shadow-2xl bg-white">
            {/* Progress bar */}
            <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl">Institution Registration</CardTitle>
                <span className="text-sm text-gray-300">Step {currentStep} of 5</span>
              </div>
              <Progress value={(currentStep / 5) * 100} className="h-2 bg-gray-600" />
              {/* Step indicators */}
              <div className="flex justify-between mt-6">
                {steps.map((step) => (
                  <div 
                    key={step.number}
                    className={`flex flex-col items-center ${
                      step.number <= currentStep ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      step.number < currentStep ? 'bg-white text-gray-700' :
                      step.number === currentStep ? 'bg-white text-gray-700' :
                      'bg-gray-600'
                    }`}>
                      {step.number < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            
            {/* Form content */}
            <CardContent className="p-8">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Show email verified status for institutions */}
              {isEmailVerified && currentStep === 5 && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Email verified successfully! Click "Complete Registration" to finish.
                  </AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={(e) => e.preventDefault()}>
                {renderInstitutionStep()}
              </form>
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/login')}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {currentStep === 1 ? 'Back to Login' : 'Previous'}
                </Button>
                
                <Button
                  type="button"
                  onClick={currentStep === 5 && !isEmailVerified ? handleSubmit : handleInstitutionNext}
                  disabled={loading}
                  className="bg-gray-700 hover:bg-gray-800 text-white"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? (
                    'Processing...'
                  ) : currentStep === 5 ? (
                    isEmailVerified ? 'Complete Registration' : 'Verify Email & Register'
                  ) : (
                    <>Next <ChevronRight className="w-4 h-4 ml-2" /></>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Regular signup form
          <Card className="w-full max-w-md mx-auto shadow-2xl bg-white">
            <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-center">
              <CardTitle className="text-2xl">Sign up for Civils HQ</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Show email verified message */}
              {isEmailVerified && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Email verified successfully! Click Sign Up to complete registration.
                  </AlertDescription>
                </Alert>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-700">I am registering as</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleChange({ target: { name: 'role', value } })}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-gray-700 focus:ring-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aspirant">Aspirant</SelectItem>
                      <SelectItem value="institution">Institution</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.role !== 'institution' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full name"
                        required
                        className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Email address"
                          required
                          className={`border-gray-300 focus:border-gray-700 focus:ring-gray-700 ${isEmailVerified ? "pr-10" : ""}`}
                          disabled={isEmailVerified}
                        />
                        {isEmailVerified && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      {isEmailVerified && <p className="text-sm text-green-600">Email verified ✓</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                      />
                    </div>
                    
                    {formData.role === 'admin' && (
                      <div className="space-y-2">
                        <Label htmlFor="adminCode" className="text-gray-700">Admin Code</Label>
                        <Input
                          id="adminCode"
                          name="adminCode"
                          type="password"
                          value={formData.adminCode}
                          onChange={handleChange}
                          placeholder="Enter admin code"
                          required
                          className="border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                        />
                      </div>
                    )}
                  </>
                )}

                {formData.role !== 'institution' && (
                  <Button 
                    type="submit" 
                    className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-3" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Creating Account...' : isEmailVerified ? 'Sign Up' : 'Verify Email & Sign Up'}
                  </Button>
                )}
              </form>
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Button
                    variant="link"
                    className="p-0 text-gray-700 hover:text-gray-800 font-semibold"
                    onClick={() => {
                      if (requiredRole) {
                        navigate('/login', { 
                          state: { from: redirectPath, requiredRole } 
                        });
                      } else {
                        navigate('/login');
                      }
                    }}
                  >
                    Login
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* OTP Verification Modal */}
      {renderOTPVerification()}
    </div>
  );
};

export default SignupForm;