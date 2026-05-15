import { useMemo, useState } from 'react';
import { Check, Clover, Landmark, MapPin } from 'lucide-react';
import {
  fortuneTemples,
  getFortunesForTemple,
  getTempleById,
} from '../lib/fortuneTempleData';

export default function FortuneStick() {
  const [selectedTempleId, setSelectedTempleId] = useState(fortuneTemples[0].id);
  const [shaking, setShaking] = useState(false);
  const [result, setResult] = useState(null);

  const selectedTemple = useMemo(() => getTempleById(selectedTempleId), [selectedTempleId]);
  const fortunes = useMemo(() => getFortunesForTemple(selectedTempleId), [selectedTempleId]);

  const handleTempleChange = (templeId) => {
    if (shaking) return;
    setSelectedTempleId(templeId);
    setResult(null);
  };

  const handleShake = () => {
    if (shaking) return;

    setShaking(true);
    setResult(null);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * fortunes.length);
      setResult(fortunes[randomIndex]);
      setShaking(false);
    }, 1500);
  };

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
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2 text-brand-purple-dark">
              <Landmark size={20} />
              <h2 className="text-lg font-bold">เลือกสถานที่ศักดิ์สิทธิ์</h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {fortuneTemples.map((temple) => {
                const isSelected = temple.id === selectedTempleId;

                return (
                  <button
                    key={temple.id}
                    type="button"
                    onClick={() => handleTempleChange(temple.id)}
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
                    <p className="text-sm leading-6 text-gray-600">{temple.sacredFocus}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-brand-purple-light p-5 text-center border border-purple-100">
            <div className="mb-4 rounded-lg bg-white/80 p-4 text-left border border-purple-100">
              <p className="text-xs font-bold uppercase tracking-wide text-brand-purple-main">
                กำลังตั้งจิตถึง
              </p>
              <p className="mt-1 text-lg font-black text-brand-purple-dark">
                {selectedTemple.name}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">{selectedTemple.blessing}</p>
            </div>

            <button
              onClick={handleShake}
              disabled={shaking}
              className={`btn-primary w-full py-4 text-lg mb-8 ${shaking ? 'opacity-50 cursor-wait' : ''}`}
            >
              {shaking ? 'กำลังเสี่ยงเซียมซี...' : 'เสี่ยงเซียมซีโชคดี'}
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
                  <p className="text-sm font-bold text-brand-purple-main">{result.templeName}</p>
                  <h3 className="text-xl font-bold text-brand-purple-dark mt-1">
                    ผลเซียมซี เลขที่ {result.num}
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
                  <p>เซียมซีโชคดี เลขที่ {result.num}</p>
                  <p className="text-sm font-semibold text-gray-500">{result.templeName}</p>
                </div>
              </div>

              <div className="flex gap-3 mb-5 flex-wrap">
                {result.lucky.split(',').map((num, i) => (
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
                <p className="font-bold mb-2">ความหมายของเลขมงคล:</p>
                <ul className="list-disc pl-5 space-y-1 text-green-800 font-medium">
                  <li>
                    เลขเด่น: <span className="font-bold">{result.lucky}</span>
                  </li>
                  <li>{selectedTemple.blessing}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
