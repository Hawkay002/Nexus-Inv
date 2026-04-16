import { useState } from 'react';
import { format } from 'date-fns';
import { CheckSquare, Square, Trash2, CheckCircle, Clock } from 'lucide-react';
import CustomModal from '../../components/ui/CustomModal';
import InvoicePreview from '../../components/invoice/InvoicePreview';

export default function ArchiveTab({ config, bills, saveBills }) {
  const [selected, setSelected] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, bill: null });

  const toggleSelectAll = () => {
    if (selected.length === bills.length) setSelected([]);
    else setSelected(bills.map(b => b.id));
  };

  const toggleSelect = (id) => {
    if (selected.includes(id)) setSelected(selected.filter(sid => sid !== id));
    else setSelected([...selected, id]);
  };

  const deleteSelected = () => {
    const updated = bills.filter(b => !selected.includes(b.id));
    saveBills(updated);
    setSelected([]);
    setDeleteModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold tracking-tight">Invoice Archive</h2>
          <p className="text-premium-700 mt-1">Manage and view all previously generated invoices.</p>
        </div>
        <div className="flex gap-4">
           {selected.length > 0 && (
             <button onClick={() => setDeleteModal(true)} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition-all">
               <Trash2 size={18}/> Delete Selected ({selected.length})
             </button>
           )}
           <button onClick={toggleSelectAll} className="btn-secondary">
             {selected.length === bills.length && bills.length > 0 ? <CheckSquare size={18}/> : <Square size={18}/>} Select All
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-premium-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
             <tr className="bg-premium-50 border-b border-premium-100 text-premium-700 font-semibold uppercase text-xs tracking-wider">
               <th className="p-4 w-12 text-center"></th>
               <th className="p-4">Date</th>
               <th className="p-4">Electricity (Change)</th>
               <th className="p-4">AC (Change)</th>
               <th className="p-4">Total</th>
               <th className="p-4">Status</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-premium-50">
            {bills.length === 0 ? (
               <tr><td colSpan="6" className="p-8 text-center text-premium-500 font-medium">No invoices found.</td></tr>
            ) : bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-premium-50/50 transition-colors cursor-pointer" onClick={() => setPreviewModal({isOpen: true, bill})}>
                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => toggleSelect(bill.id)} className="text-premium-400 hover:text-accent-600">
                    {selected.includes(bill.id) ? <CheckSquare size={20} className="text-accent-600"/> : <Square size={20}/>}
                  </button>
                </td>
                <td className="p-4 font-medium">{format(new Date(bill.date), 'dd MMM yyyy')}</td>
                <td className="p-4 text-premium-700">{bill.prevElectricity} → {bill.currElectricity} <span className="text-xs ml-1 bg-premium-100 px-2 py-0.5 rounded-full">+{bill.elecUnits}</span></td>
                <td className="p-4 text-premium-700">{bill.prevAC} → {bill.currAC} <span className="text-xs ml-1 bg-premium-100 px-2 py-0.5 rounded-full">+{bill.acUnits}</span></td>
                <td className="p-4 font-display font-semibold">₹{bill.total.toFixed(2)}</td>
                <td className="p-4">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${bill.status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                     {bill.status === 'paid' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                     {bill.status.toUpperCase()}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CustomModal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="Delete Invoices" maxWidth="max-w-md">
        <p className="text-premium-700 mb-6">Are you sure you want to delete the selected invoices? This cannot be undone.</p>
        <div className="flex gap-4">
          <button onClick={() => setDeleteModal(false)} className="btn-secondary flex-1">Cancel</button>
          <button onClick={deleteSelected} className="btn-primary bg-red-600 hover:bg-red-700 shadow-red-600/30 flex-1">Delete</button>
        </div>
      </CustomModal>

      <CustomModal isOpen={previewModal.isOpen} onClose={() => setPreviewModal({isOpen: false, bill: null})} title="Invoice Details" maxWidth="max-w-[1000px]">
         <InvoicePreview invoice={previewModal.bill} config={config} />
      </CustomModal>
    </div>
  );
}
