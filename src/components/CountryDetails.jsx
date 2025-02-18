import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://visainformationbackend.vercel.app/api'; 

const visaCategories = [
  { key: 'selection1', title: 'Visa Free Destinations', color: 'bg-green-100 text-green-800', countColor: 'bg-green-50' },
  { key: 'selection2', title: 'Visa on Arrival', color: 'bg-blue-100 text-blue-800', countColor: 'bg-blue-50' },
  { key: 'selection3', title: 'eTA Required', color: 'bg-purple-100 text-purple-800', countColor: 'bg-purple-50' },
  { key: 'selection4', title: 'Visa Online', color: 'bg-yellow-100 text-yellow-800', countColor: 'bg-yellow-50' },
  { key: 'selection5', title: 'Visa Required', color: 'bg-red-100 text-red-800', countColor: 'bg-red-50' }
];

const CountryDetails = () => {
  const { country } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(null);
  const [visibleCategories, setVisibleCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const encodedCountry = encodeURIComponent(country);
        const response = await fetch(
          `${API_URL}/countries/${encodedCountry}`
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const jsonData = await response.json();
        setData(jsonData);
        setFilteredData(jsonData);
        setVisibleCategories(visaCategories.map(cat => cat.key));
        setError(null);
      } catch (err) {
        setError(err.message);
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [country, navigate]);

  useEffect(() => {
    if (!data) return;

    const filtered = {
      ...data,
      selection1: data.selection1.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      selection2: data.selection2.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      selection3: data.selection3.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      selection4: data.selection4.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
      selection5: data.selection5.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    };
    setFilteredData(filtered);

    if (searchTerm) {
      const visibleCats = visaCategories
        .map(cat => cat.key)
        .filter(key => filtered[key].length > 0);
      setVisibleCategories(visibleCats);
    } else {
      setVisibleCategories(visaCategories.map(cat => cat.key));
    }
  }, [searchTerm, data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="h-6 sm:h-7 bg-gray-200 rounded-full w-1/3 mb-3 sm:mb-4 animate-pulse" />
              <div className="h-4 sm:h-5 bg-gray-200 rounded-full w-2/3 mb-4 sm:mb-6 animate-pulse" />
              <div className="space-y-2 sm:space-y-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-8 sm:h-10 bg-gray-200 rounded-lg sm:rounded-xl animate-pulse" />
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
          <div className="text-red-600 text-lg sm:text-xl font-semibold">{error}</div>
          <p className="text-gray-600">Redirecting to homepage in 3 seconds...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 inline-block"
          >
            {data.name} Passport
          </motion.h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl">
            Visa Requirements & Travel Access
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            With {data.name} passport you can travel with below types of visas for the following countries
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-2xl mx-auto mb-8 sm:mb-12"
          >
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 shadow-sm hover:shadow-md pl-12 sm:pl-14"
              />
            </div>
          </motion.div>

          {searchTerm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mb-6 sm:mb-8 text-gray-600 text-base sm:text-lg"
            >
              Found {visibleCategories.length} categor{visibleCategories.length === 1 ? 'y' : 'ies'} with matches for
              <span className="font-semibold text-indigo-600 ml-1">"{searchTerm}"</span>
            </motion.div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {visaCategories.map(({ key, title, color, countColor }) => {
              const count = filteredData[key]?.length || 0;
              if (!visibleCategories.includes(key)) return null;
              
              return (
                <motion.article
                  key={key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 p-4 sm:p-6 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-50 pointer-events-none" />
                  
                  <div className="flex items-center justify-between mb-4 sm:mb-6 relative">
                    <h2 className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ${color} text-xs sm:text-sm font-medium inline-block`}>
                      {title}
                    </h2>
                    <div className={`${countColor} px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium`}>
                      {count} {count === 1 ? 'Country' : 'Destinations'}
                    </div>
                  </div>
                  
                  <div className="h-64 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      <AnimatePresence>
                        {filteredData[key]?.map((item, index) => (
                          <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl text-gray-700 text-sm sm:text-base font-medium hover:bg-gray-100 transition-colors"
                          >
                            {item.name}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {(!filteredData[key] || filteredData[key].length === 0) && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-gray-400 italic text-center py-4 text-sm sm:text-base"
                        >
                          No countries found
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 3px;
        }
      `}</style>
    </motion.section>
  );
};

export default CountryDetails;