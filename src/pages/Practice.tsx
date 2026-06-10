import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Square,
  RotateCcw,
  Repeat,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Wind,
} from 'lucide-react';
import { useAppStore } from '@/store';
import ScoreDisplay from '@/components/ScoreDisplay';
import VirtualKeyboard from '@/components/VirtualKeyboard';
import DeviationGauge from '@/components/DeviationGauge';
import {
  calculateCentsFromMidi,
  getDeviationLabel,
  getDeviationColor,
  formatDuration,
} from '@/utils/music';
import type { NoteDeviation } from '@/types';

export default function Practice() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const score = useAppStore((state) => state.getScoreById(scoreId || ''));
  const startSession = useAppStore((state) => state.startSession);
  const endSession = useAppStore((state) => state.endSession);
  const setCurrentNote = useAppStore((state) => state.setCurrentNote);
  const addDeviation = useAppStore((state) => state.addDeviation);
  const setLoopMode = useAppStore((state) => state.setLoopMode);
  const session = useAppStore((state) => state.currentSession);

  const [currentCents, setCurrentCents] = useState(0);
  const [lastDeviation, setLastDeviation] = useState<NoteDeviation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(1);
  const [loopEnd, setLoopEnd] = useState(2);
  const [elapsed, setElapsed] = useState(0);

  const measures = useMemo(() => {
    if (!score) return [];
    return Array.from(new Set(score.notes.map((n) => n.measure))).sort((a, b) => a - b);
  }, [score]);

  const currentNoteIndex = session?.currentNoteIndex ?? 0;
  const currentNote = score?.notes[currentNoteIndex];

  useEffect(() => {
    if (!scoreId) return;
    startSession(scoreId);
    return () => {
      if (session) endSession();
    };
  }, [scoreId]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNoteOn = useCallback(
    (midi: number) => {
      if (!score || !currentNote) return;

      const cents = calculateCentsFromMidi(currentNote.midi, midi);
      setCurrentCents(cents);

      const deviation: NoteDeviation = {
        noteIndex: currentNoteIndex,
        targetMidi: currentNote.midi,
        actualMidi: midi,
        centsDeviation: cents,
        measure: currentNote.measure,
      };
      setLastDeviation(deviation);
      addDeviation(deviation);

      if (isPlaying) {
        setTimeout(() => {
          const nextIndex = currentNoteIndex + 1;
          if (nextIndex < score.notes.length) {
            if (loopEnabled) {
              const nextNote = score.notes[nextIndex];
              if (nextNote.measure > loopEnd) {
                const firstInLoop = score.notes.findIndex((n) => n.measure === loopStart);
                setCurrentNote(firstInLoop >= 0 ? firstInLoop : 0);
              } else {
                setCurrentNote(nextIndex);
              }
            } else {
              setCurrentNote(nextIndex);
            }
          } else if (loopEnabled) {
            const firstInLoop = score.notes.findIndex((n) => n.measure === loopStart);
            setCurrentNote(firstInLoop >= 0 ? firstInLoop : 0);
          }
        }, score.tempo ? (60 / score.tempo) * 500 : 500);
      }
    },
    [score, currentNote, currentNoteIndex, isPlaying, loopEnabled, loopStart, loopEnd]
  );

  const handlePrevNote = () => {
    if (currentNoteIndex > 0) setCurrentNote(currentNoteIndex - 1);
  };

  const handleNextNote = () => {
    if (score && currentNoteIndex < score.notes.length - 1) {
      setCurrentNote(currentNoteIndex + 1);
    }
  };

  const handleReset = () => {
    setCurrentNote(0);
    setCurrentCents(0);
    setLastDeviation(null);
    setElapsed(0);
  };

  const togglePlaying = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleLoop = () => {
    const newEnabled = !loopEnabled;
    setLoopEnabled(newEnabled);
    setLoopMode(newEnabled, loopStart, loopEnd);
  };

  if (!score) {
    return (
      <div className="text-center py-20">
        <p className="text-navy-300 mb-4">曲谱未找到</p>
        <button onClick={() => navigate('/')} className="btn-ghost">
          返回曲谱库
        </button>
      </div>
    );
  }

  const avgCents =
    session?.deviations && session.deviations.length > 0
      ? session.deviations.reduce((sum, d) => sum + d.centsDeviation, 0) / session.deviations.length
      : 0;

  const accuracy =
    session?.deviations && session.deviations.length > 0
      ? Math.round(
          (session.deviations.filter((d) => Math.abs(d.centsDeviation) <= 25).length /
            session.deviations.length) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg glass-card hover:border-gold-400/30 text-navy-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-gold-400">{score.title}</h1>
            <p className="text-sm text-navy-400">
              {score.key}大调 · {score.tempo} BPM · 共 {score.notes.length} 个音符
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/deviation/${score.id}`)}
            className="btn-ghost flex items-center gap-2 text-sm py-2 px-4"
          >
            <TrendingUp className="w-4 h-4" />
            偏差分析
          </button>
          <button
            onClick={() => navigate(`/breathing/${score.id}`)}
            className="btn-ghost flex items-center gap-2 text-sm py-2 px-4"
          >
            <Wind className="w-4 h-4" />
            换气建议
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-gold-300">曲谱</h2>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={handlePrevNote}
                  disabled={currentNoteIndex === 0}
                  className="p-2 rounded-lg bg-navy-800/60 text-navy-300 hover:text-gold-400 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-navy-300 px-2">
                  {currentNoteIndex + 1} / {score.notes.length}
                </span>
                <button
                  onClick={handleNextNote}
                  disabled={currentNoteIndex >= score.notes.length - 1}
                  className="p-2 rounded-lg bg-navy-800/60 text-navy-300 hover:text-gold-400 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <ScoreDisplay
              notes={score.notes}
              breathingPoints={score.breathingPoints}
              currentNoteIndex={currentNoteIndex}
              deviations={session?.deviations}
              loopStart={loopEnabled ? loopStart : undefined}
              loopEnd={loopEnabled ? loopEnd : undefined}
              showKeyboard
            />
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-gold-300">输入</h2>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-navy-300">
                  <span>练习时长:</span>
                  <span className="text-gold-400 font-mono">{formatDuration(elapsed)}</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto scrollbar-thin pb-2">
              <VirtualKeyboard
                onNoteOn={handleNoteOn}
                highlightedMidi={currentNote?.midi}
              />
            </div>

            <div className="flex items-center gap-3 mt-5">
              <button onClick={togglePlaying} className={isPlaying ? 'btn-ghost' : 'btn-gold'}>
                {isPlaying ? (
                  <span className="flex items-center gap-2">
                    <Square className="w-4 h-4" /> 停止
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" /> 开始
                  </span>
                )}
              </button>
              <button onClick={handleReset} className="btn-ghost flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> 重置
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={toggleLoop}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    loopEnabled
                      ? 'bg-gold-400/20 border-gold-400/50 text-gold-300'
                      : 'bg-navy-800/40 border-navy-600/30 text-navy-300 hover:border-gold-400/30'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  小节循环
                </button>

                {loopEnabled && (
                  <div className="flex items-center gap-2 text-sm">
                    <select
                      value={loopStart}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setLoopStart(v);
                        if (v > loopEnd) setLoopEnd(v);
                        setLoopMode(true, v, loopEnd);
                      }}
                      className="input-dark py-1.5 px-2 text-sm"
                    >
                      {measures.map((m) => (
                        <option key={m} value={m}>
                          第{m}小节
                        </option>
                      ))}
                    </select>
                    <span className="text-navy-400">到</span>
                    <select
                      value={loopEnd}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setLoopEnd(v);
                        setLoopMode(true, loopStart, v);
                      }}
                      className="input-dark py-1.5 px-2 text-sm"
                    >
                      {measures.filter((m) => m >= loopStart).map((m) => (
                        <option key={m} value={m}>
                          第{m}小节
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">目标音高</h2>
            {currentNote && (
              <div className="text-center py-6">
                <div className="inline-flex flex-col items-center">
                  <div className="text-7xl font-display font-bold text-gold-400 mb-2">
                    {currentNote.name.replace(/\d/, '')}
                  </div>
                  <div className="text-lg text-navy-300 mb-4">
                    八度: {currentNote.name.match(/\d/)?.[0]} · {currentNote.duration}拍
                  </div>
                  <div className="text-sm text-navy-400">
                    MIDI: {currentNote.midi} · 小节 {currentNote.measure}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card p-5">
            <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">音高偏差</h2>
            <DeviationGauge cents={currentCents} />
            <div className="text-center mt-2">
              <span className="text-lg font-semibold" style={{ color: getDeviationColor(currentCents) }}>
                {getDeviationLabel(currentCents)}
              </span>
            </div>
          </div>

          <div className="glass-card p-5">
            <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">本次练习</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-navy-400">已吹音符</span>
                <span className="text-gold-300 font-semibold">{session?.deviations.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-400">准确率 (±25音分)</span>
                <span className="text-gold-300 font-semibold">{accuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-400">平均偏差</span>
                <span
                  className="font-semibold"
                  style={{ color: getDeviationColor(avgCents) }}
                >
                  {avgCents > 0 ? `+${avgCents.toFixed(1)}` : avgCents.toFixed(1)} 音分
                </span>
              </div>
              {lastDeviation && (
                <div className="pt-3 border-t border-gold-400/10">
                  <div className="text-xs text-navy-500 mb-1">最近一次</div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-navy-300">
                      目标: {score.notes[lastDeviation.noteIndex]?.name} → 实际:{' '}
                      {(() => {
                        const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                        return `${names[lastDeviation.actualMidi % 12]}${Math.floor(lastDeviation.actualMidi / 12) - 1}`;
                      })()}
                    </span>
                    <span style={{ color: getDeviationColor(lastDeviation.centsDeviation) }}>
                      {lastDeviation.centsDeviation > 0 ? '+' : ''}
                      {Math.round(lastDeviation.centsDeviation)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
