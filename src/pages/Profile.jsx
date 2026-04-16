import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import CustomModal from '../components/ui/CustomModal';

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownerName: '', ownerPhone: '', upiId: '',
    tenantName: '', tenantPhone: '',
    rentAmount: '', waterAmount: '', electricityRate: '', acRate: ''
  });
  const [confirmModal, setConfirmModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_config');
    if (saved) setFormData(JSON.parse(saved));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      rentAmount: Number(formData.rentAmount), waterAmount: Number(formData.waterAmount),
      electricityRate: Number(formData.electricityRate), acRate: Number(formData.acRate)
    };
    localStorage.setItem('nexus_config', JSON.stringify(formattedData));
    navigate('/dashboard');
  };

  const handleClearTenant = () => {
    const freshData = { ...formData, tenantName: '', tenantPhone: '', rentAmount: '', waterAmount: '', electricityRate: '', acRate: '' };
    setFormData(freshData);
    localStorage.setItem('nexus_config', JSON.stringify(freshData));
    localStorage.removeItem('nexus_bills');
    localStorage.removeItem('nexus_prev_readings');
    setConfirmModal(false);
  };

  return (
    <div className="min-h-screen bg-premium-50 p-8 flex justify-center">
      <div className="max-w-3xl w-full">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-premium-700 hover:text-premium-900 mb-8 font-medium transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold">Configuration</h1>
          <button onClick={() => setConfirmModal(true)} className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-all">
            <Trash2 size={18} /> Clear Tenant Data
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-premium-100">
            <h2 className="text-xl font-display font-semibold mb-6 pb-4 border-b border-premium-100">Owner Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Owner Name</label>
                <input required type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input required type="tel" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">UPI ID</label>
                <input required type="text" name="upiId" value={formData.upiId} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-premium-100">
            <h2 className="text-xl font-display font-semibold mb-6 pb-4 border-b border-premium-100">Tenant & Rates</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Tenant Name</label>
                <input required type="text" name="tenantName" value={formData.tenantName} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input required type="tel" name="tenantPhone" value={formData.tenantPhone} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Rent (₹)</label>
                <input required type="number" name="rentAmount" value={formData.rentAmount} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Water Amount (₹)</label>
                <input required type="number" name="waterAmount" value={formData.waterAmount} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Electricity Rate (₹/unit)</label>
                <input required type="number" step="0.01" name="electricityRate" value={formData.electricityRate} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">AC Rate (₹/unit)</label>
                <input required type="number" step="0.01" name="acRate" value={formData.acRate} onChange={handleChange} className="input-field" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-lg"><Save size={20}/> Save Configuration</button>
        </form>
      </div>

      <CustomModal isOpen={confirmModal} onClose={() => setConfirmModal(false)} title="Clear Tenant Data" maxWidth="max-w-md">
        <p className="text-premium-700 mb-6">Are you sure? This will remove the current tenant details, all past invoices, and previous readings. This action cannot be undone.</p>
        <div className="flex gap-4">
          <button onClick={() => setConfirmModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleClearTenant} className="btn-primary bg-red-600 hover:bg-red-700 shadow-red-600/30 flex-1">Confirm Wipe</button>
        </div>
      </CustomModal>
    </div>
  );
}
