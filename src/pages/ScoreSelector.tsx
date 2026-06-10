import { useNavigate } from 'react-router-dom';
import { Music, ArrowLeft, TrendingUp, Wind } from 'lucide-react';
import { useAppStore } from '@/store';

interface ScoreSelectorProps {
  mode: 'deviation' | 'breathing';
}

export default function ScoreSelector({ mode }: ScoreSelectorProps) {
  const navigate = useNavigate();
  const scores = useAppStore((state) => state.scores);

  const title = mode === 'deviation' ? '选择曲谱查看偏差分析' : '选择曲谱查看换气建议';
  const Icon = mode === 'deviation' ? TrendingUp : Wind;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg glass-card hover:border-gold-400/30 text-navy-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gold-400 flex items-center gap-2">
            <Icon className="w-6 h-6" />
            {title}
          </h1>
          <p className="text-sm text-navy-400">请选择要查看的曲谱</p>
        </div>
      </div>

      {scores.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Music className="w-16 h-16 text-navy-500 mx-auto mb-4" />
          <p className="text-navy-300">暂无曲谱，请先到曲谱库创建</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {scores.map((score) => (
            <div
              key={score.id}
              className="glass-card glass-card-hover p-5 cursor-pointer"
              onClick={() => navigate(mode === 'deviation' ? `/deviation/${score.id}` : `/breathing/${score.id}`)}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-300/20 to-gold-500/20 flex items-center justify-center mb-3">
                <Music className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gold-300 mb-1">
                {score.title}
              </h3>
              <p className="text-sm text-navy-400 mb-4 line-clamp-2">
                {score.description || '暂无描述'}
              </p>
              <div className="flex items-center gap-4 text-xs text-navy-400">
                <span>{score.notes.length} 个音符</span>
                <span>{score.key}大调</span>
                <span>{score.tempo} BPM</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
