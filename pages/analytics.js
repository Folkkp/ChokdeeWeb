import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Clover } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Analytics() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [trendingData, setTrendingData] = useState([]);

  useEffect(() => {
    const fetchHistorical = async () => {
      try {
        const res = await axios.get('/api/results');
        const data = res.data.historical;
        
        const freq = {};
        data.forEach(draw => {
          const num = draw.prizes.twoDigit;
          freq[num] = (freq[num] || 0) + 1;
        });

        const sorted = Object.entries(freq)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 15);
          
        setChartData(sorted);

        try {
          const trendingRes = await axios.get('/api/trending');
          setTrendingData(trendingRes.data);
        } catch (err) {
          console.error("Failed to fetch trending data", err);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistorical();
  }, []);

  const handleDigitChange = (index, value) => {
    // Only allow single digit or empty
    if (!/^\d*$/.test(value)) return;
    const val = value.slice(-1); // Take only the last typed char

    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);

    // Auto-advance focus
    if (val && index < 5) {
      document.getElementById(`digit-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace auto-focus
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      document.getElementById(`digit-${index - 1}`)?.focus();
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const pattern = digits.map(d => d || '_').join('');
    // Ensure they entered at least one digit
    if (pattern === '______') return;
    
    setLoading(true);
    try {
      const res = await axios.get(`/api/search?pattern=${pattern}`);
      setSearchResult(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Header matching mockup style */}
      <div className="bg-brand-purple-light rounded-xl p-4 flex items-center space-x-3 mb-6 shadow-sm border border-purple-100">
         <Clover className="text-green-500" size={24} />
         <h1 className="text-xl font-bold text-brand-purple-dark">ค้นหาเลขเด็ด</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Search Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-bold text-gray-800 mb-4 text-center">กรอกตัวเลขที่ต้องการค้นหา (เว้นว่างได้)</h3>
            <form onSubmit={handleSearch} className="flex flex-col items-center gap-6">
              <div className="flex gap-2 justify-center w-full">
                {digits.map((digit, index) => (
                  <input 
                    key={index}
                    id={`digit-${index}`}
                    type="text"
                    inputMode="numeric"
                    className="w-12 h-16 md:w-16 md:h-20 bg-white border-2 border-gray-200 rounded-lg text-center text-3xl font-black text-gray-900 focus:outline-none focus:border-brand-gold-dark focus:ring-1 focus:ring-brand-gold-dark transition shadow-sm"
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                  />
                ))}
              </div>
              <button 
                type="submit" 
                disabled={loading || digits.join('') === ''}
                className="btn-primary py-3 px-12 text-lg rounded-full disabled:opacity-50 flex items-center justify-center shadow-md w-full max-w-xs"
              >
                {loading ? 'กำลังค้นหา...' : <><Search size={20} className="mr-2" /> ค้นหาสถิติ</>}
              </button>
            </form>
          </div>

          {/* Search Results */}
          {searchResult && (
            <div className="glass-panel p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-brand-gold text-gray-900 px-6 py-2 rounded-lg flex items-center justify-center text-3xl font-black shadow-md tracking-widest">
                    {searchResult.pattern.replace(/_/g, '-')}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">ผลการค้นหาสถิติ</h3>
                    <p className="text-gray-600 font-medium">พบการออกรางวัล {searchResult.matchCount} ครั้ง</p>
                  </div>
                </div>
              </div>

              {searchResult.matchCount > 0 ? (
                <div className="space-y-3">
                  {searchResult.matches.map((match, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg border-2 border-gray-100 hover:border-brand-purple-main transition shadow-sm space-y-2">
                      <div className="flex items-center space-x-2 border-b border-gray-100 pb-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-brand-purple-main"></div>
                        <span className="font-bold text-gray-900">{match.date}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                         <div>
                            <p className="text-xs text-gray-500 font-bold mb-1">รางวัลที่ 1</p>
                            <p className="font-black text-brand-purple-main text-lg">{match.prizes.first}</p>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500 font-bold mb-1">เลขท้าย 2 ตัว</p>
                            <p className="font-black text-brand-gold-dark text-lg">{match.prizes.twoDigit}</p>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500 font-bold mb-1">เลขหน้า 3 ตัว</p>
                            <p className="font-bold text-gray-800">{match.prizes.threeDigitFirst.join(' / ')}</p>
                         </div>
                         <div>
                            <p className="text-xs text-gray-500 font-bold mb-1">เลขท้าย 3 ตัว</p>
                            <p className="font-bold text-gray-800">{match.prizes.threeDigitLast.join(' / ')}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 font-medium text-lg">ไม่พบสถิติการออกรางวัลของเลขนี้ใน 100 งวดล่าสุด</div>
              )}
            </div>
          )}

          {/* Big Chart */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-bold mb-2 flex items-center text-brand-purple-dark">
              <Clover className="text-green-500 mr-2" size={20} />
              สถิติเลขท้าย 2 ตัวที่ออกบ่อย
            </h2>
            <p className="text-xs text-gray-500 mb-6">อ้างอิงจากสถิติย้อนหลัง 100 งวดล่าสุด</p>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#F4F0FA' }}
                    contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="count" name="จำนวนครั้ง" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        index === 0 ? '#8B5CF6' : 
                        index === 1 ? '#2DD4BF' : 
                        index === 2 ? '#A78BFA' : 
                        index === 3 ? '#5EEAD4' : '#E2E8F0'
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <div className="glass-panel p-6">
             <h3 className="font-bold text-gray-800 mb-4">แนวโน้มเลขมาแรง</h3>
             <p className="text-xs text-gray-500 mb-4">สัดส่วนการค้นหาเลขฮิตในงวดนี้</p>
             <div className="space-y-4">
                {trendingData.slice(0, 3).map((item, index) => {
                  const maxCount = trendingData[0]?.count || 1;
                  const percent = Math.max(10, Math.round((item.count / maxCount) * 100));
                  const colors = [
                    { bg: 'bg-teal-400', bar: 'bg-gray-100' },
                    { bg: 'bg-brand-purple-main', bar: 'bg-gray-100' },
                    { bg: 'bg-purple-300', bar: 'bg-gray-100' }
                  ];
                  const color = colors[index] || colors[0];
                  
                  return (
                    <div key={`trend-${item.name}`} className="flex items-center space-x-3">
                      <div className={`flex-1 ${color.bar} rounded-full h-3 overflow-hidden`}>
                        <div className={`${color.bg} h-full rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                      </div>
                      <span className="font-bold text-gray-700 w-6 text-right">{item.name}</span>
                    </div>
                  );
                })}
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
