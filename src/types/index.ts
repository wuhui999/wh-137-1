export interface Note {
  midi: number;
  name: string;
  duration: number;
  measure: number;
  position: number;
}

export interface BreathingPoint {
  measure: number;
  position: number;
  type: 'suggested' | 'custom';
}

export interface Score {
  id: string;
  title: string;
  description: string;
  key: string;
  tempo: number;
  notes: Note[];
  breathingPoints: BreathingPoint[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteDeviation {
  noteIndex: number;
  targetMidi: number;
  actualMidi: number;
  centsDeviation: number;
  measure: number;
}

export interface PracticeRecord {
  id: string;
  scoreId: string;
  date: string;
  duration: number;
  totalNotes: number;
  accurateNotes: number;
  deviations: NoteDeviation[];
  avgCents: number;
  createdAt: string;
}

export interface PracticeSession {
  scoreId: string;
  currentNoteIndex: number;
  currentMeasure: number;
  loopMode: boolean;
  loopStart: number;
  loopEnd: number;
  deviations: NoteDeviation[];
  startTime: number;
  isPlaying: boolean;
}
