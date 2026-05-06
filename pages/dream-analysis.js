import { useState } from 'react';
import axios from 'axios';
import { Moon, Sparkles, Send, Clover } from 'lucide-react';

export default function DreamAnalysis() {
  const [dreamText, setDreamText] = useState('');
  const [lastSearchedText, setLastSearchedText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dreamText.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/dream', { dreamText });
      setResult(res.data);
      setLastSearchedText(dreamText);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-brand-purple-dark">วิเคราะห์ความฝัน</h1>
      </div>

      <div className="max-w-2xl mx-auto glass-panel p-6 md:p-8 border-t-4 border-t-brand-purple-main">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-gray-800 focus:outline-none focus:border-brand-purple-main focus:ring-1 focus:ring-brand-purple-main transition"
            placeholder="เช่น งูเลื้อยเข้าบ้าน..."
            value={dreamText}
            onChange={(e) => setDreamText(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !dreamText.trim() || dreamText.trim() === lastSearchedText.trim()}
            className="btn-primary px-6 flex items-center justify-center whitespace-nowrap disabled:opacity-50"
          >
            {loading ? '...' : 'ดูคำทำนายเลข!'}
          </button>
        </form>

        {result && (
          <div className="mt-8 bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm animate-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="w-full md:w-1/3 bg-gray-50 rounded-lg p-4 shadow-sm flex items-center justify-center h-32 border border-gray-100">
                <Moon className="text-brand-purple-main" size={64} />
              </div>
              <div className="w-full md:w-2/3 space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center text-xl">
                   ผลทำนายความฝัน : <br/>
                   <span className="text-2xl font-black text-brand-purple-main ml-2">{dreamText}</span>
                </h3>
                
                <div className="flex gap-3 flex-wrap">
                  {result.luckyNumbers.twoDigit.map((num, i) => (
                    <span key={i} className="bg-white text-gray-900 border-2 border-gray-200 px-5 py-2 rounded-full font-black text-2xl shadow-sm">{num}</span>
                  ))}
                  {result.luckyNumbers.threeDigit.map((num, i) => (
                    <span key={i} className="bg-brand-gold text-gray-900 px-5 py-2 rounded-full font-black text-2xl shadow-sm">{num}</span>
                  ))}
                </div>
                
                <p className="text-base text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 font-medium">
                  ตามความเชื่อโบราณ ฝันว่า {dreamText} มักจะตีเป็นเลขเด็ด {result.luckyNumbers.twoDigit.join(', ')} หรือเลขซ้ำอย่าง {result.luckyNumbers.threeDigit.join(', ')} ครับ
                </p>
              </div>
            </div>

            <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-4 flex items-center space-x-3">
               <Clover className="text-green-500 flex-shrink-0" size={20} />
               <p className="text-sm text-green-800">
                 <span className="font-bold mr-2">คำทำนายเพิ่ม:</span> {result.meaning}
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
