import { useEffect, useState } from 'react';
import { Check, Clover, Landmark, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FortuneStick() {
  const [temples, setTemples] = useState([]);
  const [fortunes, setFortunes] = useState([]);
  const [selectedTempleId, setSelectedTempleId] = useState('');
  const [selectedTemple, setSelectedTemple] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingTemples, setLoadingTemples] = useState(true);
  const [loadingFortunes, setLoadingFortunes] = useState(false);
  const [setupError, setSetupError] = useState('');

  useEffect(() => {
    async function loadTemples() {
      setLoadingTemples(true);
      setSetupError('');

      const { data, error } = await supabase
        .from('fortune_temples')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        setSetupError(
          'ยังไม่พบตาราง fortune_temples ใน Supabase กรุณารัน SQL migration และ seed ข้อมูลเซียมซีแยกวัดก่อน'
        );
        setTemples([]);
        setLoadingTemples(false);
        return;
      }

      if (!data || data.length === 0) {
        setSetupError('ยังไม่มีข้อมูลวัดใน Supabase กรุณารัน npm run seed:temple-fortunes');
        setTemples([]);
        setLoadingTemples(false);
        return;
      }

      setTemples(data);
      setSelectedTempleId(data[0].id);
      setSelectedTemple(data[0]);
      setLoadingTemples(false);
    }

    loadTemples();
  }, []);

  useEffect(() => {
    async function loadFortunes() {
      if (!selectedTempleId) return;

      setLoadingFortunes(true);
      setResult(null);
      setSetupError('');

      const { data, error } = await supabase
        .from('fortune_sticks')
        .select('*')
        .eq('temple_id', selectedTempleId)
        .order('number', { ascending: true });

      if (error) {
        setSetupError(
          'ยังไม่พบตาราง fortune_sticks ใน Supabase กรุณารัน SQL migration และ seed ข้อมูลเซียมซีแยกวัดก่อน'
        );
        setFortunes([]);
        setLoadingFortunes(false);
        return;
      }

      if (!data || data.length === 0) {
        setSetupError('วัดนี้ยังไม่มีใบเซียมซีใน Supabase กรุณารัน npm run seed:temple-fortunes');
        setFortunes([]);
        setLoadingFortunes(false);
        return;
      }

      setFortunes(data);
      setLoadingFortunes(false);
    }

    loadFortunes();
  }, [selectedTempleId]);

  const handleTempleChange = (temple) => {
    if (shaking) return;
    setSelectedTempleId(temple.id);
    setSelectedTemple(temple);
  };

  const handleShake = () => {
    if (shaking || loadingFortunes || fortunes.length === 0) return;

    setShaking(true);
    setResult(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * fortunes.length);
      setResult(fortunes[randomIndex]);
      setShaking(false);
    }, 1500);
  };

  const isLoading = loadingTemples || loadingFortunes;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-brand-purple-dark">เสี่ยงเซียมซี</h1>
        <p className="text-sm font-medium text-gray-500">
          เลือกวัดหรือศาลเจ้าที่ต้องการตั้งจิตอธิษฐานก่อนเสี่ยงทาย
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="glass-panel p-5 md:p-6 border-t-4 border-t-brand-purple-main relative overflow-hidden">
          {setupError && (
            <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-6 text-amber-900">
              {setupError}
            </div>
          )}

          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-brand-purple-dark">
              <Landmark size={20} />
              <h2 className="text-lg font-bold">เลือกสถานที่ศักดิ์สิทธิ์</h2>
            </div>

            {loadingTemples ? (
              <div className="rounded-lg border border-gray-200 bg-white p-5 text-center text-sm font-semibold text-gray-500">
                กำลังโหลดรายชื่อวัดจาก Supabase...
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {temples.map((temple) => {
                  const isSelected = temple.id === selectedTempleId;

                  return (
                    <button
                      key={temple.id}
                      type="button"
                      onClick={() => handleTempleChange(temple)}
                      disabled={shaking}
                      className={`group min-h-[104px] rounded-lg border p-4 text-left transition ${
                        isSelected
                          ? 'border-brand-purple-main bg-brand-purple-light shadow-sm'
                          : 'border-gray-200 bg-white hover:border-brand-purple-main hover:bg-purple-50'
                      } ${shaking ? 'cursor-wait opacity-70' : ''}`}
                      aria-pressed={isSelected}
                    >
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <span className="font-bold leading-6 text-gray-950">{temple.name}</span>
                        <span
                          className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-brand-purple-main bg-brand-purple-main text-white'
                              : 'border-gray-200 text-transparent group-hover:border-brand-purple-main'
                          }`}
                        >
                          <Check size={14} />
                        </span>
                      </div>
                      <div className="mb-2 flex items-center gap-1 text-xs font-semibold text-gray-500">
                        <MapPin size={14} />
                        {temple.location}
                      </div>
                      <p className="text-sm leading-6 text-gray-600">{temple.sacred_focus}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-brand-purple-light p-5 text-center border border-purple-100">
            <div className="mb-4 rounded-lg bg-white/80 p-4 text-left border border-purple-100">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-purple-main">
                กำลังตั้งจิตถึง
              </p>
              <p className="mt-1 text-lg font-black text-brand-purple-dark">
                {selectedTemple?.name || 'กรุณาเลือกวัด'}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {selectedTemple?.sacred_focus || 'ข้อมูลวัดจะถูกโหลดจาก Supabase'}
              </p>
            </div>

            <button
              onClick={handleShake}
              disabled={shaking || isLoading || fortunes.length === 0}
              className={`btn-primary w-full py-4 text-lg mb-8 ${
                shaking || isLoading || fortunes.length === 0 ? 'opacity-50 cursor-wait' : ''
              }`}
            >
              {isLoading
                ? 'กำลังโหลดข้อมูลเซียมซี...'
                : shaking
                  ? 'กำลังเสี่ยงเซียมซี...'
                  : 'เสี่ยงเซียมซีโชคดี'}
            </button>

            <div className="flex flex-col items-center justify-center min-h-[180px]">
              <div
                className={`relative w-24 h-32 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-b-xl rounded-t shadow-lg border-t-4 border-yellow-700 mx-auto mb-4 ${
                  shaking ? 'animate-bounce' : ''
                }`}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  <div className="w-1.5 h-12 bg-red-400 rounded-full transform -rotate-12"></div>
                  <div className="w-1.5 h-16 bg-red-500 rounded-full"></div>
                  <div className="w-1.5 h-10 bg-red-600 rounded-full transform rotate-6"></div>
                  <div className="w-1.5 h-14 bg-red-400 rounded-full transform rotate-12"></div>
                </div>
              </div>

              {result && (
                <div className="animate-in zoom-in w-full">
                  <p className="text-sm font-bold text-brand-purple-main">{selectedTemple?.name}</p>
                  <h3 className="text-xl font-bold text-brand-purple-dark mt-1">
                    ผลเซียมซี เลขที่ {result.number}
                  </h3>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="mt-5 bg-white border-2 border-gray-100 rounded-xl p-5 text-left shadow-md animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-start text-green-600 font-bold mb-4 border-b border-gray-100 pb-3 text-lg">
                <Clover size={24} className="mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p>เซียมซีโชคดี เลขที่ {result.number}</p>
                  <p className="text-sm font-semibold text-gray-500">{selectedTemple?.name}</p>
                </div>
              </div>

              <div className="flex gap-3 mb-5 flex-wrap">
                {result.lucky_numbers.split(',').map((num, i) => (
                  <span
                    key={`${num}-${i}`}
                    className={`px-5 py-2 rounded text-xl font-black border-2 ${
                      i === 2
                        ? 'bg-brand-gold text-gray-900 border-brand-gold-dark'
                        : 'bg-white text-gray-900 border-gray-200'
                    }`}
                  >
                    {num.trim()}
                  </span>
                ))}
              </div>

              <p className="text-gray-900 font-bold text-lg leading-8 mb-5">{result.text}</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-base text-green-900">
                <p className="font-bold mb-2">แหล่งข้อมูล:</p>
                <a
                  className="font-semibold text-green-800 underline decoration-green-300 underline-offset-4"
                  href={result.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  อ้างอิงรายชื่อชุดเซียมซีจาก MyHora สำหรับ {selectedTemple?.name}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
