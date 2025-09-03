
"use client";

import { motion } from 'framer-motion';
import { SVGProps } from 'react';

const AnimatedToycathonLogo = (props: SVGProps<SVGSVGElement>) => {
  const circleVariants = {
    animate: {
      y: [0, -10, 0, 10, 0],
      rotate: [0, 15, 0, -15, 0],
      scale: [1, 1.05, 1, 0.95, 1],
      transition: {
        duration: (Math.random() * 4) + 4, // Random duration between 4s and 8s
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 541.04 454.49"
      {...props}
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g style={{ filter: 'url(#glow)' }}>
        <path
          d="M485.49,158.74c-35.32,1.13-64.84,30.34-65.58,65.68-.53,25.43,13.88,48.5,36.56,60.28-19.16,36.93-57.5,62.15-101.44,62.15s-82.28-25.22-101.44-62.15c22.68-11.78,37.09-34.85,36.56-60.28-.74-35.34-30.26-64.55-65.58-65.68-25.43-.81-48.5,13.6-60.28,36.27-36.93-19.16-62.15-57.5-62.15-101.44s25.22-82.28,62.15-101.44c11.78,22.68,34.85,37.09,60.28,36.56,35.32-1.13,64.84-30.34,65.58-65.68,.53-25.43-13.88-48.5-36.56-60.28,19.16-36.93,57.5-62.15,101.44-62.15s82.28,25.22,101.44,62.15c-22.68,11.78-37.09,34.85-36.56,60.28,.74,35.34,30.26,64.55,65.58,65.68,25.43,.81,48.5-13.6,60.28-36.27,36.93,19.16,62.15,57.5,62.15,101.44s-25.22,82.28-62.15,101.44c-11.78-22.68-34.85-37.09-60.28-36.56Z"
          transform="translate(-74.48 -67.75)"
          fill="#008080"
        />
        <g>
          <motion.circle
            cx="195.45"
            cy="93.3"
            r="39.81"
            fill="#ffc107"
            variants={circleVariants}
            animate="animate"
          />
          <motion.circle
            cx="93.49"
            cy="224.45"
            r="18.99"
            fill="#e53935"
            variants={circleVariants}
            animate="animate"
          />
          <motion.circle
            cx="345.59"
            cy="361.04"
            r="18.99"
            fill="#ffc107"
            variants={circleVariants}
            animate="animate"
          />
          <motion.circle
            cx="447.55"
            cy="230.13"
            r="39.81"
            fill="#e53935"
            variants={circleVariants}
            animate="animate"
          />
        </g>
      </g>
    </motion.svg>
  );
};

export default AnimatedToycathonLogo;
