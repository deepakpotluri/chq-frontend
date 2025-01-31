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

    // Update visible categories based on search results
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4"
      >
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 text-lg">Loading details...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4"
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-600 text-xl font-semibold">{error}</div>
          <p className="text-gray-600">Redirecting to homepage in 3 seconds...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 inline-block"
          >
            {data.name}
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg md:text-xl"
          >
            Visa Requirements & Travel Access
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto mt-8"
          >
            <div className="relative group">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 shadow-sm hover:shadow-md pl-12"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {visaCategories.map(({ key, title, color, countColor }) => {
              const count = filteredData[key]?.length || 0;
              if (!visibleCategories.includes(key)) return null;
              
              return (
                <motion.section
                  key={key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`px-4 py-2 rounded-lg ${color} text-sm font-medium inline-block`}>
                        {title}
                      </h2>
                      <div className={`${countColor} px-4 py-2 rounded-lg text-sm font-medium`}>
                        {count} {count === 1 ? 'Country' : 'Countries'}
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
                              className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                            >
                              {item.name}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {(!filteredData[key] || filteredData[key].length === 0) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-400 italic text-center py-4"
                          >
                            No entries available
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.section>
              );
            })}
          </AnimatePresence>
        </motion.div>

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
      </div>
    </motion.div>
  );
};

export default CountryDetails;