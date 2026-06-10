import { useState } from 'react';
import type { Score, Note, BreathingPoint } from '@/types';
import { jianpuToMidi, midiToName, generateBreathingSuggestions, generateId } from '@/utils/music';
import { X } from 'lucide-react';

interface ScoreEditorProps {
  score?: Score | null;
  onSave: (score: Omit<Score, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function ScoreEditor({ score, onSave, onCancel }: ScoreEditorProps) {
  const [title, setTitle] = useState(score?.title ?? '');
  const [description, setDescription] = useState(score?.description ?? '');
  const [key, setKey] = useState(score?.key ?? 'C');
  const [tempo, setTempo] = useState(score?.tempo ?? 80);
  const [jianpuInput, setJianpuInput] = useState('');
  const [notes, setNotes] = useState<Note[]>(score?.notes ?? []);

  const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'F#', 'Bb'];

  const parseJianpu = () => {
    const tokens = jianpuInput.split(/\s+/).filter(Boolean);
    const parsedNotes: Note[] = [];
    let measure = 1;
    let position = 0;
    let beatCount = 0;
    const beatsPerMeasure = 4;

    tokens.forEach((token) => {
      const match = token.match(/^([1-7])([#b]?)(['.]*)(\d*)$/);
      if (!match) return;

      const [, numStr, accidental, dots, durStr] = match;
      const num = parseInt(numStr, 10);
      let octave = 4;

      for (const ch of dots) {
        if (ch === "'") octave++;
        else if (ch === '.') octave--;
      }

      let midi = jianpuToMidi(num, octave, key);
      if (accidental === '#') midi++;
      else if (accidental === 'b') midi--;

      let duration = durStr ? parseInt(durStr, 10) : 1;
      if (duration < 0.5) duration = 1;

      parsedNotes.push({
        midi,
        name: midiToName(midi),
        duration,
        measure,
        position,
      });

      beatCount += duration;
      position += duration;

      if (beatCount >= beatsPerMeasure) {
        measure++;
        position = 0;
        beatCount = 0;
      }
    });

    setNotes(parsedNotes);
  };

  const handleSubmit = () => {
    if (!title.trim() || notes.length === 0) return;

    const breathingPoints = score?.breathingPoints ?? (generateBreathingSuggestions(notes) as BreathingPoint[]);

    onSave({
      title: title.trim(),
      description: description.trim(),
      key,
      tempo,
      notes,
      breathingPoints,
    });
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between p-6 border-b border-gold-400/10">
          <h2 className="font-display text-2xl font-bold text-gold-400">
            {score ? '编辑曲谱' : '新建曲谱'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-navy-700/50 text-navy-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-navy-300 mb-2">曲谱名称</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：小星星"
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">描述</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="简短描述"
                className="input-dark w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">调号</label>
              <select value={key} onChange={(e) => setKey(e.target.value)} className="input-dark w-full">
                {keys.map((k) => (
                  <option key={k} value={k}>
                    {k}大调
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-navy-300 mb-2">速度 (BPM): {tempo}</label>
              <input
                type="range"
                min="40"
                max="200"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-navy-300 mb-2">简谱录入（空格分隔）</label>
            <div className="text-xs text-navy-500 mb-2">
              规则：1-7 为音符，' 升高八度，. 降低八度，数字为拍数。例：1 2 3' 4.5 52
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={jianpuInput}
                onChange={(e) => setJianpuInput(e.target.value)}
                placeholder="1 1 5 5 6 6 5 4 4 3 3 2 2 1"
                className="input-dark flex-1"
              />
              <button onClick={parseJianpu} className="btn-ghost">
                解析
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-navy-300 mb-2">
              音符列表 ({notes.length} 个)
            </label>
            <div className="glass-card p-4 max-h-48 overflow-y-auto scrollbar-thin">
              {notes.length === 0 ? (
                <p className="text-navy-400 text-sm text-center py-4">暂无音符，请先使用简谱录入</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {notes.map((note, i) => (
                    <div
                      key={i}
                      className="px-2.5 py-1.5 rounded-lg bg-navy-800/70 border border-gold-400/10 text-sm"
                    >
                      <span className="font-display font-semibold text-gold-300">{note.name}</span>
                      <span className="text-navy-400 text-xs ml-1">{note.duration}拍</span>
                      <span className="text-navy-500 text-xs ml-1">M{note.measure}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gold-400/10">
          <button onClick={onCancel} className="btn-ghost">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || notes.length === 0}
            className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
