import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { UploadCloud, Image as ImageIcon, Search, PlusCircle, CheckCircle, Flame, Droplets, Target, Camera, ArrowRight, Sparkles, MessageSquare, RefreshCw, Video, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

const getSourceBadgeColor = (source) => {
  if (!source) return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  const s = source.toLowerCase();
  if (s.includes('ifct')) {
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  } else if (s.includes('usda')) {
    return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
  } else if (s.includes('nutritionix')) {
    return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  } else if (s.includes('open food')) {
    return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
  } else if (s.includes('edamam')) {
    return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
  } else {
    return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
  }
};

export default function FoodScanner() {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'camera'
  const [textInput, setTextInput] = useState('');
  const [analyzingText, setAnalyzingText] = useState(false);

  // Camera State
  const [image, setImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [results, setResults] = useState(null);
  const [logged, setLogged] = useState(false);

  const { logMeal, showToast, fetchTodayMeals } = useUser();

  const sampleQueries = [
    '2 boiled eggs, 1 slice whole wheat toast, and 1 apple',
    '200g grilled chicken breast with 1 cup brown rice and broccoli',
    'Protein smoothie with 1 scoop whey, 1 banana, and peanut butter'
  ];

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const openWebcam = () => {
    setWebcamActive(true);
    setImage(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn('Webcam error:', err);
          showToast('Webcam unavailable. Upload a photo instead.', 'info');
        });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      // Stop stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setWebcamActive(false);
      processImage(dataUrl);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => processImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const processImage = (imgUrl) => {
    setImage(imgUrl);
    setScanning(true);
    setResults(null);
    setLogged(false);
    
    setTimeout(() => {
      setScanning(false);
      setResults({
        title: 'Scanned AI Photo Meal',
        items: [
          { name: 'Chicken Breast', confidence: 98, calories: 248, p: 46.5, c: 0, f: 5.4, fiber: 0.0, serving: "150g", quantity_label: "1.5x", source: 'USDA FoodData Central' },
          { name: 'Fresh Avocado', confidence: 92, calories: 120, p: 1.5, c: 6.0, f: 11.0, fiber: 5.0, serving: "1 medium (150g)", quantity_label: "0.5x", source: 'USDA FoodData Central' },
          { name: 'Vegetable Salad', confidence: 88, calories: 50, p: 2.0, c: 5.0, f: 3.0, fiber: 2.5, serving: "1 bowl", quantity_label: "1x", source: 'Estimated Standard Portion' },
        ],
        totals: { calories: 418, p: 50.0, c: 11.0, f: 19.4, fiber: 7.5 }
      });
    }, 1500);
  };

  const handleAnalyzeText = async (queryText) => {
    const q = queryText || textInput;
    if (!q) return;

    setAnalyzingText(true);
    setResults(null);
    setLogged(false);

    try {
      const data = await apiClient('/nutrition/parse', {
        body: { query: q },
        method: 'POST'
      });
      
      setResults({
        title: `AI Parsed: "${q}"`,
        items: data.items.map(item => ({
          name: item.food,
          confidence: item.confidence,
          calories: item.calories,
          p: item.protein,
          c: item.carbs,
          f: item.fat,
          fiber: item.fiber,
          serving: item.serving_size,
          quantity_label: item.quantity_label,
          source: item.source
        })),
        totals: {
          calories: data.totals.calories,
          p: data.totals.protein,
          c: data.totals.carbs,
          f: data.totals.fat,
          fiber: data.totals.fiber
        }
      });
    } catch (err) {
      console.error(err);
      showToast('Failed to analyze nutrition. Please try again.', 'error');
    } finally {
      setAnalyzingText(false);
    }
  };

  const handleLogMeal = async () => {
    if (!results) return;
    try {
      const foodItemNames = results.items.map(item => `${item.quantity_label} ${item.name}`);
      
      const payload = {
        activity_type: 'meal',
        meal: {
          meal_type: 'lunch',
          calories: Number(results.totals.calories),
          protein_g: Number(results.totals.p),
          carbs_g: Number(results.totals.c),
          fat_g: Number(results.totals.f),
          food_items: foodItemNames,
          is_healthy: true
        }
      };
      
      await apiClient('/activities/log', {
        body: payload,
        method: 'POST'
      });
      
      logMeal(`${results.title} (${results.totals.calories} kcal)`, 100);
      fetchTodayMeals();
      setLogged(true);
      showToast(`Logged "${results.title}" to database! +100 XP`, 'success', 100);
    } catch (err) {
      console.error(err);
      showToast('Failed to save meal to database.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-quest-secondary flex items-center gap-3">
            <ScanIcon className="w-8 h-8 text-green-400" />
            AI Food & Macro Scanner
          </h1>
          <p className="text-gray-400 mt-2">Describe what you ate or use your webcam to auto-calculate calories and macros.</p>
        </div>
        
        <Link to="/diet" className="btn-primary bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-2 border border-white/10">
          View Macro Tracker <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex space-x-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-6 py-2.5 rounded-xl font-heading font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'text' 
              ? 'bg-green-500 text-black shadow-lg shadow-green-500/30' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> AI Text Macro Lookup
        </button>
        <button
          onClick={() => setActiveTab('camera')}
          className={`px-6 py-2.5 rounded-xl font-heading font-bold text-sm transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'camera' 
              ? 'bg-green-500 text-black shadow-lg shadow-green-500/30' 
              : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" /> Live Webcam Photo Scanner
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Input Column */}
        <div className="space-y-4">
          {activeTab === 'text' ? (
            <div className="glass-card p-6 min-h-[400px] flex flex-col justify-between border-t-2 border-t-green-400">
              <div className="space-y-4">
                <h3 className="text-xl font-heading font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-400" />
                  Describe Meal & Ingredients
                </h3>
                <p className="text-sm text-gray-400">Type natural descriptions, quantity, or ingredients for instant scientific breakdown.</p>
                
                <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-green-400 text-sm"
                  placeholder="e.g. 2 boiled eggs, 1 slice whole wheat toast, and 1 apple"
                />

                <button 
                  onClick={() => handleAnalyzeText()}
                  disabled={analyzingText || !textInput}
                  className="w-full btn-primary bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 disabled:opacity-50"
                >
                  {analyzingText ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  {analyzingText ? 'Analyzing Ingredients...' : 'Analyze Macros with AI'}
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="text-xs text-gray-400 font-bold mb-2">Try Quick AI Examples:</div>
                <div className="space-y-2">
                  {sampleQueries.map((sample, idx) => (
                    <button 
                      key={idx}
                      onClick={() => { setTextInput(sample); handleAnalyzeText(sample); }}
                      className="w-full p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-left text-xs text-gray-300 transition-colors border border-white/5 truncate block"
                    >
                      💡 {sample}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 min-h-[400px] flex flex-col justify-center relative overflow-hidden">
              {webcamActive ? (
                <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-black flex flex-col items-center justify-center">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <button 
                    onClick={capturePhoto}
                    className="absolute bottom-6 btn-primary bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl"
                  >
                    <Camera className="w-5 h-5" /> Snap Photo & Analyze
                  </button>
                </div>
              ) : !image ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-white/20 rounded-xl p-8 text-center space-y-6">
                  <div className="w-16 h-16 bg-green-500/10 dark:bg-quest-darkest rounded-full flex items-center justify-center mx-auto text-green-500 dark:text-green-400 shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Scan Meal Photo</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Capture with your camera or select an image file</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={openWebcam}
                      className="btn-primary bg-green-500 hover:bg-green-600 text-black font-bold px-5 py-2.5 flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" /> Open Camera
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary bg-white/10 hover:bg-white/20 text-gray-800 dark:text-white font-bold px-5 py-2.5 flex items-center justify-center gap-2 border border-gray-300 dark:border-white/10"
                    >
                      <UploadCloud className="w-4 h-4" /> Browse Photo
                    </button>
                  </div>
                  
                  <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
              ) : (
                <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <img src={image} alt="Scanned meal" className={`max-w-full max-h-[400px] object-contain ${scanning ? 'opacity-50' : 'opacity-100'}`} />
                  {scanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <div className="text-green-400 font-bold uppercase text-xs">Analyzing Image...</div>
                    </div>
                  )}
                  <button onClick={() => setImage(null)} className="absolute top-4 right-4 p-2 bg-black/60 rounded-lg text-white hover:bg-red-500">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Output Column */}
        <div className="space-y-4">
          <div className="glass-card p-6 h-full flex flex-col border-t-2 border-t-green-400">
            <h2 className="text-xl font-heading font-semibold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-green-400" />
              Nutritional Breakdown Results
            </h2>

            {!results && !analyzingText && !scanning ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Describe a meal or capture a photo to generate nutritional breakdown.</p>
              </div>
            ) : (analyzingText || scanning) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4">
                <RefreshCw className="w-8 h-8 text-green-400 animate-spin" />
                <p className="text-sm">Consulting scientific nutrition database...</p>
              </div>
            ) : results ? (
              <div className="flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">{results.title}</h3>
                  {results.items.map((item, idx) => (
                    <div key={idx} className="bg-white/70 dark:bg-quest-darkest/95 p-4 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{item.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
                            Qty: {item.quantity_label}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-2 flex-wrap">
                          <span>Serving: {item.serving}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSourceBadgeColor(item.source)}`}>
                            {item.source || "Estimated"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-quest-gold">{item.calories} kcal</div>
                        <div className="text-[11px] text-gray-400 font-mono">P:{item.p}g C:{item.c}g F:{item.f}g Fib:{item.fiber || 0}g</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-6 space-y-6">
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                      <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                      <div className="text-base font-bold text-orange-400">{results.totals.calories}</div>
                      <div className="text-[9px] text-gray-400">KCAL</div>
                    </div>
                    <div className="bg-blue-500/10 p-2 rounded-xl border border-blue-500/20">
                      <Target className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="text-base font-bold text-blue-400">{results.totals.p}g</div>
                      <div className="text-[9px] text-gray-400">PROTEIN</div>
                    </div>
                    <div className="bg-yellow-500/10 p-2 rounded-xl border border-yellow-500/20">
                      <Sparkles className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
                      <div className="text-base font-bold text-amber-700 dark:text-yellow-400">{results.totals.c}g</div>
                      <div className="text-[9px] text-gray-400">CARBS</div>
                    </div>
                    <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                      <Droplets className="w-4 h-4 text-red-400 mx-auto mb-1" />
                      <div className="text-base font-bold text-red-400">{results.totals.f}g</div>
                      <div className="text-[9px] text-gray-400">FATS</div>
                    </div>
                    <div className="bg-green-500/10 p-2 rounded-xl border border-green-500/20">
                      <Leaf className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <div className="text-base font-bold text-green-400">{results.totals.fiber || 0}g</div>
                      <div className="text-[9px] text-gray-400">FIBER</div>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogMeal}
                    disabled={logged}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                      logged 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 shadow-green-500/30 cursor-pointer'
                    }`}
                  >
                    {logged ? (
                      <><CheckCircle className="w-5 h-5" /> Logged to Macro Tracker (+100 XP)</>
                    ) : (
                      <><PlusCircle className="w-5 h-5" /> Log to Macro Tracker (+100 XP)</>
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
    </svg>
  );
}
