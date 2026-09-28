import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style = {},
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${className}`}
      style={{
        background: 'rgba(10, 16, 32, 0.28)',
        backdropFilter: 'blur(20px) saturate(200%)',
        WebkitBackdropFilter: 'blur(20px) saturate(200%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '14px',
        padding: '16px',
        color: '#ffffff',
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)',
        position: 'relative',
        transition: 'all 0.25s ease',
        ...style
      }}
    >
      {children}
    </div>
  );
};
