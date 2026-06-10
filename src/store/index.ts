import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Score, PracticeRecord, PracticeSession, NoteDeviation } from '@/types';
import { createSampleScores } from '@/utils/sampleData';
import { generateId } from '@/utils/music';

interface AppState {
  scores: Score[];
  practiceRecords: PracticeRecord[];
  currentSession: PracticeSession | null;

  addScore: (score: Omit<Score, 'id' | 'createdAt' | 'updatedAt'>) => Score;
  updateScore: (id: string, updates: Partial<Score>) => void;
  deleteScore: (id: string) => void;
  getScoreById: (id: string) => Score | undefined;

  startSession: (scoreId: string, loopStart?: number, loopEnd?: number) => void;
  endSession: () => void;
  addDeviation: (deviation: NoteDeviation) => void;
  setCurrentNote: (index: number) => void;
  setLoopMode: (enabled: boolean, start?: number, end?: number) => void;
  togglePlaying: (playing: boolean) => void;

  addPracticeRecord: (record: Omit<PracticeRecord, 'id' | 'createdAt'>) => PracticeRecord;
  clearHistory: () => void;
  exportData: () => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      scores: [],
      practiceRecords: [],
      currentSession: null,

      addScore: (scoreData) => {
        const now = new Date().toISOString();
        const newScore: Score = {
          ...scoreData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ scores: [...state.scores, newScore] }));
        return newScore;
      },

      updateScore: (id, updates) => {
        set((state) => ({
          scores: state.scores.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      deleteScore: (id) => {
        set((state) => ({
          scores: state.scores.filter((s) => s.id !== id),
        }));
      },

      getScoreById: (id) => {
        return get().scores.find((s) => s.id === id);
      },

      startSession: (scoreId, loopStart, loopEnd) => {
        set({
          currentSession: {
            scoreId,
            currentNoteIndex: 0,
            currentMeasure: 0,
            loopMode: loopStart !== undefined && loopEnd !== undefined,
            loopStart: loopStart ?? 0,
            loopEnd: loopEnd ?? 0,
            deviations: [],
            startTime: Date.now(),
            isPlaying: false,
          },
        });
      },

      endSession: () => {
        const session = get().currentSession;
        if (!session) return;

        const duration = Math.floor((Date.now() - session.startTime) / 1000);
        const totalNotes = session.deviations.length;
        const accurateNotes = session.deviations.filter((d) => Math.abs(d.centsDeviation) <= 25).length;
        const avgCents =
          session.deviations.length > 0
            ? session.deviations.reduce((sum, d) => sum + d.centsDeviation, 0) / session.deviations.length
            : 0;

        const record: PracticeRecord = {
          id: generateId(),
          scoreId: session.scoreId,
          date: new Date().toISOString().split('T')[0],
          duration,
          totalNotes,
          accurateNotes,
          deviations: session.deviations,
          avgCents,
          createdAt: new Date().toISOString(),
        };

        get().addPracticeRecord({
          scoreId: record.scoreId,
          date: record.date,
          duration: record.duration,
          totalNotes: record.totalNotes,
          accurateNotes: record.accurateNotes,
          deviations: record.deviations,
          avgCents: record.avgCents,
        });

        set({ currentSession: null });
      },

      addDeviation: (deviation) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              deviations: [...state.currentSession.deviations, deviation],
            },
          };
        });
      },

      setCurrentNote: (index) => {
        set((state) => {
          if (!state.currentSession) return state;
          const score = get().getScoreById(state.currentSession.scoreId);
          const note = score?.notes[index];
          return {
            currentSession: {
              ...state.currentSession,
              currentNoteIndex: index,
              currentMeasure: note?.measure ?? 0,
            },
          };
        });
      },

      setLoopMode: (enabled, start, end) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              loopMode: enabled,
              loopStart: start ?? state.currentSession.loopStart,
              loopEnd: end ?? state.currentSession.loopEnd,
            },
          };
        });
      },

      togglePlaying: (playing) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: {
              ...state.currentSession,
              isPlaying: playing,
            },
          };
        });
      },

      addPracticeRecord: (recordData) => {
        const record: PracticeRecord = {
          ...recordData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ practiceRecords: [...state.practiceRecords, record] }));
        return record;
      },

      clearHistory: () => {
        set({ practiceRecords: [] });
      },

      exportData: () => {
        const state = get();
        const exportData = {
          exportedAt: new Date().toISOString(),
          scores: state.scores,
          practiceRecords: state.practiceRecords,
        };
        return JSON.stringify(exportData, null, 2);
      },
    }),
    {
      name: 'harmonica-practice-storage',
      onRehydrateStorage: () => (state) => {
        if (state && state.scores.length === 0) {
          state.scores = createSampleScores();
        }
      },
    }
  )
);
