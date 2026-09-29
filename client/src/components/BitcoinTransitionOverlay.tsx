import React, { useState, useEffect } from 'react';

interface BitcoinTransitionOverlayProps {
  onComplete: () => void;
}

export const BitcoinTransitionOverlay: React.FC<BitcoinTransitionOverlayProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'initial' | 'zooming'>('initial');

  useEffect(() => {
    // Stage 1: Near-instant trigger (40ms)
    const zoomTimer = setTimeout(() => {
      setPhase('zooming');
    }, 40);

    // Stage 2: Snappy, lightweight zoom-in complete (420ms / ~0.42s total)
    const finishTimer = setTimeout(() => {
      onComplete();
    }, 420);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <div 
      onClick={onComplete}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070502',
        overflow: 'hidden',
        pointerEvents: phase === 'zooming' ? 'none' : 'all',
        cursor: 'pointer'
      }}
    >
      {/* Background Ambient Starfield & Circuit Radiance */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at center, rgba(217, 119, 6, 0.38) 0%, rgba(10, 8, 3, 0.95) 60%, #050402 100%)
        `,
        opacity: phase === 'zooming' ? 0 : 1,
        transition: 'opacity 0.35s ease-out',
        pointerEvents: 'none'
      }} />

      {/* Explosive Golden Light Flash Burst on Zoom */}
      <div style={{
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at center, rgba(254, 240, 138, 0.95) 0%, rgba(245, 158, 11, 0.65) 35%, transparent 70%)',
        opacity: phase === 'zooming' ? 0.95 : 0,
        transform: phase === 'zooming' ? 'scale(3)' : 'scale(0.3)',
        transition: 'opacity 0.32s ease-out, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'none',
        zIndex: 3
      }} />

      {/* Shockwave Rings Expanding Smoothly During Zoom */}
      <div style={{
        position: 'absolute',
        width: '280px',
        height: '280px',
        borderRadius: '50%',
        border: '2px solid rgba(251, 191, 36, 0.75)',
        boxShadow: '0 0 50px rgba(245, 158, 11, 0.65), inset 0 0 35px rgba(245, 158, 11, 0.45)',
        transform: phase === 'zooming' ? 'scale(6.5)' : 'scale(1)',
        opacity: phase === 'zooming' ? 0 : 0.85,
        transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease-out',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        border: '1px dashed rgba(254, 240, 138, 0.45)',
        transform: phase === 'zooming' ? 'scale(7.5) rotate(60deg)' : 'scale(1) rotate(0deg)',
        opacity: phase === 'zooming' ? 0 : 0.65,
        transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease-out',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Main Zooming Bitcoin Reference Image - Lightning Fast Fly-Through */}
      <div style={{
        position: 'relative',
        width: '230px',
        height: '230px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4,
        transform: phase === 'zooming' 
          ? 'scale(10) rotate(10deg)' 
          : 'scale(1) rotate(0deg)',
        opacity: phase === 'zooming' ? 0 : 1,
        filter: phase === 'zooming' 
          ? 'brightness(2.2) blur(5px)' 
          : 'brightness(1) blur(0px)',
        transition: 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.34s cubic-bezier(0.4, 0, 0.8, 0), filter 0.32s ease-out',
        willChange: 'transform, opacity, filter',
        animation: phase === 'initial' ? 'coinHoverPulse 2s ease-in-out infinite alternate' : 'none'
      }}>
        {/* Glowing Golden Ring Frame */}
        <div style={{
          position: 'absolute',
          inset: '-7px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
          boxShadow: '0 0 60px rgba(245, 158, 11, 0.9), inset 0 1px 2px #fff',
          zIndex: 1
        }} />

        {/* The Golden Bitcoin Image */}
        <img
          src="./bitcoin-gold.jpg"
          alt="Golden Bitcoin Zoom"
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            position: 'relative',
            zIndex: 2,
            boxShadow: '0 0 35px rgba(0, 0, 0, 0.95)'
          }}
        />
      </div>

      {/* Quick Tap To Skip Hint */}
      <div style={{
        position: 'absolute',
        bottom: '36px',
        fontSize: '0.76rem',
        fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#fbbf24',
        opacity: phase === 'zooming' ? 0 : 0.75,
        transition: 'opacity 0.4s ease',
        zIndex: 5
      }}>
        Click anywhere to skip
      </div>

      <style>{`
        @keyframes coinHoverPulse {
          0% {
            transform: scale(0.98);
            filter: drop-shadow(0 0 30px rgba(245, 158, 11, 0.5));
          }
          100% {
            transform: scale(1.02);
            filter: drop-shadow(0 0 50px rgba(251, 191, 36, 0.85));
          }
        }
      `}</style>
    </div>
  );
};

export default BitcoinTransitionOverlay;
