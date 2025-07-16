// src/components/auth/LoginForm.jsx - Updated with shadcn/ui components
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, Mail, Lock, User, Building2 } from 'lucide-react';
import api from '../../../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'aspirant'
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const redirectPath = location.state?.from || '/';
  const requiredRole = location.state?.requiredRole;
  const currentRole = location.state?.currentRole;
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      if (!requiredRole || role === requiredRole) {
        if (redirectPath !== '/') {
          navigate(redirectPath);
        } else if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'institution') {
          navigate('/institution/dashboard');
        } else {
          navigate('/aspirant/dashboard');
        }
      }
    }
  }, [navigate, redirectPath, requiredRole]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/auth/login', formData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      
      // Handle institution verification requirement
      if (response.data.requiresVerification) {
        setError('Your institution account is pending verification. Please wait for admin approval.');
        setLoading(false);
        return;
      }
      
      // Handle deactivated accounts
      if (response.data.isDeactivated) {
        setError('Your account has been deactivated. Please contact support.');
        setLoading(false);
        return;
      }
      
      const { token, role, userId } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);
      
      // Update API default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Dispatch auth change event to update Navbar
      window.dispatchEvent(new Event('authChange'));
      
      // Navigate based on role and requirements
      if (requiredRole && role !== requiredRole) {
        setError(`This area requires ${requiredRole} access. You are logged in as ${role}.`);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        delete api.defaults.headers.common['Authorization'];
        window.dispatchEvent(new Event('authChange'));
        setLoading(false);
        return;
      }
      
      // Navigate to appropriate dashboard
      if (redirectPath !== '/' && (!requiredRole || role === requiredRole)) {
        navigate(redirectPath);
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'institution') {
        navigate('/institution/dashboard');
      } else {
        navigate('/aspirant/dashboard');
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl bg-white">
        <CardHeader className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-center p-6">
          <CardTitle className="text-2xl font-bold">Login to Civils HQ</CardTitle>
          <CardDescription className="text-gray-200 mt-2">
            Access your dashboard and continue learning
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Show role-specific messages */}
          {requiredRole && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                {currentRole ? 
                  `You need to login as ${requiredRole} to access this page. You are currently logged in as ${currentRole}.` :
                  `Please login as ${requiredRole} to access this page.`
                }
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">I am a</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full border-gray-300 focus:border-gray-700 focus:ring-gray-700">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aspirant">Aspirant</SelectItem>
                  <SelectItem value="institution">Institution</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="pl-10 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="pl-10 pr-10 border-gray-300 focus:border-gray-700 focus:ring-gray-700"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-4 w-4 text-gray-500" /> : 
                    <Eye className="h-4 w-4 text-gray-500" />
                  }
                </Button>
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-gray-700 hover:bg-gray-800 text-white font-semibold py-6 text-base" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Button
                variant="link"
                className="p-0 text-gray-700 hover:text-gray-800 font-semibold"
                onClick={(e) => {
                  if (requiredRole) {
                    navigate('/signup', { 
                      state: { from: redirectPath, requiredRole } 
                    });
                  } else {
                    navigate('/signup');
                  }
                }}
              >
                Sign Up
              </Button>
            </p>
          </div>
          
          {/* Institution Note */}
          {formData.role === 'institution' && (
            <Alert className="mt-6 bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <span className="font-medium">Note for Institutions:</span> After signup, your account 
                will need to be verified by our admin team before you can access the dashboard. 
                This usually takes 24-48 hours.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;