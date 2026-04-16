import { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import InvoicePreview from '../../components/invoice/InvoicePreview';
import CustomModal from '../../components/ui/CustomModal';
import { sendInvoiceToTelegram } from '../../services/telegram';
import { Zap, Wind, Edit2, Share2 } from 'lucide-react';

export default function GenerateTab({ config, bills, saveBills }) {
  const [prevValues, setPrevValues] = useState({ elec: '', ac: '' });
  const [currElec, setCurrElec] = useState('');
  const [currAc, setCurrAc] = useState('');
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, field: null, value: '' });
  const invoiceRef = useRef(null);

  useEffect(() => {
    const savedPrev = localStorage.getItem('nexus_prev_readings');
    if (savedPrev) {
      setPrevValues(JSON.parse(savedPrev));
    }
  }, []);

  const handleEditPrev = (field) => {
    setEditModal({ isOpen: true, field, value: prevValues[field] });
  };

  const saveEditPrev = () => {
    const updated = { ...prevValues, [editModal.field]: Number(editModal.value) };
    setPrevValues(updated);
    localStorage.setItem('nexus_prev_readings', JSON.stringify(updated));
    setEditModal({ isOpen: false, field: null, value: '' });
  };

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!prevValues.elec || !prevValues.ac) return alert('Please set previous values first.');
    
    const elecUnits = currElec - prevValues.elec;
    const acUnits = currAc - prevValues.ac;
    
    if (elecUnits < 0 || acUnits < 0) return alert('Current reading cannot be lower than previous.');

    const elecCharge = elecUnits * config.electricityRate;
    const acCharge = acUnits * config.acRate;
    const total = config.rentAmount + config.waterAmount + elecCharge + acCharge;

    const newInvoice = {
      id: Date.now(),
      date: new Date().toISOString(),
      prevElectricity: prevValues.elec,
      currElectricity: currElec,
      elecUnits, elecCharge,
      prevAC: prevValues.ac,
      currAC: currAc,
      acUnits, acCharge,
      rent: config.rentAmount,
      water: config.waterAmount,
      total,
      status: 'pending'
    };

    setGeneratedInvoice(newInvoice);
    setIsModalOpen(true);
  };

  const finalizeAndShare = async () => {
    if (!invoiceRef.current) return;
    
    // Save to State
    const updatedBills = [generatedInvoice, ...bills];
    saveBills(updatedBills);

    // Update Previous Values
    const newPrev = { elec: currElec, ac: currAc };
    setPrevValues(newPrev);
    localStorage.setItem('nexus_prev_readings', JSON.stringify(newPrev));
    setCurrElec('');
    setCurrAc('');

    // Capture Invoice
    const canvas = await html2canvas(invoiceRef.current, { 
  scale: 2, 
  useCORS: true, 
  backgroundColor: '#ffffff',
  width: 1123,
  height: 794,
  windowWidth: 1123,
  windowHeight: 794
});
    canvas.toBlob(async (blob) => {
      const file = new File([blob], `Invoice_${generatedInvoice.id}.png`, { type: 'image/png' });
      const caption = `Invoice Date: ${format(new Date(generatedInvoice.date), 'dd MMM yyyy, hh:mm a')}`;
      
      // Save to Telegram
      await sendInvoiceToTelegram(blob, caption);

      // Web Share API WhatsApp
      const shareText = `Here is the rent invoice for ${format(new Date(), 'MMMM yyyy')}.\nTotal Amount: ₹${generatedInvoice.total.toFixed(2)}`;
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Rent Invoice',
          text: shareText
        });
      } else {
        // Fallback: Download and redirect
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        window.open(`https://wa.me/${config.tenantPhone.replace(/\D/g, '')}?text=${encodeURIComponent(shareText)}`, '_blank');
      }
      setIsModalOpen(false);
    }, 'image/png');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Generate Invoice</h2>
        <p className="text-premium-700 mt-1">{format(new Date(), 'EEEE, MMMM do, yyyy | hh:mm a')}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Previous Stats Edit */}
        <div className="bg-white p-6 rounded-2xl border border-premium-100 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center"><Zap /></div>
            <div>
              <p className="text-sm font-medium text-premium-700">Previous Electricity</p>
              <p className="text-2xl font-display font-semibold">{prevValues.elec || '--'}</p>
            </div>
          </div>
          <button onClick={() => handleEditPrev('elec')} className="p-2 text-premium-700 hover:text-accent-600 hover:bg-accent-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={18} /></button>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-premium-100 shadow-sm flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Wind /></div>
            <div>
              <p className="text-sm font-medium text-premium-700">Previous AC</p>
              <p className="text-2xl font-display font-semibold">{prevValues.ac || '--'}</p>
            </div>
          </div>
          <button onClick={() => handleEditPrev('ac')} className="p-2 text-premium-700 hover:text-accent-600 hover:bg-accent-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={18} /></button>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="bg-white p-8 rounded-2xl border border-premium-100 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-premium-900 mb-2">Current Electricity Reading</label>
            <input type="number" required className="input-field" value={currElec} onChange={e => setCurrElec(e.target.value)} placeholder="Enter reading" />
          </div>
          <div>
            <label className="block text-sm font-medium text-premium-900 mb-2">Current AC Reading</label>
            <input type="number" required className="input-field" value={currAc} onChange={e => setCurrAc(e.target.value)} placeholder="Enter reading" />
          </div>
        </div>
        <button type="submit" className="btn-primary w-full py-4 text-lg">Generate & Preview</button>
      </form>

      {/* Edit Prev Modals */}
      <CustomModal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, field: null, value: '' })} title={`Edit Previous ${editModal.field === 'elec' ? 'Electricity' : 'AC'}`} maxWidth="max-w-md">
        <div className="space-y-4">
          <input type="number" className="input-field" value={editModal.value} onChange={e => setEditModal({ ...editModal, value: e.target.value })} autoFocus />
          <div className="flex gap-4">
            <button onClick={saveEditPrev} className="btn-primary flex-1">Save</button>
          </div>
        </div>
      </CustomModal>

      {/* Preview Invoice Modal */}
      <CustomModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invoice Preview" maxWidth="max-w-[1000px]">
        <div className="mb-6 flex justify-end gap-4">
           <button onClick={finalizeAndShare} className="btn-primary"><Share2 size={18}/> Finalize & Share</button>
        </div>
        <InvoicePreview invoice={generatedInvoice} config={config} ref={invoiceRef} />
      </CustomModal>
    </div>
  );
}
