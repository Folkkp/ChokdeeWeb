import { useState, useEffect } from 'react';
import { Clover } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FortuneStick() {
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState(null);

  const [fortunes, setFortunes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFortunes() {
      try {
        const { data, error } = await supabase
          .from('fortunes')
          .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform to match the expected format
          const formattedFortunes = data.map(f => ({
            num: f.number,
            text: f.text,
            lucky: f.lucky_numbers
          }));
          setFortunes(formattedFortunes);
        }
      } catch (err) {
        console.error('Error loading fortunes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFortunes();
  }, []);

  const handleShake = () => {
    if (shaking) return;
    setShaking(true);
    setResult(null);

    // Simulate shaking
    setTimeout(() => {
      // Fallback if no data was loaded
      const dataToUse = fortunes.length > 0 ? fortunes : [
        { num: 99, text: "ระบบกำลังปรับปรุง แต่โชคดีจะมาเยือนคุณแน่นอน", lucky: "99, 09, 909" }
      ];
      const randomIndex = Math.floor(Math.random() * dataToUse.length);
      setResult(dataToUse[randomIndex]);
      setShaking(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-brand-purple-dark">เสี่ยงเซียมซี</h1>
      </div>

      <div className="max-w-md mx-auto">
        <div className="glass-panel p-6 border-t-4 border-t-brand-purple-main relative overflow-hidden text-center">
          
          <button
            onClick={handleShake}
            disabled={shaking || loading}
            className={`btn-primary w-full py-4 text-lg mb-8 ${shaking || loading ? 'opacity-50 cursor-wait' : ''}`}
          >
            {loading ? 'กำลังโหลดข้อมูล...' : shaking ? 'กำลังเสี่ยงเซียมซี...' : 'เสี่ยงเซียมซีโชคดี'}
          </button>
          
          <div className="bg-brand-purple-light rounded-xl p-6 border border-purple-100 flex flex-col items-center justify-center min-h-[200px] mb-4">
             {/* Simple visual of fortune stick container */}
             <div className={`relative w-24 h-32 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-b-xl rounded-t shadow-lg border-t-4 border-yellow-700 mx-auto mb-4 ${shaking ? 'animate-bounce' : ''}`}>
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
                   <div className="w-1.5 h-12 bg-red-400 rounded-full transform -rotate-12"></div>
                   <div className="w-1.5 h-16 bg-red-500 rounded-full"></div>
                   <div className="w-1.5 h-10 bg-red-600 rounded-full transform rotate-6"></div>
                   <div className="w-1.5 h-14 bg-red-400 rounded-full transform rotate-12"></div>
                </div>
             </div>

             {result && (
               <div className="animate-in zoom-in w-full">
                 <h3 className="text-xl font-bold text-brand-purple-dark mb-4">
                   ผลเซียมซี เลขที่ {result.num}
                 </h3>
               </div>
             )}
          </div>

          {result && (
            <div className="bg-white border-2 border-gray-100 rounded-xl p-5 text-left shadow-md animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center text-green-600 font-bold mb-4 border-b border-gray-100 pb-3 text-lg">
                 <Clover size={24} className="mr-2" />
                 เซียมซีโชคดี เลขที่ {result.num}
               </div>

               <div className="flex gap-3 mb-5">
                 {result.lucky.split(',').map((num, i) => (
                   <span key={i} className={`px-5 py-2 rounded text-xl font-black border-2 ${i === 2 ? 'bg-brand-gold text-gray-900 border-brand-gold-dark' : 'bg-white text-gray-900 border-gray-200'}`}>
                     {num.trim()}
                   </span>
                 ))}
               </div>

               <p className="text-gray-900 font-bold text-lg mb-5">{result.text}</p>

               <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-base text-green-900">
                 <p className="font-bold mb-2">ความหมายของเลขมงคล:</p>
                 <ul className="list-disc pl-5 space-y-1 text-green-800 font-medium">
                   <li>เลขเด่น: <span className="font-bold">{result.lucky}</span></li>
                   <li>{result.text}</li>
                 </ul>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
