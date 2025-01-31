import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';


const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://visainformationbackend.vercel.app/api'; 

const PassportRankings = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await axios.get(`${API_URL}/rankings`);
        setRankings(response.data);
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load rankings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const handleCountryClick = (country) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      navigate(`/country/${encodeURIComponent(country)}`);
    }, 300);
  };

  const filteredRankings = rankings.filter(rankData =>
    rankData.countries.some(country =>
      country.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-1/3 mb-4 animate-pulse" />
              <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-2/3 mb-6 animate-pulse" />
              <div className="space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div
                    key={j}
                    className="h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-4"
      >
        <div className="max-w-md text-center space-y-4">
          <div className="text-red-600 text-xl font-semibold">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Reload Page
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 inline-block"
          >
            Global Passport Power Rank
          </motion.h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
            Discover the strength of passports worldwide based on visa-free access
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative group">
            <input
              type="text"
              placeholder="Search countries (e.g. 'India', 'Germany')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-xl group-focus-within:bg-indigo-600 transition-colors">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8 text-gray-600 text-lg"
          >
            Found {filteredRankings.length} result{filteredRankings.length !== 1 ? 's' : ''}
            {filteredRankings.length > 0 ? ' for ' : ''}
            {filteredRankings.length > 0 && (
              <span className="font-semibold text-indigo-600">"{searchQuery}"</span>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRankings.length > 0 ? (
              filteredRankings.map((rankData) => (
                <motion.article
                  key={`rank-${rankData.rank}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 p-6 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-50 pointer-events-none" />

                  <div className="flex items-start justify-between mb-6 relative">
                    <div className="space-y-1">
                      <span className="text-2xl font-bold text-gray-900">
                        #{rankData.rank}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg
                          className="w-5 h-5 text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          />
                        </svg>
                        <span>
                          {rankData.visa_free_destinations} visa-free destinations
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative">
                    {rankData.countries.map((country) => {
                      const lowerCountry = country.toLowerCase();
                      const lowerQuery = searchQuery.toLowerCase();
                      const matchIndex = lowerCountry.indexOf(lowerQuery);

                      return (
                        <motion.button
                          key={`country-${rankData.rank}-${country}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCountryClick(country)}
                          className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 text-gray-700 font-medium flex items-center gap-3 group"
                        >
                          {matchIndex === -1 ? (
                            country
                          ) : (
                            <>
                              {country.slice(0, matchIndex)}
                              <span className="text-indigo-600 underline">
                                {country.slice(matchIndex, matchIndex + searchQuery.length)}
                              </span>
                              {country.slice(matchIndex + searchQuery.length)}
                            </>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.article>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <div className="text-gray-600 text-xl">
                  {searchQuery
                    ? "No countries found matching your search"
                    : "No rankings available at the moment"}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};

export default PassportRankings;