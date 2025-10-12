import { useState, useCallback } from 'react';
import { GcpPoint, Distance } from '../types/gcp';

export const useGcpManagement = () => {
  const [gcpPoints, setGcpPoints] = useState<Record<string, GcpPoint>>({});
  const [distances, setDistances] = useState<Distance[]>([]);

  const addGcpPoint = useCallback((point: GcpPoint) => {
    const newKey = Object.keys(gcpPoints).length.toString();
    setGcpPoints(prev => ({ ...prev, [newKey]: point }));
  }, [gcpPoints]);

  const removeGcpPoint = useCallback((key: string) => {
    setGcpPoints(prev => {
      const newPoints = { ...prev };
      const rest = Object.fromEntries(
        Object.entries(newPoints).filter(([k]) => k !== key)
      );
      return rest;
    });
  }, []);

  const updateDistance = useCallback((points: [number, number], distance: number) => {
    setDistances(prev => {
      const existingIndex = prev.findIndex(
        d => (d.points[0] === points[0] && d.points[1] === points[1]) ||
             (d.points[0] === points[1] && d.points[1] === points[0])
      );

      if (existingIndex >= 0) {
        const newDistances = [...prev];
        newDistances[existingIndex] = { points, distance };
        return newDistances;
      }

      return [...prev, { points, distance }];
    });
  }, []);

  return {
    gcpPoints,
    distances,
    addGcpPoint,
    removeGcpPoint,
    updateDistance,
    setGcpPoints,
    setDistances
  };
};
