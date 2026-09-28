import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { AuthUser } from '../types';
import { BitcoinTransitionOverlay } from './BitcoinTransitionOverlay';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [showIntro, setShowIntro] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const lastTapRef = useRef<number>(0);

  // Trigger 3D coin toss flip on double tap / double click
  const triggerCoinFlip = () => {
    setIsFlipping(false);
    setTimeout(() => {
      setIsFlipping(true);
      setFlipCount(prev => prev + 1);
    }, 10);
  };

  // Support mobile & tablet double-tap detection
  const handleTouchEnd = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 380) {
      triggerCoinFlip();
    }
    lastTapRef.current = now;
  };

  // Real-time full-screen cursor tracking for dynamic Bitcoin 3D motion
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (clientY - innerHeight / 2) / (innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Validate form inputs
  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Email address is required');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError('');

    try {
      const response = await api.login(email.trim(), password);
      if (response && response.user) {
        if (rememberMe) {
          localStorage.setItem('salesmind_user', JSON.stringify(response.user));
          localStorage.setItem('salesmind_token', response.token);
        }
        setSuccessToast(`Welcome back, ${response.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(response.user, response.token);
        }, 500);
      }
    } catch (err: any) {
      setGeneralError(err.message || 'Invalid credentials or server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill for instant enterprise testing
  const handleQuickDemo = () => {
    setEmail('alex.morgan@apexsystems.io');
    setPassword('password123');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
  };

  return (
    <>
      {/* Cinematic Golden Bitcoin Intro Transition */}
      {showIntro && (
        <BitcoinTransitionOverlay onComplete={() => setShowIntro(false)} />
      )}

      <div style={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '24px 16px',
        overflowY: 'auto',
        background: `
          radial-gradient(ellipse 65% 55% at 50% 15%, rgba(217, 119, 6, 0.28) 0%, transparent 60%),
          radial-gradient(ellipse 55% 45% at 85% 85%, rgba(245, 158, 11, 0.18) 0%, transparent 55%),
          linear-gradient(180deg, rgba(12, 10, 6, 0.78) 0%, rgba(18, 14, 8, 0.88) 100%),
          url('/bg-chart.jpg') center/cover no-repeat fixed
        `,
      }}>
        {/* Replay Bitcoin Intro Button */}
        <button
          onClick={() => setShowIntro(true)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '20px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#fef08a',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
            zIndex: 5
          }}
          title="Replay Cinematic Bitcoin Intro Transition"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.6)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(245, 158, 11, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Sparkles size={13} color="#fbbf24" />
          <span>Replay Bitcoin Zoom</span>
        </button>

        {/* Decorative ambient gold glow */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '560px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        {/* 2-Column Responsive Layout: Login Form on Left & Bitcoin Showcase on Right */}
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: '24px',
          width: '100%',
          maxWidth: '920px',
          position: 'relative',
          zIndex: 1,
          animation: 'cardZoomEntrance 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          flexWrap: 'wrap'
        }}>
          {/* Main Login Card Wrapper */}
          <div 
            className="glass-card"
            style={{
              flex: '1 1 420px',
              maxWidth: '450px',
              background: 'rgba(20, 16, 9, 0.82)',
              backdropFilter: 'blur(28px) saturate(200%)',
              WebkitBackdropFilter: 'blur(28px) saturate(200%)',
              borderRadius: '16px',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(245, 158, 11, 0.18), 0 0 35px rgba(217, 119, 6, 0.15), inset 0 1px 1px rgba(254, 240, 138, 0.25)',
              padding: '36px 32px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
          <style>{`
            @keyframes cardZoomEntrance {
              0% {
                opacity: 0;
                transform: scale(0.88);
                filter: blur(6px);
              }
              100% {
                opacity: 1;
                transform: scale(1);
                filter: blur(0px);
              }
            }
          `}</style>
          {/* Header & Branding */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            {/* Golden Bitcoin Logo Mark from Reference */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              padding: '3px',
              background: 'linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
              boxShadow: '0 0 24px rgba(245, 158, 11, 0.65), inset 0 1px 2px #ffffff',
              marginBottom: '16px',
              animation: 'bitcoinGlow 3s ease-in-out infinite alternate'
            }}>
              <img 
                src="/bitcoin-gold.jpg" 
                alt="Bitcoin Capital Emblem" 
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            </div>

          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            background: 'linear-gradient(180deg, #ffffff 40%, #fef08a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.25,
            margin: 0
          }}>
            Sign in to Capital
          </h1>

          <p style={{
            fontSize: '0.82rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#fbbf24',
            marginTop: '8px',
            lineHeight: 1.45
          }}>
            REVENUE INTELLIGENCE
          </p>
        </div>

        {/* Global Error Banner */}
        {generalError && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#f87171',
            fontSize: '0.84rem',
            marginBottom: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{generalError}</span>
          </div>
        )}

        {/* Success Toast */}
        {successToast && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#34d399',
            fontSize: '0.84rem',
            marginBottom: '20px'
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successToast}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div style={{ marginBottom: '18px' }}>
            <label 
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '0.84rem',
                fontWeight: 500,
                color: '#cbd5e1',
                marginBottom: '6px'
              }}
            >
              Work Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: emailError ? '#f87171' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                transition: 'color 0.15s ease'
              }}>
                <Mail size={18} />
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="alex.morgan@apexsystems.io"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                  if (generalError) setGeneralError('');
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  fontSize: '0.875rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 12, 6, 0.75)',
                  border: `1px solid ${emailError ? '#ef4444' : 'rgba(245, 158, 11, 0.28)'}`,
                  color: '#fef3c7',
                  outline: 'none',
                  boxShadow: emailError 
                    ? '0 0 0 2px rgba(239, 68, 68, 0.25)' 
                    : 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  if (!emailError) {
                    e.currentTarget.style.borderColor = '#f59e0b';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 158, 11, 0.25), inset 0 1px 2px rgba(0, 0, 0, 0.4)';
                  }
                }}
                onBlur={(e) => {
                  if (!emailError) {
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.28)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.4)';
                  }
                }}
              />
            </div>
            {emailError && (
              <p style={{
                fontSize: '0.75rem',
                color: '#f87171',
                marginTop: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {emailError}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '18px' }}>
            <label 
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '0.84rem',
                fontWeight: 500,
                color: '#cbd5e1',
                marginBottom: '6px'
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: passwordError ? '#f87171' : '#d97706',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
                transition: 'color 0.15s ease'
              }}>
                <Lock size={18} />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (generalError) setGeneralError('');
                }}
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '40px',
                  paddingRight: '42px',
                  fontSize: '0.875rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 12, 6, 0.75)',
                  border: `1px solid ${passwordError ? '#ef4444' : 'rgba(245, 158, 11, 0.28)'}`,
                  color: '#fef3c7',
                  outline: 'none',
                  boxShadow: passwordError 
                    ? '0 0 0 2px rgba(239, 68, 68, 0.25)' 
                    : 'inset 0 1px 2px rgba(0, 0, 0, 0.4)',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  if (!passwordError) {
                    e.currentTarget.style.borderColor = '#f59e0b';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(245, 158, 11, 0.25), inset 0 1px 2px rgba(0, 0, 0, 0.4)';
                  }
                }}
                onBlur={(e) => {
                  if (!passwordError) {
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.28)';
                    e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.4)';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#d97706',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#d97706')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {passwordError && (
              <p style={{
                fontSize: '0.75rem',
                color: '#f87171',
                marginTop: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {passwordError}
              </p>
            )}
          </div>

          {/* Secondary Options: Remember me & Forgot Password */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '22px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  accentColor: '#f59e0b',
                  cursor: 'pointer'
                }}
              />
              <span style={{ fontSize: '0.84rem', color: '#cbd5e1' }}>Remember me</span>
            </label>

            <a 
              href="#forgot-password" 
              onClick={(e) => {
                e.preventDefault();
                alert('In demo mode: you can use your registered work email and password123, or click the Quick Demo account below.');
              }}
              style={{
                fontSize: '0.84rem',
                fontWeight: 500,
                color: '#fbbf24',
                textDecoration: 'none',
                transition: 'color 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fef08a';
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#fbbf24';
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button with Gold Gradient */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              height: '46px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 45%, #f59e0b 100%)',
              border: '1px solid rgba(254, 240, 138, 0.35)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.75 : 1,
              boxShadow: '0 4px 22px rgba(217, 119, 6, 0.45), inset 0 1px 1px rgba(254, 240, 138, 0.45)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 26px rgba(245, 158, 11, 0.55), inset 0 1px 1px rgba(254, 240, 138, 0.55)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.background = 'linear-gradient(135deg, #b45309 0%, #d97706 45%, #f59e0b 100%)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 22px rgba(217, 119, 6, 0.45), inset 0 1px 1px rgba(254, 240, 138, 0.45)';
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Platform</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px' }}></div>

        {/* Quick Enterprise Demo Access Pill in Gold */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px dashed rgba(245, 158, 11, 0.4)',
          borderRadius: '10px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.74rem',
            color: '#fbbf24',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={13} color="#fbbf24" />
              Instant 1-Click Demo Account
            </span>
          </div>
          <button
            type="button"
            onClick={handleQuickDemo}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.22)',
              color: '#fef3c7',
              fontSize: '0.82rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.18)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.55)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.22)';
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: '2px' }}>
              <span style={{ fontWeight: 600, color: '#fbbf24' }}>Alex Morgan</span>
              <span style={{ fontSize: '0.72rem', color: '#d4b483' }}>VP of Revenue · alex.morgan@apexsystems.io</span>
            </div>
            <span style={{
              fontSize: '0.72rem',
              color: '#fef08a',
              background: 'rgba(245, 158, 11, 0.25)',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              fontWeight: 600
            }}>
              Auto-fill
            </span>
          </button>
        </div>

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontSize: '0.78rem',
          color: '#64748b'
        }}>
          Protected by institutional enterprise 256-bit AES encryption
        </div>
      </div>

      {/* Right Side: Seamless Floating Golden Bitcoin Artwork (No card box / layout) */}
      <div 
        style={{
          flex: '1 1 320px',
          maxWidth: '420px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: '20px'
        }}
      >
        {/* Ambient Golden Glow Flare Behind Bitcoin with cursor tracking */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${mousePos.x * 26}px), calc(-50% + ${mousePos.y * 26}px))`,
          transition: 'transform 0.22s cubic-bezier(0.2, 0, 0.2, 1)',
          width: '340px',
          height: '340px',
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.32) 0%, rgba(217, 119, 6, 0.15) 45%, transparent 70%)',
          filter: 'blur(55px)',
          pointerEvents: 'none'
        }} />

        {/* Centerpiece: Golden Bitcoin Artwork with Dynamic 3D Cursor Motion & Double-Tap Flip */}
        <div style={{
          position: 'relative',
          width: '310px',
          height: '310px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          perspective: '1200px',
          animation: isFlipping ? undefined : 'coinFloat 4s ease-in-out infinite alternate'
        }}>
          <div 
            key={flipCount}
            onClick={(e) => {
              // Rapid double click support
              if (e.detail === 2) {
                triggerCoinFlip();
              }
            }}
            onDoubleClick={triggerCoinFlip}
            onTouchEnd={handleTouchEnd}
            onAnimationEnd={() => setIsFlipping(false)}
            title="Double-click or double-tap to flip the coin!"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              cursor: 'pointer',
              userSelect: 'none',
              transform: isFlipping 
                ? undefined 
                : `translate3d(${mousePos.x * 36}px, ${mousePos.y * 36}px, 0px) rotateY(${mousePos.x * 24}deg) rotateX(${-mousePos.y * 24}deg)`,
              transition: isFlipping 
                ? 'none' 
                : 'transform 0.12s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.12s ease-out',
              willChange: 'transform',
              boxShadow: isFlipping
                ? '0 0 85px rgba(245, 158, 11, 0.85), 0 0 130px rgba(217, 119, 6, 0.5)'
                : `${-mousePos.x * 32}px ${-mousePos.y * 32 + 10}px 65px rgba(245, 158, 11, 0.6), 0 0 95px rgba(217, 119, 6, 0.35)`,
              animation: isFlipping ? 'coinTossFlip 0.95s cubic-bezier(0.25, 1, 0.5, 1)' : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img 
              src="/bitcoin-gold.jpg" 
              alt="Golden Bitcoin" 
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            />
          </div>
        </div>
        <style>{`
          @keyframes coinFloat {
            0% { transform: translateY(0px) scale(1); }
            100% { transform: translateY(-10px) scale(1.02); }
          }
          @keyframes coinTossFlip {
            0% {
              transform: translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg) scale(1);
              filter: brightness(1);
            }
            30% {
              transform: translate3d(0, -60px, 80px) rotateY(360deg) rotateX(15deg) scale(1.15);
              filter: brightness(1.35);
            }
            65% {
              transform: translate3d(0, -25px, 40px) rotateY(720deg) rotateX(-8deg) scale(1.08);
              filter: brightness(1.2);
            }
            85% {
              transform: translate3d(0, 6px, 15px) rotateY(1080deg) rotateX(4deg) scale(0.98);
              filter: brightness(1.05);
            }
            100% {
              transform: translate3d(0, 0, 0) rotateY(1080deg) rotateX(0deg) scale(1);
              filter: brightness(1);
            }
          }
        `}</style>
      </div>
    </div>
  </div>
  </>
);
};

export default LoginPage;
