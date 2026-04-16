import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Receipt, ScanLine, UserCog, LogOut } from 'lucide-react';
import GenerateTab from './dashboard/GenerateTab';
import ArchiveTab from './dashboard/ArchiveTab';
import ScannerTab from './dashboard/ScannerTab';
import { auth } from '../config/firebase';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('generate');
  const [config, setConfig] = useState(null);
  const [bills, setBills] = useState([]);
  
  // Custom hook logic alternative strictly managing local states for persistence
  useEffect(() => {
    const savedConfig = localStorage.getItem('nexus_config');
    const savedBills = localStorage.getItem('nexus_bills');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
    if (savedBills) setBills(JSON.parse(savedBills));
  }, []);

  const saveBills = (newBills) => {
    setBills(newBills);
    localStorage.setItem('nexus_bills', JSON.stringify(newBills));
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-display font-bold">Configuration Required</h2>
        <p className="text-premium-700">Please set up your profile and tenant details first.</p>
        <Link to="/profile" className="btn-primary">Go to Configuration</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-premium-50">
      <aside className="w-64 bg-white border-r border-premium-100 flex flex-col">
        <div className="p-6 border-b border-premium-100">
          <h1 className="text-2xl font-display font-bold text-premium-900 tracking-tight">Nexus.</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('generate')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'generate' ? 'bg-premium-900 text-white' : 'text-premium-700 hover:bg-premium-50'}`}>
            <LayoutDashboard size={20} /> Generate
          </button>
          <button onClick={() => setActiveTab('archive')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'archive' ? 'bg-premium-900 text-white' : 'text-premium-700 hover:bg-premium-50'}`}>
            <Receipt size={20} /> Archive
          </button>
          <button onClick={() => setActiveTab('scanner')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'scanner' ? 'bg-premium-900 text-white' : 'text-premium-700 hover:bg-premium-50'}`}>
            <ScanLine size={20} /> Scanner
          </button>
        </nav>
        <div className="p-4 border-t border-premium-100 space-y-2">
          <Link to="/profile" className="w-full flex items-center gap-3 px-4 py-3 text-premium-700 hover:bg-premium-50 rounded-lg font-medium transition-colors">
            <UserCog size={20} /> Configuration
          </Link>
          <button onClick={() => auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'generate' && <GenerateTab config={config} bills={bills} saveBills={saveBills} />}
        {activeTab === 'archive' && <ArchiveTab config={config} bills={bills} saveBills={saveBills} />}
        {activeTab === 'scanner' && <ScannerTab bills={bills} saveBills={saveBills} />}
      </main>
    </div>
  );
}
