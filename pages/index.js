import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Clover, Search, TrendingUp } from 'lucide-react';

export default function Home() {
  const [latestResult, setLatestResult] = useState(null);
  const [trendingData, setTrendingData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('/api/results');
        setLatestResult(res.data.latest);

        try {
          const trendingRes = await axios.get('/api/trending');
          setTrendingData(trendingRes.data);
        } catch (e) {
          console.error("Failed to fetch trending", e);
        }

        try {
          const newsRes = await axios.get('/api/news');
          setNewsData(newsRes.data);
        } catch (e) {
          console.error("Failed to fetch news", e);
        }
      } catch (error) {
        console.error("Failed to fetch results", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-[#EADDFF] to-[#F4F0FA] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between border border-white shadow-sm overflow-hidden relative">
        <div className="md:w-1/2 z-10 space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-purple-dark leading-tight">
            ค้นหาเลขเด็ด ง่าย สะดวก <br />
            และแม่นยำ กับ <span className="text-brand-purple-main">ChokDee.com</span>
          </h1>
          <Link href="/analytics">
            <button className="btn-primary px-8 py-3 mt-4 text-lg">
              เริ่มหาเลขเด็ดเลย!
            </button>
          </Link>
        </div>
        <div className="md:w-1/2 relative mt-8 md:mt-0 z-10 flex justify-end">
          {/* Mockup Illustration placeholder */}
          <div className="w-full max-w-sm bg-white/50 backdrop-blur-xl rounded-2xl p-4 border border-white shadow-lg transform rotate-2">
            <div className="bg-brand-purple-main text-white text-sm rounded-t-xl p-2 flex justify-between">
              <span>เลขเด่นแนะนำ</span>
              <span className="text-xs">x</span>
            </div>
            <div className="bg-white p-4 rounded-b-xl space-y-3">
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <Clover className="text-green-500" size={20} /> <span className="font-bold text-lg">28</span> <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-yellow-500">⭐</span> <span className="font-bold text-lg">45</span> <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-purple-400">🔥</span> <span className="font-bold text-lg">67</span> <span className="w-4 h-4 bg-yellow-400 rounded-full"></span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-48 w-64 h-64 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </section>

      {/* Latest Draw Section */}
      <section className="glass-panel p-6 overflow-hidden">
        <h2 className="text-xl font-bold mb-4 flex items-center text-brand-purple-dark">
          <Clover className="text-green-500 mr-2" size={24} />
          ผลสลากกินแบ่งรัฐบาล งวดล่าสุด
        </h2>

        {loading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
          </div>
        ) : latestResult ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Prize */}
            <div className="bg-brand-purple-main text-white rounded-xl p-6 flex flex-col justify-center items-center text-center shadow-lg">
              <p className="text-white/80 text-sm mb-1 font-bold">รางวัลที่ 1</p>
              <p className="text-6xl font-black tracking-widest mb-1">{latestResult.prizes.first}</p>
              <p className="text-sm text-white/80 font-medium">งวดวันที่ {latestResult.date}</p>
            </div>
            
            {/* Front & Last 3 Digits */}
            <div className="bg-white rounded-xl p-6 flex flex-col justify-center items-center text-center border-2 border-purple-100 shadow-sm">
              <p className="text-gray-600 text-sm mb-2 font-bold">เลขหน้า / ท้าย 3 ตัว</p>
              <div className="flex space-x-6">
                <div>
                  <p className="text-4xl font-black text-gray-900">{latestResult.prizes.threeDigitFirst.join(' ')}</p>
                </div>
              </div>
              <div className="flex space-x-6 mt-2">
                <div>
                  <p className="text-4xl font-black text-gray-900">{latestResult.prizes.threeDigitLast.join(' ')}</p>
                </div>
              </div>
            </div>

            {/* 2 Digits */}
            <div className="bg-white rounded-xl p-6 flex flex-col justify-center items-center text-center border-2 border-purple-100 shadow-sm">
              <p className="text-gray-600 text-sm mb-2 font-bold">เลขท้าย 2 ตัว</p>
              <p className="text-6xl font-black text-gray-900">{latestResult.prizes.twoDigit}</p>
            </div>
          </div>
        ) : (
          <p>ไม่สามารถดึงข้อมูลได้</p>
        )}
      </section>

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* News & Updates */}
        <div className="md:col-span-2 glass-panel p-6">
          <h3 className="text-lg font-bold mb-4 text-brand-purple-dark flex items-center">
             ข่าวเลขเด็ดวันนี้
          </h3>
          <div className="space-y-4">
             {newsData.length > 0 && (
               <>
                 <a href={newsData[0].url} target="_blank" rel="noopener noreferrer" className="block relative rounded-xl overflow-hidden group cursor-pointer shadow-sm">
                    <div className="h-48 bg-gray-200 w-full overflow-hidden">
                      <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url('${newsData[0].image}')`}}></div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-4 pt-12">
                      <h4 className="text-white font-bold text-lg">{newsData[0].title}</h4>
                    </div>
                 </a>
                 
                 <div className="grid grid-cols-2 gap-4">
                    {newsData.slice(1, 3).map((news, i) => (
                      <a key={i} href={news.url} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-100 rounded-lg cursor-pointer group shadow-sm overflow-hidden block">
                         <div className="h-24 bg-gray-200 mb-2 overflow-hidden">
                           <div className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500" style={{backgroundImage: `url('${news.image}')`}}></div>
                         </div>
                         <h5 className="text-sm font-bold text-gray-900 line-clamp-2 p-2">{news.title}</h5>
                      </a>
                    ))}
                 </div>
               </>
             )}
          </div>
        </div>

        {/* Trending Numbers */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold mb-2 text-brand-purple-dark">แนวโน้มเลขมาแรง</h3>
          <p className="text-xs text-gray-500 mb-4">อัปเดตสถิติเลขที่มีคนค้นหามากที่สุด</p>
          
          <div className="space-y-4">
             {trendingData.length >= 4 && (
               <>
                 <div className="bg-brand-purple-light rounded-lg p-3 flex justify-between items-center border border-purple-100">
                   <span className="font-medium text-gray-700 text-sm">อันดับ 1 - 2</span>
                   <div className="flex space-x-2">
                     <span className="bg-brand-purple-main text-white px-3 py-1 rounded text-sm font-bold">{trendingData[0].name}</span>
                     <span className="bg-teal-400 text-white px-3 py-1 rounded text-sm font-bold">{trendingData[1].name}</span>
                   </div>
                 </div>
                 <div className="bg-brand-purple-light rounded-lg p-3 flex justify-between items-center border border-purple-100">
                   <span className="font-medium text-gray-700 text-sm">อันดับ 3 - 4</span>
                   <div className="flex space-x-2">
                     <span className="bg-brand-purple-main text-white px-3 py-1 rounded text-sm font-bold">{trendingData[2].name}</span>
                     <span className="bg-purple-400 text-white px-3 py-1 rounded text-sm font-bold">{trendingData[3].name}</span>
                   </div>
                 </div>
               </>
             )}
             
             {/* Dynamic chart */}
             {trendingData.length > 0 && (
               <div className="mt-6 pt-6 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-3 text-center">กราฟสถิติเลขฮิต</p>
                  <div className="flex justify-evenly px-2">
                    {trendingData.map((item, index) => {
                      const maxCount = trendingData[0]?.count || 1;
                      const percent = Math.max(10, Math.round((item.count / maxCount) * 100));
                      const colors = ['bg-brand-purple-main', 'bg-teal-400', 'bg-purple-400', 'bg-brand-purple-dark', 'bg-teal-300'];
                      return (
                        <div key={`chart-col-${item.name}`} className="flex flex-col items-center">
                          <div className="h-32 flex items-end">
                            <div className={`w-6 ${colors[index % colors.length]} rounded-t-md transition-all duration-1000`} style={{height: `${percent}%`}}></div>
                          </div>
                          <span className="text-xs text-gray-500 font-medium mt-2">{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
