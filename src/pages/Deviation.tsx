import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useAppStore } from '@/store';
import ScoreDisplay from '@/components/ScoreDisplay';
import LineChart from '@/components/LineChart';
import DeviationGauge from '@/components/DeviationGauge';
import { getDeviationColor, getDeviationLabel } from '@/utils/music';

export default function Deviation() {
  const { scoreId } = useParams();
  const navigate = useNavigate();
  const score = useAppStore((state) => state.getScoreById(scoreId || ''));
  const practiceRecords = useAppStore((state) => state.practiceRecords);

  const records = useMemo(
    () => practiceRecords.filter((r) => r.scoreId === scoreId),
    [practiceRecords, scoreId]
  );

  const allDeviations = useMemo(() => records.flatMap((r) => r.deviations), [records]);

  const avgCents = useMemo(() => {
    if (allDeviations.length === 0) return 0;
    return allDeviations.reduce((sum, d) => sum + d.centsDeviation, 0) / allDeviations.length;
  }, [allDeviations]);

  const accuracy = useMemo(() => {
    if (allDeviations.length === 0) return 0;
    return Math.round(
      (allDeviations.filter((d) => Math.abs(d.centsDeviation) <= 25).length / allDeviations.length) * 100
    );
  }, [allDeviations]);

  const trendData = useMemo(() => {
    const byDate: Record<string, { total: number; accurate: number; sumCents: number; count: number }> = {};
    records.forEach((r) => {
      if (!byDate[r.date]) {
        byDate[r.date] = { total: 0, accurate: 0, sumCents: 0, count: 0 };
      }
      byDate[r.date].total += r.totalNotes;
      byDate[r.date].accurate += r.accurateNotes;
      byDate[r.date].sumCents += r.avgCents * r.totalNotes;
      byDate[r.date].count += r.totalNotes;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, d]) => ({
        label: date.slice(5),
        value: d.count > 0 ? Math.round((d.accurate / d.total) * 100) : 0,
      }));
  }, [records]);

  const centsTrendData = useMemo(() => {
    const byDate: Record<string, { sum: number; count: number }> = {};
    records.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { sum: 0, count: 0 };
      byDate[r.date].sum += r.avgCents * r.totalNotes;
      byDate[r.date].count += r.totalNotes;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, d]) => ({
        label: date.slice(5),
        value: d.count > 0 ? parseFloat((d.sum / d.count).toFixed(1)) : 0,
      }));
  }, [records]);

  const weakMeasures = useMemo(() => {
    const byMeasure: Record<number, { sum: number; count: number; deviations: number[] }> = {};
    allDeviations.forEach((d) => {
      if (!byMeasure[d.measure]) byMeasure[d.measure] = { sum: 0, count: 0, deviations: [] };
      byMeasure[d.measure].sum += Math.abs(d.centsDeviation);
      byMeasure[d.measure].count++;
      byMeasure[d.measure].deviations.push(Math.abs(d.centsDeviation));
    });
    return Object.entries(byMeasure)
      .map(([measure, data]) => ({
        measure: parseInt(measure, 10),
        avgAbs: data.sum / data.count,
        count: data.count,
      }))
      .sort((a, b) => b.avgAbs - a.avgAbs);
  }, [allDeviations]);

  if (!score) {
    return (
      <div className="text-center py-20">
        <p className="text-navy-300 mb-4">曲谱未找到</p>
        <button onClick={() => navigate('/')} className="btn-ghost">返回曲谱库</button>
      </div>
    );
  }

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
              <TrendingUp className="w-6 h-6" />
              偏差分析
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 text-center">
          <Target className="w-8 h-8 text-gold-400 mx-auto mb-3" />
          <div className="text-sm text-navy-400 mb-1">平均偏差</div>
          <div className="text-3xl font-display font-bold" style={{ color: getDeviationColor(avgCents) }}>
            {avgCents > 0 ? `+${avgCents.toFixed(1)}` : avgCents.toFixed(1)} <span className="text-lg">音分</span>
          </div>
          <div className="text-sm mt-1" style={{ color: getDeviationColor(avgCents) }}>
            {getDeviationLabel(avgCents)}
          </div>
        </div>

        <div className="glass-card p-6 text-center">
          <TrendingUp className="w-8 h-8 text-gold-400 mx-auto mb-3" />
          <div className="text-sm text-navy-400 mb-1">总体准确率</div>
          <div className="text-3xl font-display font-bold text-gold-300">{accuracy}%</div>
          <div className="text-sm text-navy-500 mt-1">±25音分以内</div>
        </div>

        <div className="glass-card p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-gold-400 mx-auto mb-3" />
          <div className="text-sm text-navy-400 mb-1">练习数据</div>
          <div className="text-3xl font-display font-bold text-gold-300">{records.length} <span className="text-lg">次</span></div>
          <div className="text-sm text-navy-500 mt-1">{allDeviations.length} 个音符记录</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">准确率趋势（最近14天）</h2>
          {trendData.length > 0 ? (
            <LineChart data={trendData} color="#4ade80" yMin={0} yMax={100} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-navy-400">暂无数据，先去练习吧</div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">平均音分偏差趋势</h2>
          {centsTrendData.length > 0 ? (
            <LineChart data={centsTrendData} color="#d4a857" yMin={-50} yMax={50} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-navy-400">暂无数据</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">薄弱小节排名</h2>
          {weakMeasures.length > 0 ? (
            <div className="space-y-2">
              {weakMeasures.slice(0, 8).map((wm, i) => (
                <div
                  key={wm.measure}
                  className="flex items-center gap-4 p-3 rounded-lg bg-navy-900/40"
                >
                  <span className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-400 text-sm font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-medium text-navy-200 w-20">第 {wm.measure} 小节</span>
                  <div className="flex-1 h-2 rounded-full bg-navy-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(wm.avgAbs / 50, 1) * 100}%`,
                        backgroundColor: getDeviationColor(wm.avgAbs),
                      }}
                    />
                  </div>
                  <span
                    className="font-mono font-semibold text-sm w-16 text-right"
                    style={{ color: getDeviationColor(wm.avgAbs) }}
                  >
                    ±{wm.avgAbs.toFixed(1)}
                  </span>
                  <span className="text-xs text-navy-500 w-12 text-right">{wm.count}次</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-navy-400">暂无薄弱小节数据</div>
          )}
        </div>

        <div className="glass-card p-5">
          <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">当前状态</h2>
          <div className="flex justify-center py-2">
            <DeviationGauge cents={avgCents} size={220} />
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-display text-lg font-semibold text-gold-300 mb-4">曲谱历史偏差标注</h2>
        <ScoreDisplay
          notes={score.notes}
          breathingPoints={score.breathingPoints}
          deviations={allDeviations.slice(-score.notes.length)}
        />
      </div>
    </div>
  );
}
