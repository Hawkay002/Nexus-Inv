import { useState, useRef } from 'react';
import Quagga from 'quagga';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Camera, Image as ImageIcon, Maximize, Upload, CheckCircle2 } from 'lucide-react';
import CustomModal from '../../components/ui/CustomModal';

// Audio object for sound effect
const scanAudio = new Audio('/scan-sound.mp3'); 

export default function ScannerTab({ bills, saveBills }) {
  const [activeMode, setActiveMode] = useState(null); // 'camera' | 'upload'
  const [imageSrc, setImageSrc] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [resultModal, setResultModal] = useState(false);
  const cropperRef = useRef(null);
  const scannerRef = useRef(null);

  const startCamera = () => {
    setActiveMode('camera');
    setScanResult(null);
    setTimeout(() => {
      Quagga.init({
        inputStream: { name: "Live", type: "LiveStream", target: scannerRef.current, constraints: { facingMode: "environment" } },
        decoder: { readers: ["code_128_reader"] },
      }, (err) => {
        if (!err) Quagga.start();
      });

      Quagga.onDetected(handleDetection);
    }, 100);
  };

  const stopCamera = () => {
    Quagga.stop();
    setActiveMode(null);
  };

  const handleDetection = (result) => {
    const code = result.codeResult.code;
    processScannedCode(code);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(activeMode === 'camera') stopCamera();
      setActiveMode('upload');
      setImageSrc(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const scanCroppedArea = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    const canvas = cropper.getCroppedCanvas();
    Quagga.decodeSingle({
      decoder: { readers: ["code_128_reader"] },
      locate: true,
      src: canvas.toDataURL('image/png')
    }, (result) => {
      if (result && result.codeResult) processScannedCode(result.codeResult.code);
      else alert("No barcode detected in selected area.");
    });
  };

  const processScannedCode = (code) => {
    const id = Number(code);
    const invoiceIndex = bills.findIndex(b => b.id === id);
    if (invoiceIndex > -1) {
      scanAudio.play().catch(e=>console.log(e)); // Play sound effect
      const updatedBills = [...bills];
      updatedBills[invoiceIndex].status = 'paid';
      updatedBills[invoiceIndex].paidDate = new Date().toISOString();
      saveBills(updatedBills);
      setScanResult(`Invoice #${id} successfully marked as PAID.`);
      setResultModal(true);
      if(activeMode === 'camera') stopCamera();
    } else {
      alert("Invalid or unrecognized invoice code.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div>
        <h2 className="text-3xl font-display font-bold tracking-tight">Invoice Scanner</h2>
        <p className="text-premium-700 mt-1">Scan physical invoice barcodes to instantly mark them as paid.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <button onClick={startCamera} className={`p-8 rounded-2xl border-2 flex flex-col items-center gap-4 transition-all ${activeMode === 'camera' ? 'border-accent-600 bg-accent-50 text-accent-700' : 'border-premium-100 bg-white text-premium-700 hover:border-premium-300'}`}>
          <Camera size={48} />
          <span className="font-semibold text-lg">Use Camera</span>
        </button>
        <label className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center gap-4 transition-all cursor-pointer ${activeMode === 'upload' ? 'border-accent-600 bg-accent-50 text-accent-700' : 'border-premium-300 bg-white text-premium-700 hover:border-accent-400 hover:bg-premium-50'}`}>
          <Upload size={48} />
          <span className="font-semibold text-lg">Upload Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {activeMode === 'camera' && (
        <div className="bg-premium-900 rounded-2xl overflow-hidden relative h-[400px] flex items-center justify-center border-4 border-premium-900">
           {/* Rectangular scanning guide */}
           <div className="absolute inset-0 z-10 border-[50px] border-black/50"></div>
           <div className="absolute w-[300px] h-[100px] border-2 border-accent-500 z-20 flex items-center justify-center bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
             <div className="w-full h-0.5 bg-accent-500/50 animate-pulse shadow-[0_0_10px_#6366F1]"></div>
           </div>
           <div ref={scannerRef} className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />
           <button onClick={stopCamera} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 btn-secondary bg-white/90 backdrop-blur">Stop Scanner</button>
        </div>
      )}

      {activeMode === 'upload' && imageSrc && (
        <div className="bg-white p-6 rounded-2xl border border-premium-100 shadow-sm space-y-6">
           <div className="flex items-center gap-2 text-premium-700 mb-2">
             <Maximize size={18}/> <span>Align the cropper tightly around the barcode.</span>
           </div>
           <div className="h-[400px] w-full bg-premium-100 rounded-lg overflow-hidden border border-premium-200">
             <Cropper src={imageSrc} ref={cropperRef} style={{ height: '100%', width: '100%' }} guides={true} background={false} responsive={true} autoCropArea={0.3} viewMode={1} />
           </div>
           <button onClick={scanCroppedArea} className="btn-primary w-full py-4 text-lg"><ScanLine size={20}/> Scan Selection</button>
        </div>
      )}

      <CustomModal isOpen={resultModal} onClose={() => setResultModal(false)} title="Scan Successful" maxWidth="max-w-md">
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 size={64} className="text-green-500 mb-4" />
          <h3 className="text-xl font-display font-semibold mb-2">Payment Recorded</h3>
          <p className="text-premium-700">{scanResult}</p>
          <button onClick={() => setResultModal(false)} className="btn-primary w-full mt-8">Continue</button>
        </div>
      </CustomModal>
    </div>
  );
}
