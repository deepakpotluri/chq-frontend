// App.jsx
import React, { useState, useEffect } from 'react';

// This will automatically use the production URL when deployed to Vercel
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://visainformationbackend.vercel.app/api'; // Replace with your actual backend URL

function App() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [visaInfo, setVisaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_URL}/countries`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data);
    } catch (err) {
      setError('Failed to load countries');
      console.error('Error:', err);
    }
  };

  const handleCheckVisaInfo = async () => {
    if (!selectedCountry) {
      setError('Please select a country');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/visa-info/${encodeURIComponent(selectedCountry)}`);
      if (!response.ok) throw new Error('Failed to fetch visa information');
      const data = await response.json();
      setVisaInfo(data);
    } catch (err) {
      setError('Failed to load visa information');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const VisaCategory = ({ title, countries, icon, bgColor }) => {
    if (!countries || countries.length === 0) return null;

    return (
      <div className={`mb-4 p-4 rounded-lg ${bgColor}`}>
        <div className="flex items-center gap-2 mb-2">
          <span>{icon}</span>
          <h3 className="font-bold">{title}</h3>
        </div>
        <div className="bg-white p-3 rounded-lg max-h-40 overflow-y-auto">
          <ul>
            {countries.map((country, index) => (
              <li key={index} className="mb-1">{country}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Visa Requirements Checker
      </h1>

      <div className="flex gap-4 mb-6">
        <select
          className="flex-1 p-2 border rounded"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          <option value="">Select your passport</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <button
          onClick={handleCheckVisaInfo}
          disabled={loading || !selectedCountry}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          {loading ? 'Loading...' : 'Check'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {visaInfo && (
        <div className="space-y-4">
          <VisaCategory
            title="Visa Free Access"
            countries={visaInfo.visaFree}
            icon="🌟"
            bgColor="bg-green-100"
          />
          <VisaCategory
            title="Visa on Arrival"
            countries={visaInfo.visaOnArrival}
            icon="✈️"
            bgColor="bg-blue-100"
          />
          <VisaCategory
            title="eTA Required"
            countries={visaInfo.eTA}
            icon="🔷"
            bgColor="bg-purple-100"
          />
          <VisaCategory
            title="Online Visa Required"
            countries={visaInfo.visaOnline}
            icon="💻"
            bgColor="bg-orange-100"
          />
          <VisaCategory
            title="Visa Required"
            countries={visaInfo.visaRequired}
            icon="📝"
            bgColor="bg-red-100"
          />
        </div>
      )}
    </div>
  );
}

export default App;