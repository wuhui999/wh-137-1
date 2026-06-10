import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Music, Library, TrendingUp, Wind, History, Download } from 'lucide-react';
import { useAppStore } from '@/store';

export default function Layout() {
  const navigate = useNavigate();
  const exportData = useAppStore((state) => state.exportData);

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gold-400/20 bg-navy-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center shadow-glow">
              <Music className="w-5 h-5 text-navy-900" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-gold-400">口琴练习</h1>
              <p className="text-xs text-navy-300">Harmonica Practice Studio</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className="nav-link flex items-center gap-2">
              <Library className="w-4 h-4" />
              <span>曲谱库</span>
            </NavLink>
            <NavLink to="/history" className="nav-link flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>历史</span>
            </NavLink>
            <NavLink to="/deviation-demo" className="nav-link flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>偏差</span>
            </NavLink>
            <NavLink to="/breathing-demo" className="nav-link flex items-center gap-2">
              <Wind className="w-4 h-4" />
              <span>换气</span>
            </NavLink>
          </nav>

          <button
            onClick={handleExport}
            className="btn-ghost flex items-center gap-2 text-sm py-2 px-4"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">导出报告</span>
          </button>
        </div>

        <nav className="md:hidden flex border-t border-gold-400/10">
          <NavLink to="/" end className="flex-1 nav-link flex flex-col items-center gap-1 py-3">
            <Library className="w-5 h-5" />
            <span className="text-xs">曲谱库</span>
          </NavLink>
          <NavLink to="/history" className="flex-1 nav-link flex flex-col items-center gap-1 py-3">
            <History className="w-5 h-5" />
            <span className="text-xs">历史</span>
          </NavLink>
          <NavLink to="/deviation-demo" className="flex-1 nav-link flex flex-col items-center gap-1 py-3">
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs">偏差</span>
          </NavLink>
          <NavLink to="/breathing-demo" className="flex-1 nav-link flex flex-col items-center gap-1 py-3">
            <Wind className="w-5 h-5" />
            <span className="text-xs">换气</span>
          </NavLink>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-gold-400/10 py-6 text-center text-navy-400 text-sm">
        <p>纯前端口琴练习工具 · 本地存储数据 · 支持键盘模拟与MIDI输入</p>
      </footer>
    </div>
  );
}
