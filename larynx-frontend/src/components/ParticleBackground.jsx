/**
 * Reusable particle background component
 * Eliminates duplicate particle generation code across pages
 */

import React, { useState, useEffect } from 'react';

const ParticleBackground = ({ 
  children, 
  particleCount = 50, 
  className = "",
  style = {} 
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate floating particles
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.2 + 0.05,
          duration: Math.random() * 20 + 15,
          delay: Math.random() * 10
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, [particleCount]);

  const particleStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 1,
    ...style
  };

  const contentStyles = {
    position: 'relative',
    zIndex: 2
  };

  return (
    <div className={className} style={particleStyles}>
      {/* Particle elements */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            opacity: particle.opacity,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
      
      {/* Content */}
      <div style={contentStyles}>
        {children}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

export default ParticleBackground;
