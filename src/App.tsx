import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Library from '@/pages/Library';
import Practice from '@/pages/Practice';
import Deviation from '@/pages/Deviation';
import Breathing from '@/pages/Breathing';
import History from '@/pages/History';
import ScoreSelector from '@/pages/ScoreSelector';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Library />} />
          <Route path="/library" element={<Navigate to="/" replace />} />
          <Route path="/practice/:scoreId" element={<Practice />} />
          <Route path="/deviation/:scoreId" element={<Deviation />} />
          <Route path="/breathing/:scoreId" element={<Breathing />} />
          <Route path="/deviation-demo" element={<ScoreSelector mode="deviation" />} />
          <Route path="/breathing-demo" element={<ScoreSelector mode="breathing" />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
