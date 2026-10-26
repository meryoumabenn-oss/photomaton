import { useState, useRef, useEffect } from 'react';
import './App.css';

import frame1 from './assets/frame1.png';
import frame2 from './assets/frame2.png';
import frame3 from './assets/frame3.png';
import frame4 from './assets/frame4.png';

export default function App() {
  const [step, setStep] = useState('select');
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  
  const videoRef = useRef(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [countdown, setCountdown] = useState(null);

  const frames = [
    { id: 1, name: 'Cadre Finn et Jake', src: frame1 },
    { id: 2, name: 'Cadre Princesse Chewing-Gum', src: frame2 },
    { id: 3, name: 'Cadre BMO Gaming', src: frame3 },
    { id: 4, name: 'Cadre Lumpy Space Princess', src: frame4 },
  ];

  // Coordonnées rectifiées pour s'arrêter net avant les décorations du bas
  const frameConfigs = {
    1: [
      { top: '6.0%', left: '10.0%', width: '80%', height: '17.5%', borderRadius: '4px' },
      { top: '25.5%', left: '10.0%', width: '80%', height: '17.5%', borderRadius: '4px' },
      { top: '45.0%', left: '10.0%', width: '80%', height: '17.5%', borderRadius: '4px' },
      { top: '64.5%', left: '10.0%', width: '80%', height: '17.5%', borderRadius: '4px' },
    ],
    2: [
      { top: '8.5%', left: '10.0%', width: '80%', height: '16.5%', borderRadius: '16px' },
      { top: '27.5%', left: '10.0%', width: '80%', height: '16.5%', borderRadius: '16px' },
      { top: '46.5%', left: '10.0%', width: '80%', height: '16.5%', borderRadius: '16px' },
      { top: '65.5%', left: '10.0%', width: '80%', height: '16.5%', borderRadius: '16px' },
    ],
    3: [
      { top: '4.5%', left: '12.0%', width: '76%', height: '19.0%', borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' },
      { top: '24.5%', left: '12.0%', width: '76%', height: '19.0%', borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' },
      { top: '44.5%', left: '12.0%', width: '76%', height: '19.0%', borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' },
      { top: '64.5%', left: '12.0%', width: '76%', height: '19.0%', borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%' },
    ],
    4: [
      { top: '5.0%', left: '10.0%', width: '80%', height: '17.5%', borderRadius: '50%' },
      { top: '24.5%', left: '10.0%', width: '80%', height: '17.5%', borderRadius: '50%' },
      { top: '44.0%', left: '10.0%', width: '80%', height: '17.5%', borderRadius: '50%' },
      { top: '63.5%', left: '10.0%', width: '80%', height: '17.5%', borderRadius: '50%' },
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
        .catch((err) => console.error("Erreur webcam : ", err));
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
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const photoDataUrl = canvas.toDataURL('image/png');
    setCapturedPhotos((prev) => [...prev, photoDataUrl]);
  };

  const currentSlots = frameConfigs[selectedFrameId] || frameConfigs[1];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fef6e4', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' }}>
      
      {step === 'select' && (
        <div>
          <h1 style={{ color: '#ff5722', fontSize: '2.5rem', marginBottom: '30px' }}>
            Choisis ta Frame Adventure Time
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
                    setStep('booth');
                    setCapturedPhotos([]);
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
                    boxShadow: isHovered ? '0 0 25px rgba(0, 191, 255, 0.9)' : 'none',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    background: 'transparent',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={frame.src} 
                    alt={frame.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {step === 'booth' && (
        <div>
          <button 
            onClick={() => setStep('select')}
            style={{ position: 'absolute', top: '20px', left: '20px', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px', border: 'none', background: '#333', color: 'white', fontWeight: 'bold' }}
          >
            Retour
          </button>

          <h2 style={{ color: '#3f51b5' }}>C'est l'heure de poser</h2>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '40px', marginTop: '30px', flexWrap: 'wrap' }}>
            
            <div style={{ position: 'relative', width: '500px', height: '375px', background: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
              <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {countdown && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '8rem', color: 'white', fontWeight: 'bold', textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}>
                  {countdown}
                </div>
              )}

              <button 
                onClick={startCountdown}
                style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '12px 30px', background: '#ff4081', color: 'white', border: 'none', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
              >
                Prendre la photo ({capturedPhotos.length}/4)
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
                    <img 
                      src={capturedPhotos[slotIndex]} 
                      alt={`prise ${slotIndex + 1}`} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }} 
                    />
                  )}
                </div>
              ))}

              {selectedFrame && (
                <img 
                  src={selectedFrame} 
                  alt="Cadre selectionne" 
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: 'auto', 
                    display: 'block',
                    pointerEvents: 'none',
                    zIndex: 2
                  }} 
                />
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}