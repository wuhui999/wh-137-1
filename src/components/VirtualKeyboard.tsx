import { useEffect, useState, useCallback, useRef } from 'react';
import { KEYBOARD_MAP, midiToName } from '@/utils/music';

interface VirtualKeyboardProps {
  onNoteOn: (midi: number) => void;
  onNoteOff?: (midi: number) => void;
  highlightedMidi?: number;
  startOctave?: number;
  endOctave?: number;
}

const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
const BLACK_KEY_POSITIONS: Record<number, number> = {
  1: 0.7,
  3: 1.7,
  6: 3.7,
  8: 4.7,
  10: 5.7,
};

export default function VirtualKeyboard({
  onNoteOn,
  onNoteOff,
  highlightedMidi,
  startOctave = 4,
  endOctave = 6,
}: VirtualKeyboardProps) {
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (midi: number) => {
      try {
        const ctx = ensureAudio();
        const freq = 440 * Math.pow(2, (midi - 69) / 12);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch (e) {
        // ignore audio errors
      }
    },
    [ensureAudio]
  );

  const handleNoteOn = useCallback(
    (midi: number) => {
      setActiveKeys((prev) => new Set(prev).add(midi));
      playTone(midi);
      onNoteOn(midi);
    },
    [onNoteOn, playTone]
  );

  const handleNoteOff = useCallback(
    (midi: number) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(midi);
        return next;
      });
      onNoteOff?.(midi);
    },
    [onNoteOff]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const midi = KEYBOARD_MAP[e.key.toLowerCase()];
      if (midi !== undefined) {
        handleNoteOn(midi);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const midi = KEYBOARD_MAP[e.key.toLowerCase()];
      if (midi !== undefined) {
        handleNoteOff(midi);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleNoteOn, handleNoteOff]);

  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      let access: MIDIAccess | null = null;
      const onMIDISuccess = (midiAccess: MIDIAccess) => {
        access = midiAccess;
        midiAccess.inputs.forEach((input) => {
          input.onmidimessage = (message) => {
            const [status, note, velocity] = message.data;
            if ((status & 0xf0) === 0x90 && velocity > 0) {
              handleNoteOn(note);
            } else if ((status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && velocity === 0)) {
              handleNoteOff(note);
            }
          };
        });
      };
      navigator.requestMIDIAccess().then(onMIDISuccess).catch(() => {});
      return () => {
        if (access) {
          access.inputs.forEach((input) => {
            input.onmidimessage = null;
          });
        }
      };
    }
  }, [handleNoteOn, handleNoteOff]);

  const whiteKeys: { midi: number; octave: number; noteIdx: number }[] = [];
  const blackKeys: { midi: number; octave: number; noteIdx: number; position: number }[] = [];

  for (let oct = startOctave; oct <= endOctave; oct++) {
    WHITE_KEYS.forEach((noteIdx) => {
      whiteKeys.push({ midi: (oct + 1) * 12 + noteIdx, octave: oct, noteIdx });
    });
    Object.entries(BLACK_KEY_POSITIONS).forEach(([noteIdxStr, position]) => {
      const noteIdx = parseInt(noteIdxStr, 10);
      blackKeys.push({ midi: (oct + 1) * 12 + noteIdx, octave: oct, noteIdx, position });
    });
  }

  const whiteKeyWidth = 48;

  return (
    <div className="relative">
      <div className="text-xs text-navy-400 mb-3 flex items-center gap-4">
        <span>键盘按键映射: A S D F G H J K L ; (白键) | W E T Y U O P (黑键)</span>
        <span className="text-gold-400">支持MIDI键盘输入</span>
      </div>
      <div
        className="relative h-36 rounded-xl overflow-hidden border border-gold-400/20"
        style={{ width: whiteKeys.length * whiteKeyWidth }}
      >
        <div className="absolute inset-0 flex">
          {whiteKeys.map((key, i) => {
            const isActive = activeKeys.has(key.midi) || highlightedMidi === key.midi;
            const kbdKey = Object.entries(KEYBOARD_MAP).find(([, v]) => v === key.midi)?.[0]?.toUpperCase();
            return (
              <div
                key={`w-${key.midi}`}
                className={`relative border-r border-navy-700 transition-all cursor-pointer flex flex-col justify-end items-center pb-2 select-none ${
                  isActive
                    ? 'bg-gradient-to-b from-gold-300 to-gold-500 shadow-glow'
                    : 'bg-gradient-to-b from-navy-50 to-navy-200 hover:from-navy-100 hover:to-navy-300'
                }`}
                style={{ width: whiteKeyWidth }}
                onMouseDown={() => handleNoteOn(key.midi)}
                onMouseUp={() => handleNoteOff(key.midi)}
                onMouseLeave={() => handleNoteOff(key.midi)}
              >
                <span className={`text-xs ${isActive ? 'text-navy-900' : 'text-navy-500'}`}>
                  {midiToName(key.midi).replace(/\d/, (m) => m)}
                </span>
                {kbdKey && (
                  <span className={`text-[10px] mt-0.5 px-1 py-0.5 rounded ${isActive ? 'bg-navy-900/20 text-navy-900' : 'bg-navy-200 text-navy-600'}`}>
                    {kbdKey}
                  </span>
                )}
                {key.noteIdx === 0 && i > 0 && (
                  <span className="absolute top-1 left-1 text-[10px] text-navy-400">
                    C{key.octave}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {blackKeys.map((key) => {
          const isActive = activeKeys.has(key.midi) || highlightedMidi === key.midi;
          const whiteKeysBefore = (key.octave - startOctave) * 7 + WHITE_KEYS.filter((n) => n <= key.noteIdx).length;
          const left = whiteKeysBefore * whiteKeyWidth + key.position * (whiteKeyWidth / 7) + 4;
          const kbdKey = Object.entries(KEYBOARD_MAP).find(([, v]) => v === key.midi)?.[0]?.toUpperCase();
          return (
            <div
              key={`b-${key.midi}`}
              className={`absolute top-0 z-10 rounded-b-md transition-all cursor-pointer flex flex-col justify-end items-center pb-1 select-none ${
                isActive
                  ? 'bg-gradient-to-b from-gold-400 to-gold-600 shadow-glow'
                  : 'bg-gradient-to-b from-navy-700 to-navy-900 hover:from-navy-600 hover:to-navy-800'
              }`}
              style={{
                left,
                width: whiteKeyWidth * 0.6,
                height: '65%',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                handleNoteOn(key.midi);
              }}
              onMouseUp={() => handleNoteOff(key.midi)}
              onMouseLeave={() => handleNoteOff(key.midi)}
            >
              {kbdKey && (
                <span className={`text-[9px] px-1 rounded ${isActive ? 'text-navy-900' : 'text-navy-400'}`}>
                  {kbdKey}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
