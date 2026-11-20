import { useState, useRef, useEffect } from 'react';
import './App.css';

import frame1 from './assets/frame1.png';
import frame2 from './assets/frame2.png';
import frame3 from './assets/frame3.png';
import frame4 from './assets/frame4.png';

export default function App() {
  const [step, setStep] = useState('select'); // 'select' | 'booth' | 'result'
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  
  const videoRef = useRef(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [finalImageURL, setFinalImageURL] = useState(null);

  const isSavingRef = useRef(false);

  const frames = [
    { id: 1, name: 'Finn & Jake Frame', src: frame1 },
    { id: 2, name: 'Princess Bubblegum Frame', src: frame2 },
    { id: 3, name: 'BMO Gaming Frame', src: frame3 },
    { id: 4, name: 'Lumpy Space Princess Frame', src: frame4 },
  ];

  const frameConfigs = {
    1: [
      { top: '2.5%', left: '10.0%', width: '80%', height: '19.0%', borderRadius: '4px' },
      { top: '22.5%', left: '10.0%', width: '80%', height: '19.0%', borderRadius: '4px' },
      { top: '42.5%', left: '10.0%', width: '80%', height: '19.0%', borderRadius: '4px' },
      { top: '63.0%', left: '10.0%', width: '80%', height: '19.0%', borderRadius: '4px' },
    ],
    2: [
      { top: '2.5%', left: '10.0%', width: '81%', height: '19.0%', borderRadius: '4px' },
      { top: '22.5%', left: '10.0%', width: '81%', height: '19.0%', borderRadius: '4px' },
      { top: '42.5%', left: '10.0%', width: '81%', height: '19.0%', borderRadius: '4px' },
      { top: '63.0%', left: '10.0%', width: '81%', height: '19.0%', borderRadius: '4px' },
    ],
    3: [
      { top: '2.8%', left: '10.0%', width: '80%', height: '20.0%', borderRadius: '4px' },
      { top: '23.5%', left: '10.0%', width: '80%', height: '20.0%', borderRadius: '4px' },
      { top: '44.5%', left: '10.0%', width: '80%', height: '20.0%', borderRadius: '4px' },
      { top: '65.0%', left: '10.0%', width: '80%', height: '20.0%', borderRadius: '4px' },
    ],
    4: [
      { top: '2.0%', left: '10.0%', width: '80%', height: '20.0%', borderRadius: '4px' },
      { top: '22.0%', left: '10.0%', width: '80%', height: '20.0%', borderRadius: '4px' },
      { top: '42.0%', left: '10.0%', width: '80%', height: '20.0%', borderRadius: '4px' },
      { top: '62.0%', left: '10.0%', width: '80%', height: '20.0%', borderRadius: '4px' },
    ]
  };

  useEffect(() => {
    if (step === 'booth') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Webcam error: ", err));
    }
  }, [step]);

  const startCountdown = () => {
    if (capturedPhotos.length >= 4) return;
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(null);
        takePhoto();
      }
    }, 1000);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video || isSavingRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoDataUrl = canvas.toDataURL('image/png');
    
    setCapturedPhotos((prev) => {
      if (prev.length >= 4 || isSavingRef.current) return prev;

      const updated = [...prev, photoDataUrl];
      
      if (updated.length === 4) {
        isSavingRef.current = true;
        generateAndDownloadComposite(updated);
      }
      return updated;
    });
  };

  const generateAndDownloadComposite = (photos) => {
    if (!selectedFrame) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const frameImg = new Image();
    frameImg.src = selectedFrame;
    frameImg.onload = () => {
      canvas.width = frameImg.naturalWidth || 600;
      canvas.height = frameImg.naturalHeight || 1800;

      const slots = frameConfigs[selectedFrameId] || frameConfigs[1];
      let loadedCount = 0;

      photos.forEach((photoSrc, index) => {
        const pImg = new Image();
        pImg.src = photoSrc;
        pImg.onload = () => {
          const slot = slots[index];
          const x = (parseFloat(slot.left) / 100) * canvas.width;
          const y = (parseFloat(slot.top) / 100) * canvas.height;
          const w = (parseFloat(slot.width) / 100) * canvas.width;
          const h = (parseFloat(slot.height) / 100) * canvas.height;

          ctx.drawImage(pImg, x, y, w, h);
          loadedCount++;

          if (loadedCount === photos.length) {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
            
            const finalUrl = canvas.toDataURL('image/png');
            setFinalImageURL(finalUrl);
            setStep('result');

            const link = document.createElement('a');
            link.href = finalUrl;
            link.download = `adventure-time-photobooth-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        };
      });
    };
  };

  const currentSlots = frameConfigs[selectedFrameId] || frameConfigs[1];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fef6e4', 
      fontFamily: '"Balsamiq Sans", "Comic Sans MS", cursive, sans-serif', 
      padding: '20px', 
      textAlign: 'center' 
    }}>
      
      {/* Google Font import for a fun cartoon style */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Balsamiq+Sans:ital,wght@0,400;0,700;1,400&display=swap');
      `}</style>
      
      {/* 1. SELECTION PAGE */}
      {step === 'select' && (
        <div>
          <h1 style={{ color: '#ff5722', fontSize: '2.8rem', marginBottom: '30px', textShadow: '2px 2px 0px #ffe0b2' }}>
            Choose Your Adventure Frame ! 
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
            {frames.map((frame) => {
              const isHovered = hoveredId === frame.id;
              return (
                <div
                  key={frame.id}
                  onMouseEnter={() => setHoveredId(frame.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => {
                    setSelectedFrame(frame.src);
                    setSelectedFrameId(frame.id);
                    isSavingRef.current = false;
                    setStep('booth');
                    setCapturedPhotos([]);
                    setFinalImageURL(null);
                  }}
                  style={{
                    width: '180px',
                    height: '450px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: isHovered ? '4px solid #00bfff' : '4px solid transparent',
                    boxShadow: isHovered ? '0 0 25px rgba(0, 191, 255, 0.9)' : '0 4px 10px rgba(0,0,0,0.1)',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    overflow: 'hidden'
                  }}
                >
                  <img src={frame.src} alt={frame.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. PHOTO BOOTH PAGE */}
      {step === 'booth' && (
        <div>
          <button 
            onClick={() => {
              isSavingRef.current = false;
              setStep('select');
            }}
            style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', background: '#333', color: 'white', fontWeight: 'bold', fontFamily: 'inherit' }}
          >
            ← Back
          </button>

          <h2 style={{ color: '#3f51b5', fontSize: '2.2rem' }}>Mathematical ! Time to Pose! </h2>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '40px', marginTop: '30px', flexWrap: 'wrap' }}>
            
            <div style={{ position: 'relative', width: '500px', height: '375px', background: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {countdown && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '8rem', color: 'white', fontWeight: 'bold', textShadow: '3px 3px 15px rgba(0,0,0,0.9)' }}>
                  {countdown}
                </div>
              )}

              <button 
                onClick={startCountdown}
                style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '12px 30px', background: '#ff4081', color: 'white', border: 'none', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', fontFamily: 'inherit' }}
              >
                Take Photo ({capturedPhotos.length}/4) 📸
              </button>
            </div>

            <div style={{ 
              position: 'relative', 
              width: '220px', 
              background: 'white', 
              borderRadius: '12px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              lineHeight: 0
            }}>
              {currentSlots.map((slot, slotIndex) => (
                <div 
                  key={slotIndex} 
                  style={{ 
                    position: 'absolute',
                    top: slot.top,
                    left: slot.left,
                    width: slot.width,
                    height: slot.height,
                    borderRadius: slot.borderRadius,
                    background: '#eee',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}
                >
                  {capturedPhotos[slotIndex] && (
                    <img src={capturedPhotos[slotIndex]} alt={`Shot ${slotIndex + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              ))}

              {selectedFrame && (
                <img src={selectedFrame} alt="Selected frame" style={{ position: 'relative', width: '100%', height: 'auto', display: 'block', pointerEvents: 'none', zIndex: '2' }} />
              )}
            </div>

          </div>
        </div>
      )}

      {/* 3. RESULT & DOWNLOAD PAGE */}
      {step === 'result' && (
        <div>
          <h2 style={{ color: '#4caf50', fontSize: '2.5rem' }}>Your Photo Strip is Ready! </h2>
          

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '50px', flexWrap: 'wrap' }}>
            
            {/* Preview */}
            <div style={{ width: '220px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
              {finalImageURL && <img src={finalImageURL} alt="Final photo strip" style={{ width: '100%', display: 'block' }} />}
            </div>

            {/* Actions */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              
              <div style={{ display: 'flex', gap: '15px', flexDirection: 'column', width: '100%' }}>
                {finalImageURL && (
                  <a 
                    href={finalImageURL} 
                    download={`adventure-time-photobooth-${Date.now()}.png`}
                    style={{ padding: '12px 25px', background: '#4caf50', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontFamily: 'inherit' }}
                  >
                    Download Again 
                  </a>
                )}

                <button 
                  onClick={() => {
                    isSavingRef.current = false;
                    setStep('select');
                    setCapturedPhotos([]);
                    setFinalImageURL(null);
                  }}
                  style={{ padding: '12px 25px', background: '#ff5722', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', fontFamily: 'inherit' }}
                >
                  Start New Session 
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}