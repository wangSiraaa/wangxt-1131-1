import { useApp } from './context/AppContext';
import Header from './components/Header';
import WaterQualityPage from './pages/WaterQualityPage';
import DispatcherPage from './pages/DispatcherPage';
import SalvageTeamPage from './pages/SalvageTeamPage';

function AppContent() {
  const { state } = useApp();

  const renderPage = () => {
    switch (state.currentRole) {
      case 'water':
        return <WaterQualityPage />;
      case 'dispatch':
        return <DispatcherPage />;
      case 'salvage':
        return <SalvageTeamPage />;
      default:
        return <WaterQualityPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
