import type { Score, Note, BreathingPoint } from '@/types';
import { generateId, generateBreathingSuggestions } from './music';

function createNote(midi: number, measure: number, position: number, duration: number = 1): Note {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return {
    midi,
    name: `${NOTE_NAMES[noteIndex]}${octave}`,
    duration,
    measure,
    position,
  };
}

export function createSampleScores(): Score[] {
  const twinkleNotes: Note[] = [
    createNote(60, 1, 0, 1),
    createNote(60, 1, 1, 1),
    createNote(67, 1, 2, 1),
    createNote(67, 1, 3, 1),
    createNote(69, 2, 0, 1),
    createNote(69, 2, 1, 1),
    createNote(67, 2, 2, 2),
    createNote(65, 3, 0, 1),
    createNote(65, 3, 1, 1),
    createNote(64, 3, 2, 1),
    createNote(64, 3, 3, 1),
    createNote(62, 4, 0, 1),
    createNote(62, 4, 1, 1),
    createNote(60, 4, 2, 2),
  ];

  const odeNotes: Note[] = [
    createNote(64, 1, 0, 1),
    createNote(64, 1, 1, 1),
    createNote(65, 1, 2, 1),
    createNote(67, 1, 3, 1),
    createNote(67, 2, 0, 1),
    createNote(65, 2, 1, 1),
    createNote(64, 2, 2, 1),
    createNote(62, 2, 3, 1),
    createNote(60, 3, 0, 1),
    createNote(60, 3, 1, 1),
    createNote(62, 3, 2, 1),
    createNote(64, 3, 3, 1),
    createNote(64, 4, 0, 1.5),
    createNote(62, 4, 1.5, 0.5),
    createNote(62, 4, 2, 2),
  ];

  const maryNotes: Note[] = [
    createNote(64, 1, 0, 1),
    createNote(62, 1, 1, 1),
    createNote(60, 1, 2, 1),
    createNote(62, 1, 3, 1),
    createNote(64, 2, 0, 1),
    createNote(64, 2, 1, 1),
    createNote(64, 2, 2, 2),
    createNote(62, 3, 0, 1),
    createNote(62, 3, 1, 1),
    createNote(62, 3, 2, 2),
    createNote(64, 4, 0, 1),
    createNote(67, 4, 1, 1),
    createNote(67, 4, 2, 2),
  ];

  const now = new Date().toISOString();

  return [
    {
      id: generateId(),
      title: '小星星',
      description: '经典入门练习曲，适合初学者熟悉音准',
      key: 'C',
      tempo: 80,
      notes: twinkleNotes,
      breathingPoints: generateBreathingSuggestions(twinkleNotes) as BreathingPoint[],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: '欢乐颂',
      description: '贝多芬经典旋律，练习稳定气息',
      key: 'C',
      tempo: 90,
      notes: odeNotes,
      breathingPoints: generateBreathingSuggestions(odeNotes) as BreathingPoint[],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: generateId(),
      title: '玛丽有只小羊羔',
      description: '简单重复的旋律，练习音阶连贯',
      key: 'C',
      tempo: 100,
      notes: maryNotes,
      breathingPoints: generateBreathingSuggestions(maryNotes) as BreathingPoint[],
      createdAt: now,
      updatedAt: now,
    },
  ];
}
