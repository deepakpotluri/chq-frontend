import React, { useState, useEffect } from 'react';

const VisaInformation = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [visaInfo, setVisaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the API base URL from environment variables
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/countries`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      const data = await response.json();
      setCountries(data);
    } catch (err) {
      setError('Failed to load countries');
      console.error('Error fetching countries:', err);
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
      const response = await fetch(`${API_BASE_URL}/visa-info/${encodeURIComponent(selectedCountry)}`);
      if (!response.ok) throw new Error('Failed to fetch visa information');
      const data = await response.json();
      setVisaInfo(data);
    } catch (err) {
      setError('Failed to load visa information');
      console.error('Error fetching visa info:', err);
    } finally {
      setLoading(false);
    }
  };

  const VisaCategory = ({ title, countries, icon, bgColor, textColor }) => {
    if (!countries || countries.length === 0) return null;

    return (
      <div
        className={`mb-4 rounded-md shadow-md p-4 ${bgColor} border border-gray-200 w-full sm:w-2/3 lg:w-1/2 mx-auto`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{icon}</span>
          <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
        </div>
        <div className="bg-white p-3 rounded-md shadow-sm h-32 overflow-y-scroll">
          <ul className="space-y-1">
            {countries.map((country, index) => (
              <li key={index} className="text-base font-medium text-gray-800">
                {country}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Visa Requirements Check</h1>
        <p className="text-gray-600">
          Select your passport to see visa requirements for different countries
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          className="flex-1 p-2 border rounded-md shadow-sm bg-white"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          <option value="">Select your passport</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        <button
          onClick={handleCheckVisaInfo}
          disabled={loading || !selectedCountry}
          className={`px-4 py-2 rounded-md text-white flex items-center justify-center gap-2 
            ${loading || !selectedCountry ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {loading ? (
            <span className="animate-spin">🔄</span>
          ) : (
            <span>🌎</span>
          )}
          Check Requirements
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {visaInfo && !loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-blue-500 text-2xl">🌍</span>
            <h2 className="text-xl font-semibold">{selectedCountry} Passport Visa Requirements</h2>
          </div>

          <VisaCategory
            title="Visa Free Access"
            countries={visaInfo.visaFree}
            icon="🌟"
            bgColor="bg-green-50"
            textColor="text-green-800"
          />
          <VisaCategory
            title="Visa on Arrival"
            countries={visaInfo.visaOnArrival}
            icon="✈️"
            bgColor="bg-blue-50"
            textColor="text-blue-800"
          />
          <VisaCategory
            title="eTA Required"
            countries={visaInfo.eTA}
            icon="🔷"
            bgColor="bg-purple-50"
            textColor="text-purple-800"
          />
          <VisaCategory
            title="Online Visa Required"
            countries={visaInfo.visaOnline}
            icon="💻"
            bgColor="bg-orange-50"
            textColor="text-orange-800"
          />
          <VisaCategory
            title="Visa Required"
            countries={visaInfo.visaRequired}
            icon="📝"
            bgColor="bg-red-50"
            textColor="text-red-800"
          />
        </div>
      )}
    </div>
  );
};

export default VisaInformation;