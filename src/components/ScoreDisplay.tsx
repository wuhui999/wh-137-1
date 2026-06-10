import type { Note, BreathingPoint } from '@/types';
import { getKeyboardKeyForMidi, getDeviationColor } from '@/utils/music';
import type { NoteDeviation } from '@/types';

interface ScoreDisplayProps {
  notes: Note[];
  breathingPoints?: BreathingPoint[];
  currentNoteIndex?: number;
  highlightMeasure?: number;
  deviations?: NoteDeviation[];
  loopStart?: number;
  loopEnd?: number;
  onNoteClick?: (index: number) => void;
  onAddBreathing?: (measure: number, position: number) => void;
  onRemoveBreathing?: (idx: number) => void;
  showKeyboard?: boolean;
}

export default function ScoreDisplay({
  notes,
  breathingPoints = [],
  currentNoteIndex = -1,
  highlightMeasure,
  deviations = [],
  loopStart,
  loopEnd,
  onNoteClick,
  onAddBreathing,
  onRemoveBreathing,
  showKeyboard = false,
}: ScoreDisplayProps) {
  const measures: Record<number, { notes: (Note & { index: number })[]; breathing: (BreathingPoint & { index: number })[] }> = {};

  notes.forEach((note, idx) => {
    if (!measures[note.measure]) {
      measures[note.measure] = { notes: [], breathing: [] };
    }
    measures[note.measure].notes.push({ ...note, index: idx });
  });

  breathingPoints.forEach((bp, idx) => {
    if (!measures[bp.measure]) {
      measures[bp.measure] = { notes: [], breathing: [] };
    }
    measures[bp.measure].breathing.push({ ...bp, index: idx });
  });

  const sortedMeasures = Object.keys(measures)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  const getDeviationForNote = (noteIndex: number): NoteDeviation | undefined => {
    return deviations.find((d) => d.noteIndex === noteIndex);
  };

  return (
    <div className="space-y-4">
      {sortedMeasures.map((measureNum) => {
        const measure = measures[measureNum];
        const isInLoop =
          loopStart !== undefined &&
          loopEnd !== undefined &&
          measureNum >= loopStart &&
          measureNum <= loopEnd;

        return (
          <div
            key={measureNum}
            className={`glass-card p-5 transition-all ${
              highlightMeasure === measureNum ? 'ring-2 ring-gold-400 shadow-glow' : ''
            } ${isInLoop ? 'border-gold-400/40 bg-gold-400/5' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gold-400">
                第 {measureNum} 小节
              </span>
              {isInLoop && (
                <span className="text-xs px-2 py-1 rounded bg-gold-400/20 text-gold-300">
                  循环练习
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-3 min-h-[60px]">
              {measure.notes
                .sort((a, b) => a.position - b.position)
                .map((note) => {
                  const isCurrent = note.index === currentNoteIndex;
                  const deviation = getDeviationForNote(note.index);
                  const keyHint = showKeyboard ? getKeyboardKeyForMidi(note.midi) : null;

                  return (
                    <div
                      key={note.index}
                      className={`relative flex flex-col items-center cursor-pointer transition-all ${
                        isCurrent ? 'scale-110' : ''
                      }`}
                      onClick={() => onNoteClick?.(note.index)}
                    >
                      {deviation && (
                        <div
                          className="absolute -top-6 text-xs font-bold"
                          style={{ color: getDeviationColor(deviation.centsDeviation) }}
                        >
                          {deviation.centsDeviation > 0
                            ? `+${Math.round(deviation.centsDeviation)}`
                            : Math.round(deviation.centsDeviation)}
                        </div>
                      )}
                      <div
                        className={`w-12 h-14 rounded-lg flex flex-col items-center justify-center font-display text-lg font-semibold transition-all ${
                          isCurrent
                            ? 'bg-gold-400 text-navy-900 shadow-glow-lg note-playing'
                            : deviation
                            ? 'bg-navy-800/80'
                            : 'bg-navy-800/50 hover:bg-navy-700/60'
                        }`}
                        style={
                          deviation
                            ? {
                                borderWidth: '2px',
                                borderStyle: 'solid',
                                borderColor: getDeviationColor(deviation.centsDeviation),
                              }
                            : undefined
                        }
                      >
                        <span>{note.name.replace(/\d/, '')}</span>
                        <span className="text-xs opacity-70">
                          {note.name.match(/\d/)?.[0]}
                        </span>
                      </div>
                      <div className="text-xs text-navy-400 mt-1">{note.duration}拍</div>
                      {keyHint && (
                        <div className="text-[10px] px-1.5 py-0.5 rounded bg-navy-700/60 text-gold-300 mt-0.5">
                          {keyHint}
                        </div>
                      )}
                    </div>
                  );
                })}

              {measure.breathing
                .sort((a, b) => a.position - b.position)
                .map((bp) => (
                  <div
                    key={`bp-${bp.index}`}
                    className="relative flex flex-col items-center group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (bp.type === 'custom') onRemoveBreathing?.(bp.index);
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        bp.type === 'suggested'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                          : 'bg-gold-400/20 text-gold-300 border border-gold-400/40 cursor-pointer hover:bg-gold-400/30'
                      }`}
                      title={
                        bp.type === 'suggested' ? '建议换气点' : '自定义换气点（点击删除）'
                      }
                    >
                      ⌒
                    </div>
                    <div className="text-[10px] text-navy-400 mt-1">
                      {bp.type === 'suggested' ? '建议' : '自定义'}
                    </div>
                  </div>
                ))}

              {onAddBreathing && (
                <button
                  className="w-10 h-14 rounded-lg border border-dashed border-navy-500/50 text-navy-500 hover:border-gold-400/50 hover:text-gold-400 transition-all flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    const lastNote = measure.notes.sort((a, b) => b.position - a.position)[0];
                    onAddBreathing(measureNum, lastNote ? lastNote.position + lastNote.duration : 0);
                  }}
                >
                  +
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
