import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Workspace } from './pages/Workspace';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Workspace />} />
        <Route path="/:id" element={<Workspace />} />
      </Routes>
    </Router>
  );
}

export default App;
