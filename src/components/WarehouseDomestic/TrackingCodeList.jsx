import React, { useState } from "react";
import Barcode from "react-barcode";
import { Printer, RefreshCw, Barcode as BarcodeIcon } from "lucide-react";

const generateMixedCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const letter1 = chars[Math.floor(Math.random() * chars.length)];
  const letter2 = chars[Math.floor(Math.random() * chars.length)];
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `${letter1}${num}${letter2}`;
};

const generateCodeList = (count = 10) =>
  Array.from({ length: count }, () => generateMixedCode());

const CodeList = () => {
  const [codes, setCodes] = useState(generateCodeList());
  const [printingIndex, setPrintingIndex] = useState(null);

  const handlePrintSingle = (index) => {
    setPrintingIndex(index);
    setTimeout(() => {
      window.print();
      setPrintingIndex(null);
    }, 0);
  };

  const handlePrintAll = () => {
    setPrintingIndex(null);
    setTimeout(() => window.print(), 0);
  };

  const handleRegenerate = () => {
    setCodes(generateCodeList());
  };

  return (
    <div className="p-6 min-h-screen print:p-0">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #barcode-print-root,
            #barcode-print-root * {
              visibility: visible;
            }

            #barcode-print-root {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 4mm;
            }

            .label-grid {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 4mm;
            }

            .label-item {
              border: 0.3mm solid #000;
              border-radius: 2mm;
              padding: 3mm 4mm;
              width: 55mm;
              min-height: 25mm;
              box-sizing: border-box;
              background: #fff;
            }

            #barcode-print-root.printing-all .label-item {
              display: block !important;
            }

            #barcode-print-root.printing-single .label-item {
              display: none !important;
            }
            #barcode-print-root.printing-single .label-item.print-target {
              display: block !important;
              margin: auto;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto">
        <div
          id="barcode-print-root"
          className={
            printingIndex !== null ? "printing-single" : "printing-all"
          }
        >
          {/* Header */}
          <div className="no-print bg-blue-600 rounded-xl shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BarcodeIcon size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    Danh Sách Mã Vận Đơn
                  </h1>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRegenerate}
                  className="px-4 py-2 bg-blue-500/20 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-500/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tạo mã mới
                </button>
                <button
                  onClick={handlePrintAll}
                  className="px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-50 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  In tất cả tem
                </button>
              </div>
            </div>
          </div>

          {/* Info Bar */}
          <div className="no-print bg-white border border-gray-200 rounded-xl px-5 py-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">
                Tổng: {codes.length} mã vận đơn
              </span>
              <span className="text-gray-600">Kích thước tem: 55mm × 25mm</span>
            </div>
          </div>

          {/* Label Grid */}
          <div className="label-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {codes.map((code, idx) => (
              <div
                key={idx}
                className={
                  "label-item border border-gray-200 rounded-lg bg-white overflow-hidden " +
                  (printingIndex === idx ? "print-target" : "")
                }
              >
                {/* Card Header */}
                <div className="no-print bg-blue-50 px-3 py-2 border-b border-gray-200">
                  <div className="text-xs font-medium text-gray-700">
                    Mã vận đơn #{idx + 1}
                  </div>
                </div>

                {/* Barcode Content */}
                <div className="px-3 py-4 flex flex-col items-center">
                  <Barcode
                    value={code}
                    format="CODE128"
                    displayValue={true}
                    width={1.4}
                    height={50}
                    fontSize={14}
                  />

                  <button
                    type="button"
                    onClick={() => handlePrintSingle(idx)}
                    className="no-print mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In tem này
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeList;
