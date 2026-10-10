'use client';

import { Assessment, RetrofitRecommendation } from '@/lib/types';
import { DEMO_ASSESSMENT } from '@/lib/mockData';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface AppState {
  assessment: Assessment | null;
  hasAssessed: boolean;
  setAssessment: (a: Assessment) => void;
  toggleRetrofit: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [assessment, setAssessmentState] = useState<Assessment | null>(DEMO_ASSESSMENT);
  const [hasAssessed, setHasAssessed] = useState(false);

  const setAssessment = useCallback((a: Assessment) => {
    setAssessmentState(a);
    setHasAssessed(true);
  }, []);

  const toggleRetrofit = useCallback((id: string) => {
    setAssessmentState((prev) => {
      if (!prev) return prev;
      const recs: RetrofitRecommendation[] = prev.recommendations.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      );
      const enabledRecs = recs.filter((r) => r.enabled);
      return {
        ...prev,
        recommendations: recs,
        potentialCostSaving: enabledRecs.reduce((a, r) => a + r.annualSaving, 0),
        potentialCarbonSaving: enabledRecs.reduce((a, r) => a + r.carbonSavingKg, 0),
      };
    });
  }, []);

  return (
    <AppContext.Provider value={{ assessment, hasAssessed, setAssessment, toggleRetrofit }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
