import { forwardRef, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import JsBarcode from 'jsbarcode';

const InvoicePreview = forwardRef(({ invoice, config }, ref) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && invoice) {
      JsBarcode(barcodeRef.current, invoice.id.toString(), {
        format: "CODE128",
        width: 1.5,
        height: 40,
        fontSize: 12,
        displayValue: true,
        margin: 0
      });
    }
  }, [invoice]);

  if (!invoice || !config) return null;

  const upiLink = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(config.ownerName)}&am=${invoice.total.toFixed(2)}&cu=INR`;

  return (
    <div className="overflow-x-auto w-full bg-premium-50 p-4 rounded-xl border border-premium-100 flex justify-start md:justify-center">
      {/* Strict Pixel Dimensions: 1123x794 is exactly A4 Landscape at 96 DPI */}
      <div 
        ref={ref} 
        className="bg-white text-premium-900 p-10 shadow-sm flex flex-col flex-shrink-0" 
        style={{ width: '1123px', height: '794px', minWidth: '1123px', minHeight: '794px', boxSizing: 'border-box' }}
      >
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-premium-100 pb-6 mb-6 flex-none">
          <div>
            <h1 className="text-4xl font-display font-bold text-premium-900 tracking-tight">INVOICE</h1>
            <p className="text-premium-700 mt-2 font-mono">#{invoice.id}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg text-premium-900">Date Issued</p>
            <p className="text-premium-700">{format(new Date(invoice.date), 'dd MMM yyyy, hh:mm a')}</p>
            <div className={`mt-3 inline-block px-4 py-1 rounded-full text-sm font-semibold border ${invoice.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {invoice.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Parties */}
        <div className="grid grid-cols-2 gap-12 mb-8 flex-none">
          <div>
            <h3 className="text-sm font-semibold uppercase text-premium-700 tracking-wider mb-2">Billed By</h3>
            <p className="font-display text-xl font-semibold">{config.ownerName}</p>
            <p className="text-premium-700 mt-1">{config.ownerPhone}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase text-premium-700 tracking-wider mb-2">Billed To</h3>
            <p className="font-display text-xl font-semibold">{config.tenantName}</p>
            <p className="text-premium-700 mt-1">{config.tenantPhone}</p>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="flex-1">
          <table className="w-full text-left mb-8 border-collapse">
            <thead>
              <tr className="border-b-2 border-premium-100 text-premium-900">
                <th className="py-3 font-semibold uppercase text-sm tracking-wider">Description</th>
                <th className="py-3 font-semibold uppercase text-sm tracking-wider text-right">Units/Details</th>
                <th className="py-3 font-semibold uppercase text-sm tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="text-premium-800">
              <tr className="border-b border-premium-50">
                <td className="py-4 font-medium">Monthly Rent</td>
                <td className="py-4 text-right text-premium-700">-</td>
                <td className="py-4 text-right font-medium">₹{invoice.rent.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-premium-50">
                <td className="py-4 font-medium">Water Charges</td>
                <td className="py-4 text-right text-premium-700">-</td>
                <td className="py-4 text-right font-medium">₹{invoice.water.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-premium-50">
                <td className="py-4 font-medium">Electricity</td>
                <td className="py-4 text-right text-premium-700">
                  {invoice.prevElectricity} → {invoice.currElectricity} ({invoice.elecUnits} units @ ₹{config.electricityRate})
                </td>
                <td className="py-4 text-right font-medium">₹{invoice.elecCharge.toFixed(2)}</td>
              </tr>
              <tr className="border-b border-premium-50">
                <td className="py-4 font-medium">Air Conditioning</td>
                <td className="py-4 text-right text-premium-700">
                  {invoice.prevAC} → {invoice.currAC} ({invoice.acUnits} units @ ₹{config.acRate})
                </td>
                <td className="py-4 text-right font-medium">₹{invoice.acCharge.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer & Totals - Using mt-auto instead of absolute positioning */}
        <div className="flex justify-between items-end mt-auto pt-6 border-t-2 border-premium-100 flex-none">
          <div className="flex gap-8">
            <div className="text-center bg-premium-50 p-4 rounded-xl border border-premium-100">
              <QRCodeSVG value={upiLink} size={90} className="mb-2 mx-auto" />
              <p className="text-xs font-medium text-premium-700 uppercase tracking-wider">Scan to Pay UPI</p>
            </div>
            <div className="flex flex-col justify-end items-center pb-2">
               <svg ref={barcodeRef}></svg>
               <p className="text-xs font-medium text-premium-700 uppercase tracking-wider text-center mt-2">Invoice Code</p>
            </div>
          </div>
          
          <div className="text-right bg-premium-900 text-white p-6 rounded-2xl shadow-lg w-72">
             <p className="text-sm font-medium uppercase tracking-wider text-premium-100 mb-1">Total Amount Due</p>
             <p className="text-4xl font-display font-bold tracking-tight">₹{invoice.total.toFixed(2)}</p>
          </div>
        </div>

      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';
export default InvoicePreview;
