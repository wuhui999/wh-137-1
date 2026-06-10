import type { Note } from '@/types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_NAMES_CN = ['1', '#1', '2', '#2', '3', '4', '#4', '5', '#5', '6', '#6', '7'];

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidi(freq: number): number {
  return Math.round(12 * Math.log2(freq / 440) + 69);
}

export function midiToName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function nameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60;
  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = NOTE_NAMES.indexOf(note);
  return (octave + 1) * 12 + noteIndex;
}

export function jianpuToMidi(num: number, octave: number = 4, key: string = 'C'): number {
  const majorScale = [0, 2, 4, 5, 7, 9, 11];
  if (num < 1 || num > 7) return 60;
  const keyOffset = NOTE_NAMES.indexOf(key.replace('maj', '').replace('Major', ''));
  const baseMidi = (octave + 1) * 12 + keyOffset;
  return baseMidi + majorScale[num - 1];
}

export function midiToJianpu(midi: number, key: string = 'C'): { num: number; octave: number; sharp: boolean } {
  const majorScale = [0, 2, 4, 5, 7, 9, 11];
  const keyOffset = NOTE_NAMES.indexOf(key.replace('maj', '').replace('Major', ''));
  const relativeSemitone = ((midi % 12) - keyOffset + 12) % 12;
  
  let scaleIndex = majorScale.indexOf(relativeSemitone);
  let sharp = false;
  
  if (scaleIndex === -1) {
    scaleIndex = majorScale.indexOf((relativeSemitone + 11) % 12);
    sharp = true;
  }
  
  const octave = Math.floor(midi / 12) - 1;
  
  return {
    num: scaleIndex + 1,
    octave,
    sharp,
  };
}

export function calculateCentsDeviation(targetFreq: number, actualFreq: number): number {
  if (targetFreq <= 0 || actualFreq <= 0) return 0;
  return 1200 * Math.log2(actualFreq / targetFreq);
}

export function calculateCentsFromMidi(targetMidi: number, actualMidi: number): number {
  const targetFreq = midiToFreq(targetMidi);
  const actualFreq = midiToFreq(actualMidi);
  return calculateCentsDeviation(targetFreq, actualFreq);
}

export function getDeviationColor(cents: number): string {
  const abs = Math.abs(cents);
  if (abs <= 10) return '#4ade80';
  if (abs <= 25) return '#d4a857';
  if (abs <= 50) return '#fb923c';
  return '#ef4444';
}

export function getDeviationLabel(cents: number): string {
  if (Math.abs(cents) <= 10) return '准确';
  if (cents > 0) return `偏高 ${Math.round(cents)} 音分`;
  return `偏低 ${Math.round(Math.abs(cents))} 音分`;
}

export function generateBreathingSuggestions(notes: Note[]): { measure: number; position: number; type: 'suggested' }[] {
  const points: { measure: number; position: number; type: 'suggested' }[] = [];
  const grouped: Record<number, Note[]> = {};
  
  notes.forEach((note) => {
    if (!grouped[note.measure]) grouped[note.measure] = [];
    grouped[note.measure].push(note);
  });
  
  Object.keys(grouped).forEach((m) => {
    const measure = parseInt(m, 10);
    const measureNotes = grouped[measure];
    measureNotes.sort((a, b) => a.position - b.position);
    
    if (measureNotes.length >= 4) {
      const lastNote = measureNotes[measureNotes.length - 1];
      points.push({
        measure,
        position: lastNote.position + lastNote.duration,
        type: 'suggested',
      });
    }
  });
  
  return points;
}

export const KEYBOARD_MAP: Record<string, number> = {
  'a': 60,
  's': 62,
  'd': 64,
  'f': 65,
  'g': 67,
  'h': 69,
  'j': 71,
  'k': 72,
  'l': 74,
  ';': 76,
  'w': 61,
  'e': 63,
  't': 66,
  'y': 68,
  'u': 70,
  'o': 73,
  'p': 75,
};

export function getKeyboardKeyForMidi(midi: number): string | null {
  for (const [key, value] of Object.entries(KEYBOARD_MAP)) {
    if (value === midi) return key.toUpperCase();
  }
  const lowerMidi = midi - 12;
  for (const [key, value] of Object.entries(KEYBOARD_MAP)) {
    if (value === lowerMidi) return key.toUpperCase() + '-1';
  }
  const higherMidi = midi + 12;
  for (const [key, value] of Object.entries(KEYBOARD_MAP)) {
    if (value === higherMidi) return key.toUpperCase() + '+1';
  }
  return null;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
