import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Circle, Group } from '@shopify/react-native-skia';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface ParticleSystemProps {
  particles: Particle[];
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ particles }) => {
  return (
    <Group>
      {particles.map((p) => {
        const alpha = p.life / p.maxLife;
        const size = p.size * alpha;
        return (
          <Circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={size}
            color={p.color}
            opacity={alpha}
          />
        );
      })}
    </Group>
  );
};

export interface UseParticlesReturn {
  particles: Particle[];
  emit: (x: number, y: number, count: number, color: string, options?: EmitOptions) => void;
  burst: (x: number, y: number, count: number, colors: string[]) => void;
  clear: () => void;
}

interface EmitOptions {
  speed?: number;
  size?: number;
  life?: number;
  spread?: number;
  gravity?: number;
}

let particleIdCounter = 0;

export function useParticles(): UseParticlesReturn {
  const [particles, setParticles] = useState<Particle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const gravityRef = useRef(0.2);

  const updateParticles = useCallback(() => {
    particlesRef.current = particlesRef.current
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + gravityRef.current,
        life: p.life - 1,
      }))
      .filter((p) => p.life > 0);

    setParticles([...particlesRef.current]);

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(updateParticles);
    } else {
      animationRef.current = null;
    }
  }, []);

  const emit = useCallback(
    (x: number, y: number, count: number, color: string, options?: EmitOptions) => {
      const {
        speed = 5,
        size = 4,
        life = 30,
        spread = Math.PI * 2,
        gravity = 0.2,
      } = options || {};

      gravityRef.current = gravity;

      const newParticles: Particle[] = Array.from({ length: count }, () => {
        const angle = Math.random() * spread - spread / 2;
        const velocity = Math.random() * speed + speed * 0.5;
        return {
          id: particleIdCounter++,
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 2,
          life,
          maxLife: life,
          color,
          size: size + Math.random() * 2,
        };
      });

      particlesRef.current = [...particlesRef.current, ...newParticles];
      setParticles([...particlesRef.current]);

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(updateParticles);
      }
    },
    [updateParticles]
  );

  const burst = useCallback(
    (x: number, y: number, count: number, colors: string[]) => {
      const newParticles: Particle[] = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const speed = 3 + Math.random() * 4;
        return {
          id: particleIdCounter++,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 25 + Math.random() * 10,
          maxLife: 35,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 3 + Math.random() * 3,
        };
      });

      particlesRef.current = [...particlesRef.current, ...newParticles];
      setParticles([...particlesRef.current]);

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(updateParticles);
      }
    },
    [updateParticles]
  );

  const clear = useCallback(() => {
    particlesRef.current = [];
    setParticles([]);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { particles, emit, burst, clear };
}
