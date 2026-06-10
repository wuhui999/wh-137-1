import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Wind, Info, Plus } from 'lucide-react';
import { useAppStore } from '@/store';
import ScoreDisplay from '@/components/ScoreDisplay';
import { generateBreathingSuggestions } from '@/utils/music';
import type { BreathingPoint } from '@/types';

export default function Breathing() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const score = useAppStore((state) => state.getScoreById(scoreId || ''));
  const updateScore = useAppStore((state) => state.updateScore);

  if (!score) {
    return (
      <div className="text-center py-20">
        <p className="text-navy-300 mb-4">曲谱未找到</p>
        <button onClick={() => navigate('/')} className="btn-ghost">返回曲谱库</button>
      </div>
    );
  }

  const handleAddBreathing = (measure: number, position: number) => {
    const newPoint: BreathingPoint = { measure, position, type: 'custom' };
    updateScore(score.id, {
      breathingPoints: [...score.breathingPoints, newPoint],
    });
  };

  const handleRemoveBreathing = (index: number) => {
    const newPoints = score.breathingPoints.filter((_, i) => i !== index);
    updateScore(score.id, { breathingPoints: newPoints });
  };

  const handleAutoGenerate = () => {
    const suggested = generateBreathingSuggestions(score.notes) as BreathingPoint[];
    const existingCustom = score.breathingPoints.filter((bp) => bp.type === 'custom');
    updateScore(score.id, { breathingPoints: [...suggested, ...existingCustom] });
  };

  const suggestedCount = score.breathingPoints.filter((bp) => bp.type === 'suggested').length;
  const customCount = score.breathingPoints.filter((bp) => bp.type === 'custom').length;

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
            <h1 className="font-display text-2xl font-bold text-gold-400 flex items-center gap-2">
              <Wind className="w-6 h-6" />
              换气建议
            </h1>
            <p className="text-sm text-navy-400">{score.title}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/practice/${score.id}`)}
          className="btn-gold flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          开始练习
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 text-center">
          <div className="text-sm text-navy-400 mb-1">建议换气点</div>
          <div className="text-3xl font-display font-bold text-sky-400">{suggestedCount}</div>
          <div className="text-xs text-navy-500 mt-1">系统自动建议</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-sm text-navy-400 mb-1">自定义换气点</div>
          <div className="text-3xl font-display font-bold text-gold-400">{customCount}</div>
          <div className="text-xs text-navy-500 mt-1">手动添加</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-sm text-navy-400 mb-1">总小节数</div>
          <div className="text-3xl font-display font-bold text-navy-200">
            {new Set(score.notes.map((n) => n.measure)).size}
          </div>
          <div className="text-xs text-navy-500 mt-1">曲谱长度</div>
        </div>
        <div className="glass-card p-5 text-center">
          <div className="text-sm text-navy-400 mb-1">总音符数</div>
          <div className="text-3xl font-display font-bold text-navy-200">{score.notes.length}</div>
          <div className="text-xs text-navy-500 mt-1">{score.tempo} BPM</div>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-sky-500/10 border border-sky-400/20">
          <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-navy-200 space-y-1">
            <p><span className="text-sky-300 font-medium">⌒ 天蓝色标记</span>：系统根据乐句长度自动建议的换气位置</p>
            <p><span className="text-gold-300 font-medium">⌒ 金色标记</span>：你自己添加的自定义换气点，点击可删除</p>
            <p>点击每个小节末尾的 <Plus className="w-3.5 h-3.5 inline" /> 按钮可以添加自定义换气点</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-gold-300">曲谱换气标记</h2>
        <button onClick={handleAutoGenerate} className="btn-ghost flex items-center gap-2 text-sm">
          <Wind className="w-4 h-4" />
          重新生成建议
        </button>
      </div>

      <ScoreDisplay
        notes={score.notes}
        breathingPoints={score.breathingPoints}
        onAddBreathing={handleAddBreathing}
        onRemoveBreathing={handleRemoveBreathing}
      />

      <div className="glass-card p-5">
        <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">换气练习技巧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-navy-900/40">
            <h3 className="font-semibold text-gold-300 mb-2">1. 腹式呼吸</h3>
            <p className="text-sm text-navy-400">
              使用横膈膜呼吸，吸气时腹部向外扩张，呼气时腹部向内收缩。这样可以获得更多气息支持。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/40">
            <h3 className="font-semibold text-gold-300 mb-2">2. 口鼻同吸</h3>
            <p className="text-sm text-navy-400">
              换气时同时用口鼻吸气，可以在最短时间内获得最多空气，不耽误演奏节奏。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/40">
            <h3 className="font-semibold text-gold-300 mb-2">3. 乐句末换气</h3>
            <p className="text-sm text-navy-400">
              尽量在完整乐句结束后换气，避免在乐句中间断开，保持音乐的连贯性。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-navy-900/40">
            <h3 className="font-semibold text-gold-300 mb-2">4. 提前计划</h3>
            <p className="text-sm text-navy-400">
              演奏前先浏览曲谱，规划好换气位置。长乐句前确保气息充足，短乐句可以适度延长。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
