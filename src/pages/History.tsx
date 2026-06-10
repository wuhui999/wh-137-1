import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, Download, Trash2, Clock, Target, Music, BarChart3, Calendar } from 'lucide-react';
import { useAppStore } from '@/store';
import LineChart from '@/components/LineChart';
import { formatDuration, formatDate, getDeviationColor } from '@/utils/music';

export default function History() {
  const navigate = useNavigate();
  const { scores, practiceRecords, clearHistory, exportData } = useAppStore();

  const totalPractices = practiceRecords.length;
  const totalNotes = practiceRecords.reduce((sum, r) => sum + r.totalNotes, 0);
  const totalDuration = practiceRecords.reduce((sum, r) => sum + r.duration, 0);
  const overallAccuracy =
    totalNotes > 0
      ? Math.round(
          (practiceRecords.reduce((sum, r) => sum + r.accurateNotes, 0) / totalNotes) * 100
        )
      : 0;
  const avgCents =
    totalNotes > 0
      ? practiceRecords.reduce((sum, r) => sum + r.avgCents * r.totalNotes, 0) / totalNotes
      : 0;

  const dailyTrend = useMemo(() => {
    const byDate: Record<string, { total: number; accurate: number; count: number; duration: number }> = {};
    practiceRecords.forEach((r) => {
      if (!byDate[r.date]) {
        byDate[r.date] = { total: 0, accurate: 0, count: 0, duration: 0 };
      }
      byDate[r.date].total += r.totalNotes;
      byDate[r.date].accurate += r.accurateNotes;
      byDate[r.date].count++;
      byDate[r.date].duration += r.duration;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, d]) => ({
        label: date.slice(5),
        value: d.total > 0 ? Math.round((d.accurate / d.total) * 100) : 0,
      }));
  }, [practiceRecords]);

  const practiceCountTrend = useMemo(() => {
    const byDate: Record<string, number> = {};
    practiceRecords.forEach((r) => {
      byDate[r.date] = (byDate[r.date] || 0) + 1;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, count]) => ({ label: date.slice(5), value: count }));
  }, [practiceRecords]);

  const scoreStats = useMemo(() => {
    const byScore: Record<string, { count: number; totalNotes: number; accurate: number; avgCents: number }> = {};
    practiceRecords.forEach((r) => {
      if (!byScore[r.scoreId]) {
        byScore[r.scoreId] = { count: 0, totalNotes: 0, accurate: 0, avgCents: 0 };
      }
      byScore[r.scoreId].count++;
      byScore[r.scoreId].totalNotes += r.totalNotes;
      byScore[r.scoreId].accurate += r.accurateNotes;
      byScore[r.scoreId].avgCents =
        (byScore[r.scoreId].avgCents * (byScore[r.scoreId].count - 1) + r.avgCents) /
        byScore[r.scoreId].count;
    });
    return Object.entries(byScore)
      .map(([scoreId, stat]) => ({
        score: scores.find((s) => s.id === scoreId),
        ...stat,
        accuracy: stat.totalNotes > 0 ? Math.round((stat.accurate / stat.totalNotes) * 100) : 0,
      }))
      .filter((s) => s.score)
      .sort((a, b) => b.count - a.count);
  }, [practiceRecords, scores]);

  const recentRecords = useMemo(
    () =>
      [...practiceRecords]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 10),
    [practiceRecords]
  );

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harmonica-practice-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('确定要清空所有练习历史吗？此操作不可撤销。')) {
      clearHistory();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-300/20 to-gold-500/20 flex items-center justify-center">
            <HistoryIcon className="w-6 h-6 text-gold-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gold-400">练习历史</h1>
            <p className="text-sm text-navy-400">查看你的进步轨迹和练习数据</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleClear} className="btn-ghost flex items-center gap-2 text-sm py-2 px-4 text-red-400 hover:text-red-300">
            <Trash2 className="w-4 h-4" />
            清空
          </button>
          <button onClick={handleExport} className="btn-gold flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-navy-400 text-sm mb-2">
            <BarChart3 className="w-4 h-4" />
            总练习次数
          </div>
          <div className="text-3xl font-display font-bold text-gold-300">{totalPractices}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-navy-400 text-sm mb-2">
            <Clock className="w-4 h-4" />
            总练习时长
          </div>
          <div className="text-3xl font-display font-bold text-gold-300">{formatDuration(totalDuration)}</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-navy-400 text-sm mb-2">
            <Target className="w-4 h-4" />
            总体准确率
          </div>
          <div className="text-3xl font-display font-bold text-emerald-400">{overallAccuracy}%</div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-navy-400 text-sm mb-2">
            <Music className="w-4 h-4" />
            平均偏差
          </div>
          <div className="text-3xl font-display font-bold" style={{ color: getDeviationColor(avgCents) }}>
            {avgCents > 0 ? '+' : ''}{avgCents.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">准确率进步曲线（近30天）</h2>
          {dailyTrend.length > 0 ? (
            <LineChart data={dailyTrend} color="#4ade80" yMin={0} yMax={100} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-navy-400">暂无练习数据</div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">每日练习次数</h2>
          {practiceCountTrend.length > 0 ? (
            <LineChart data={practiceCountTrend} color="#d4a857" yMin={0} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-navy-400">暂无练习数据</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">曲谱练习统计</h2>
          {scoreStats.length > 0 ? (
            <div className="space-y-2">
              {scoreStats.map((stat) => (
                <div
                  key={stat.score!.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-navy-900/40 cursor-pointer hover:bg-navy-800/50 transition-colors"
                  onClick={() => navigate(`/practice/${stat.score!.id}`)}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-300/20 to-gold-500/20 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-gold-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-navy-200 truncate">{stat.score!.title}</div>
                    <div className="text-xs text-navy-500">练习 {stat.count} 次 · {stat.totalNotes} 音符</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-emerald-400 font-semibold">{stat.accuracy}%</div>
                    <div
                      className="text-xs"
                      style={{ color: getDeviationColor(stat.avgCents) }}
                    >
                      {stat.avgCents > 0 ? '+' : ''}{stat.avgCents.toFixed(1)} 音分
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-navy-400">暂无曲谱统计</div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">最近练习记录</h2>
          {recentRecords.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
              {recentRecords.map((record) => {
                const score = scores.find((s) => s.id === record.scoreId);
                const accuracy = record.totalNotes > 0 ? Math.round((record.accurateNotes / record.totalNotes) * 100) : 0;
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-navy-900/40 cursor-pointer hover:bg-navy-800/50 transition-colors"
                    onClick={() => navigate(`/practice/${record.scoreId}`)}
                  >
                    <div className="w-10 h-10 rounded-lg bg-navy-800/60 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-navy-200 truncate">
                        {score?.title || '未知曲谱'}
                      </div>
                      <div className="text-xs text-navy-500 flex items-center gap-2">
                        <span>{formatDate(record.createdAt)}</span>
                        <span>·</span>
                        <span>{formatDuration(record.duration)}</span>
                        <span>·</span>
                        <span>{record.totalNotes} 音符</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-emerald-400 font-semibold">{accuracy}%</div>
                      <div className="text-xs" style={{ color: getDeviationColor(record.avgCents) }}>
                        {record.avgCents > 0 ? '+' : ''}{record.avgCents.toFixed(1)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-navy-400">暂无练习记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
