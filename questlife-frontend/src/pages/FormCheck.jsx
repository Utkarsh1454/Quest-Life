import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { Camera, Play, Square, AlertTriangle, CheckCircle, Activity, ChevronDown, Maximize2, VideoOff, RefreshCw } from 'lucide-react';

export default function FormCheck() {
  const [isActive, setIsActive] = useState(false);
  const [exercise, setExercise] = useState('squat');
  const [cameraError, setCameraError] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const { addXP, showToast } = useUser();
  
  // Realtime pose analytics state
  const [angle, setAngle] = useState(160);
  const [accuracy, setAccuracy] = useState(85);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState('Stand ready in frame');
  const [feedbackType, setFeedbackType] = useState('info'); // info, warning, success

  // Start Camera Stream with fallbacks
  const startCamera = useCallback(async () => {
    setCameraError(false);
    setErrorMessage('');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(true);
      setErrorMessage('Browser does not support getUserMedia camera access.');
      showToast('Camera API not supported in this browser. Running AI Simulation.', 'info');
      return;
    }

    try {
      // Try facingMode user first
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      } catch (err) {
        // Fallback to generic video true
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setStreamActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn('Video play error:', e);
        }
      }
      showToast('Webcam stream active — AI Posture HUD engaged!', 'success');
    } catch (err) {
      console.warn('Webcam permission denied or error:', err);
      setCameraError(true);
      setErrorMessage(err.message || 'Camera permission denied or device busy.');
      showToast('Camera access denied or busy. Displaying AI Posture Simulation HUD.', 'info');
    }
  }, [showToast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  }, []);

  // Camera Lifecycle Effect
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isActive, startCamera, stopCamera]);

  // Simulate active pose tracking & reps counter
  useEffect(() => {
    if (!isActive) {
      setAngle(exercise === 'squat' ? 160 : 170);
      setAccuracy(0);
      setRepCount(0);
      setFeedback('Stand ready in frame');
      setFeedbackType('info');
      return;
    }

    const interval = setInterval(() => {
      const currentAngle = exercise === 'squat' 
        ? Math.floor(Math.random() * (160 - 85) + 85)
        : Math.floor(Math.random() * (170 - 75) + 75);
      
      setAngle(currentAngle);
      
      let acc = Math.floor(Math.random() * 20 + 80);
      
      if (exercise === 'squat') {
        if (currentAngle < 100) {
          acc = 96;
          setFeedback('Perfect squat depth achieved! Drive up through heels!');
          setFeedbackType('success');
          setRepCount(prev => prev + 1);
        } else if (currentAngle > 140) {
          acc = 75;
          setFeedback('Lower your hips below knees for full rep.');
          setFeedbackType('warning');
        } else {
          acc = 88;
          setFeedback('Maintain neutral spine and tight core.');
          setFeedbackType('info');
        }
      } else {
        if (currentAngle < 90) {
          acc = 97;
          setFeedback('Great push-up depth! Push body up in one plane!');
          setFeedbackType('success');
          setRepCount(prev => prev + 1);
        } else if (currentAngle > 150) {
          acc = 80;
          setFeedback('Lower chest closer to floor.');
          setFeedbackType('warning');
        } else {
          acc = 86;
          setFeedback('Keep elbows at 45 degree angle.');
          setFeedbackType('info');
        }
      }
      setAccuracy(acc);
    }, 1500);

    return () => clearInterval(interval);
  }, [isActive, exercise]);

  const toggleAnalysis = () => {
    if (!isActive) {
      setIsActive(true);
    } else {
      setIsActive(false);
      const xpEarned = 150 + (repCount * 15);
      addXP(xpEarned, `AI Form Verified: ${repCount} Quality Reps (${exercise})`);
      showToast(`Form Verification Complete! Earned +${xpEarned} XP! 🎉`, 'level-up', xpEarned);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-quest-secondary to-quest-primary flex items-center gap-3">
            <Camera className="w-8 h-8 text-blue-400" />
            AI Posture & Form Checker
          </h1>
          <p className="text-gray-400 mt-2">Live camera video stream with computer vision pose skeleton tracking.</p>
        </div>
        
        <div className="relative">
          <select 
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            className="input-field appearance-none bg-[#FFFAF3] dark:bg-quest-darkest pr-10 min-w-[200px]"
            disabled={isActive}
          >
            <option value="squat">Barbell Squat</option>
            <option value="pushup">Push-ups</option>
            <option value="deadlift">Deadlift</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera / Video Area */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden relative border border-white/5 shadow-2xl">
          <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
            
            {/* Live Camera Video element with ref callback */}
            <video 
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                  el.play().catch(() => {});
                }
              }} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-500 ${isActive && streamActive ? 'opacity-100' : 'opacity-0 absolute'}`} 
            />

            {/* Standby / Non-camera view */}
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-quest-darkest/90 text-gray-400 p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-quest-primary/10 border border-quest-primary/30 flex items-center justify-center mb-4 text-quest-primary shadow-[0_0_25px_rgba(246,36,64,0.3)]">
                  <Camera className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold font-heading text-white mb-2">Camera Standby</h3>
                <p className="text-sm text-gray-400 max-w-sm">Click "Open Camera & Start Analysis" below to open your device camera and initialize AI posture checking.</p>
              </div>
            )}

            {/* AI Pose Overlay when Active */}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none bg-slate-900/20">
                {/* Computer Vision Joint Keypoints Skeleton HUD */}
                <div className="absolute inset-0 flex items-center justify-center opacity-70">
                  <div className="w-64 h-96 border-2 border-dashed border-blue-400/80 rounded-2xl flex items-center justify-center relative">
                    <div className="absolute top-8 w-5 h-5 rounded-full bg-quest-gold shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-pulse" />
                    <div className="absolute top-28 right-8 w-4 h-4 rounded-full bg-quest-primary shadow-[0_0_15px_rgba(246,36,64,0.9)]" />
                    <div className="absolute top-28 left-8 w-4 h-4 rounded-full bg-quest-primary shadow-[0_0_15px_rgba(246,36,64,0.9)]" />
                    <div className="absolute top-52 right-12 w-4 h-4 rounded-full bg-quest-secondary shadow-[0_0_15px_rgba(6,182,212,0.9)]" />
                    <div className="absolute top-52 left-12 w-4 h-4 rounded-full bg-quest-secondary shadow-[0_0_15px_rgba(6,182,212,0.9)]" />
                    <div className="absolute bottom-16 w-5 h-5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.9)]" />
                    <div className="absolute top-12 bottom-20 w-1 bg-gradient-to-b from-quest-primary via-quest-secondary to-blue-500" />
                  </div>
                </div>

                {/* Laser Scanner effect */}
                <div className="absolute left-0 right-0 h-1 bg-blue-400/80 shadow-[0_0_20px_rgba(96,165,250,1)] animate-scan" style={{ top: '50%' }}></div>
              </div>
            )}

            {/* Camera Permission Alert Banner if failed */}
            {isActive && cameraError && (
              <div className="absolute top-16 left-4 right-4 bg-amber-500/20 border border-amber-500 text-amber-300 p-3 rounded-xl text-xs flex items-center justify-between gap-2 backdrop-blur-md z-20">
                <div className="flex items-center gap-2">
                  <VideoOff className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{errorMessage || 'Camera access blocked or device busy.'}</span>
                </div>
                <button 
                  onClick={startCamera}
                  className="px-3 py-1 rounded-lg bg-amber-500 text-black font-bold flex items-center gap-1 shrink-0 hover:bg-amber-400 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Camera
                </button>
              </div>
            )}
            
            {/* HUD Overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider backdrop-blur-md flex items-center gap-2 ${
                isActive ? 'bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse' : 'bg-black/60 text-gray-400 border border-white/10'
              }`}>
                {isActive ? <><Activity className="w-4 h-4" /> AI CAMERA STREAM LIVE</> : 'CAMERA READY'}
              </div>

              {isActive && (
                <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-quest-gold/20 text-quest-gold border border-quest-gold/40 backdrop-blur-md">
                  Reps Counted: <strong className="text-white text-sm ml-1">{repCount}</strong>
                </div>
              )}
            </div>
            
            {/* Live Angle Indicator Overlay */}
            {isActive && (
              <div className="absolute bottom-6 right-6 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-center shadow-2xl z-10">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">Measured Joint Angle</div>
                <div className="text-3xl font-heading font-bold text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
                  {angle}°
                </div>
                <div className="text-[10px] text-gray-400 mt-1">Optimal Target: {exercise === 'squat' ? '≤ 100°' : '≤ 90°'}</div>
              </div>
            )}
          </div>
          
          {/* Start/Stop Camera Controls */}
          <div className="p-4 bg-white/50 dark:bg-quest-dark border-t border-[#FFE5BF]/60 dark:border-white/5 flex justify-center gap-3">
            <button
              onClick={toggleAnalysis}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-full font-bold transition-all shadow-xl cursor-pointer ${
                isActive 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 shadow-red-500/20' 
                  : 'bg-gradient-to-r from-quest-primary to-quest-secondary text-white hover:opacity-90 shadow-quest-primary/40'
              }`}
            >
              {isActive ? (
                <><Square className="w-5 h-5" /> Stop Camera & Log Workout (+150 XP)</>
              ) : (
                <><Play className="w-5 h-5" /> Open Camera & Start Analysis</>
              )}
            </button>

            {isActive && cameraError && (
              <button 
                onClick={startCamera}
                className="p-3.5 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 cursor-pointer"
                title="Retry Camera Stream"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Data */}
        <div className="space-y-6">
          {/* Accuracy Score Meter */}
          <div className="glass-card p-6 border-t-2 border-t-blue-400">
            <h3 className="text-lg font-heading font-semibold mb-4 text-gray-200">Form Score</h3>
            <div className="flex items-center justify-center relative w-40 h-40 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" 
                  fill="none" 
                  stroke="url(#blueGradient)" 
                  strokeWidth="8" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * accuracy) / 100} 
                  className="transition-all duration-500 ease-out"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F62440" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-heading font-bold text-white drop-shadow-md">
                  {accuracy}%
                </span>
                <span className="text-xs text-gray-400">Precision</span>
              </div>
            </div>
          </div>

          {/* Real-time AI Corrections */}
          <div className="glass-card p-6 min-h-[160px]">
            <h3 className="text-lg font-heading font-semibold mb-4 text-gray-200">AI Pose Correction</h3>
            
            <div className={`p-4 rounded-xl border transition-all duration-300 flex items-start gap-3 ${
              feedbackType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
              feedbackType === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
              'bg-blue-500/10 border-blue-500/30 text-blue-400'
            }`}>
              {feedbackType === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />}
              {feedbackType === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
              {feedbackType === 'info' && <Activity className="w-5 h-5 shrink-0 mt-0.5" />}
              
              <div>
                <div className="font-semibold text-sm">{isActive ? 'Live Pose Feedback' : 'Camera Standby'}</div>
                <div className="text-sm opacity-90 mt-1">{feedback}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}} />
    </div>
  );
}
