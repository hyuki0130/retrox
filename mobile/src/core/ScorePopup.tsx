import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Fill, Text as SkiaText, Group, useFont, matchFont } from '@shopify/react-native-skia';
import { Platform } from 'react-native';

export interface ScorePopupItem {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

interface ScorePopupProps {
  popups: ScorePopupItem[];
  fontSize?: number;
}

const fontFamily = Platform.select({ ios: 'Helvetica', default: 'sans-serif' });

export const ScorePopup: React.FC<ScorePopupProps> = ({ popups, fontSize = 16 }) => {
  const font = matchFont({ fontFamily, fontSize, fontWeight: 'bold' });

  if (!font) return null;

  return (
    <Group>
      {popups.map((p) => {
        const alpha = p.life / p.maxLife;
        const yOffset = (1 - alpha) * 30;
        return (
          <SkiaText
            key={p.id}
            x={p.x}
            y={p.y - yOffset}
            text={p.text}
            color={p.color}
            opacity={alpha}
            font={font}
          />
        );
      })}
    </Group>
  );
};

export interface UseScorePopupReturn {
  popups: ScorePopupItem[];
  show: (x: number, y: number, score: number, color?: string) => void;
  showText: (x: number, y: number, text: string, color?: string) => void;
  clear: () => void;
}

let popupIdCounter = 0;

export function useScorePopup(): UseScorePopupReturn {
  const [popups, setPopups] = useState<ScorePopupItem[]>([]);
  const popupsRef = useRef<ScorePopupItem[]>([]);
  const animationRef = useRef<number | null>(null);

  const updatePopups = useCallback(() => {
    popupsRef.current = popupsRef.current
      .map((p) => ({ ...p, life: p.life - 1 }))
      .filter((p) => p.life > 0);

    setPopups([...popupsRef.current]);

    if (popupsRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(updatePopups);
    } else {
      animationRef.current = null;
    }
  }, []);

  const show = useCallback(
    (x: number, y: number, score: number, color = '#ffff00') => {
      const text = score >= 0 ? `+${score}` : `${score}`;
      const newPopup: ScorePopupItem = {
        id: popupIdCounter++,
        x,
        y,
        text,
        color,
        life: 45,
        maxLife: 45,
        scale: 1,
      };

      popupsRef.current = [...popupsRef.current, newPopup];
      setPopups([...popupsRef.current]);

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(updatePopups);
      }
    },
    [updatePopups]
  );

  const showText = useCallback(
    (x: number, y: number, text: string, color = '#ffffff') => {
      const newPopup: ScorePopupItem = {
        id: popupIdCounter++,
        x,
        y,
        text,
        color,
        life: 60,
        maxLife: 60,
        scale: 1.2,
      };

      popupsRef.current = [...popupsRef.current, newPopup];
      setPopups([...popupsRef.current]);

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(updatePopups);
      }
    },
    [updatePopups]
  );

  const clear = useCallback(() => {
    popupsRef.current = [];
    setPopups([]);
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

  return { popups, show, showText, clear };
}
