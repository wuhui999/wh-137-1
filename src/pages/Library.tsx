import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Music, Clock, Play, Search } from 'lucide-react';
import { useAppStore } from '@/store';
import ScoreEditor from '@/components/ScoreEditor';
import type { Score } from '@/types';

export default function Library() {
  const navigate = useNavigate();
  const { scores, addScore, updateScore, deleteScore } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);

  const filteredScores = scores.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingScore(null);
    setShowEditor(true);
  };

  const handleEdit = (score: Score, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingScore(score);
    setShowEditor(true);
  };

  const handleDelete = (score: Score, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除《${score.title}》吗？`)) {
      deleteScore(score.id);
    }
  };

  const handleSave = (data: Omit<Score, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingScore) {
      updateScore(editingScore.id, data);
    } else {
      addScore(data);
    }
    setShowEditor(false);
    setEditingScore(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gold-400 mb-2">曲谱库</h1>
          <p className="text-navy-300">选择一首曲谱开始练习，或创建新的曲谱</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              placeholder="搜索曲谱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark pl-10 w-48 md:w-64"
            />
          </div>
          <button onClick={handleAdd} className="btn-gold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建曲谱
          </button>
        </div>
      </div>

      {filteredScores.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Music className="w-16 h-16 text-navy-500 mx-auto mb-4" />
          <p className="text-navy-300 mb-4">
            {searchQuery ? '没有找到匹配的曲谱' : '暂无曲谱，点击上方按钮创建第一首'}
          </p>
          {!searchQuery && (
            <button onClick={handleAdd} className="btn-gold">
              创建曲谱
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScores.map((score) => (
            <div
              key={score.id}
              className="glass-card glass-card-hover p-5 cursor-pointer"
              onClick={() => navigate(`/practice/${score.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-300/20 to-gold-500/20 flex items-center justify-center">
                  <Music className="w-6 h-6 text-gold-400" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleEdit(score, e)}
                    className="p-2 rounded-lg hover:bg-navy-700/50 text-navy-300 hover:text-gold-400 transition-colors"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(score, e)}
                    className="p-2 rounded-lg hover:bg-navy-700/50 text-navy-300 hover:text-red-400 transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-display text-xl font-semibold text-gold-300 mb-1">
                {score.title}
              </h3>
              <p className="text-sm text-navy-400 mb-4 line-clamp-2">
                {score.description || '暂无描述'}
              </p>

              <div className="flex items-center justify-between text-xs text-navy-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    {score.notes.length} 个音符
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {score.tempo} BPM
                  </span>
                  <span>{score.key}大调</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gold-400/10 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {['/practice', '/deviation', '/breathing'].map((route, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-1 rounded bg-navy-800/60 text-navy-400"
                    >
                      {i === 0 ? '练习' : i === 1 ? '偏差' : '换气'}
                    </span>
                  ))}
                </div>
                <button
                  className="px-3 py-1.5 rounded-lg bg-gold-400/10 text-gold-400 text-sm font-medium hover:bg-gold-400/20 transition-colors flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/practice/${score.id}`);
                  }}
                >
                  <Play className="w-3 h-3" />
                  开始
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditor && (
        <ScoreEditor
          score={editingScore}
          onSave={handleSave}
          onCancel={() => {
            setShowEditor(false);
            setEditingScore(null);
          }}
        />
      )}
    </div>
  );
}
