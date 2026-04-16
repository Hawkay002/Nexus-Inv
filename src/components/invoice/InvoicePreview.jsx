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

  // Standard premium colors
  const colors = {
    primary: '#0F172A', secondary: '#334155', border: '#F1F5F9', bg: '#F8FAFC',
    successText: '#15803D', successBg: '#F0FDF4', successBorder: '#BBF7D0',
    pendingText: '#B45309', pendingBg: '#FFFBEB', pendingBorder: '#FDE68A'
  };

  const isPaid = invoice.status === 'paid';

  return (
    <div className="overflow-x-auto w-full bg-premium-50 p-4 rounded-xl border border-premium-100 flex justify-center">
      
      {/* Inject fonts explicitly so the export canvas can read them */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Outfit:wght@500;600;700&display=swap');`}
      </style>

      {/* Strict Inline Styles to prevent stretching and class stripping */}
      <div 
        ref={ref} 
        style={{ 
          width: '1123px', 
          height: '794px', 
          backgroundColor: '#ffffff',
          color: colors.primary,
          padding: '40px',
          boxSizing: 'border-box',
          fontFamily: "'Inter', sans-serif",
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `2px solid ${colors.border}`, paddingBottom: '24px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '36px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: colors.primary, letterSpacing: '-0.02em' }}>INVOICE</h1>
            <p style={{ margin: '8px 0 0 0', color: colors.secondary, fontFamily: "'JetBrains Mono', monospace", fontSize: '16px' }}>#{invoice.id}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '18px', color: colors.primary }}>Date Issued</p>
            <p style={{ margin: '4px 0 0 0', color: colors.secondary, fontSize: '16px' }}>{format(new Date(invoice.date), 'dd MMM yyyy, hh:mm a')}</p>
            <div style={{
              marginTop: '12px', display: 'inline-block', padding: '4px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 600,
              backgroundColor: isPaid ? colors.successBg : colors.pendingBg,
              color: isPaid ? colors.successText : colors.pendingText,
              border: `1px solid ${isPaid ? colors.successBorder : colors.pendingBorder}`
            }}>
              {invoice.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Parties */}
        <div style={{ display: 'flex', gap: '48px', marginBottom: '32px' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', color: colors.secondary, letterSpacing: '0.05em' }}>Billed By</h3>
            <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 600, color: colors.primary }}>{config.ownerName}</p>
            <p style={{ margin: '4px 0 0 0', color: colors.secondary, fontSize: '16px' }}>{config.ownerPhone}</p>
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', color: colors.secondary, letterSpacing: '0.05em' }}>Billed To</h3>
            <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 600, color: colors.primary }}>{config.tenantName}</p>
            <p style={{ margin: '4px 0 0 0', color: colors.secondary, fontSize: '16px' }}>{config.tenantPhone}</p>
          </div>
        </div>

        {/* Breakdown Table */}
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.border}` }}>
              <th style={{ padding: '12px 0', fontWeight: 600, textTransform: 'uppercase', fontSize: '14px', color: colors.primary }}>Description</th>
              <th style={{ padding: '12px 0', fontWeight: 600, textTransform: 'uppercase', fontSize: '14px', textAlign: 'right', color: colors.primary }}>Units/Details</th>
              <th style={{ padding: '12px 0', fontWeight: 600, textTransform: 'uppercase', fontSize: '14px', textAlign: 'right', color: colors.primary }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: `1px solid ${colors.bg}` }}>
              <td style={{ padding: '16px 0', fontWeight: 500, fontSize: '16px' }}>Monthly Rent</td>
              <td style={{ padding: '16px 0', textAlign: 'right', color: colors.secondary }}>-</td>
              <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 500, fontSize: '16px' }}>₹{invoice.rent.toFixed(2)}</td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${colors.bg}` }}>
              <td style={{ padding: '16px 0', fontWeight: 500, fontSize: '16px' }}>Water Charges</td>
              <td style={{ padding: '16px 0', textAlign: 'right', color: colors.secondary }}>-</td>
              <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 500, fontSize: '16px' }}>₹{invoice.water.toFixed(2)}</td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${colors.bg}` }}>
              <td style={{ padding: '16px 0', fontWeight: 500, fontSize: '16px' }}>Electricity</td>
              <td style={{ padding: '16px 0', textAlign: 'right', color: colors.secondary }}>
                {invoice.prevElectricity} &rarr; {invoice.currElectricity} ({invoice.elecUnits} units @ ₹{config.electricityRate})
              </td>
              <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 500, fontSize: '16px' }}>₹{invoice.elecCharge.toFixed(2)}</td>
            </tr>
            <tr style={{ borderBottom: `1px solid ${colors.bg}` }}>
              <td style={{ padding: '16px 0', fontWeight: 500, fontSize: '16px' }}>Air Conditioning</td>
              <td style={{ padding: '16px 0', textAlign: 'right', color: colors.secondary }}>
                {invoice.prevAC} &rarr; {invoice.currAC} ({invoice.acUnits} units @ ₹{config.acRate})
              </td>
              <td style={{ padding: '16px 0', textAlign: 'right', fontWeight: 500, fontSize: '16px' }}>₹{invoice.acCharge.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer & Totals */}
        <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '24px', borderTop: `2px solid ${colors.border}` }}>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ textAlign: 'center', backgroundColor: colors.bg, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
              <QRCodeSVG value={upiLink} size={90} style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: colors.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Scan to Pay UPI</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
               <svg ref={barcodeRef}></svg>
               <p style={{ margin: '8px 0 0 0', fontSize: '12px', fontWeight: 500, color: colors.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice Code</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'right', backgroundColor: colors.primary, color: '#ffffff', padding: '24px', borderRadius: '16px', width: '280px' }}>
             <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.border }}>Total Amount Due</p>
             <p style={{ margin: 0, fontSize: '36px', fontFamily: "'Outfit', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' }}>₹{invoice.total.toFixed(2)}</p>
          </div>
        </div>

      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';
export default InvoicePreview;
