import { useState } from "react";
import { LuZoomIn, LuZoomOut, LuDownload } from "react-icons/lu";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();
const ResumeViewerModal = ({ url, filename = "resume.pdf", onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-5xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-heading">Resume</h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition"
              title="Zoom out"
            >
              <LuZoomOut size={20} />
            </button>

            <button
              type="button"
              onClick={() => setScale((prev) => Math.min(2, prev + 0.1))}
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition"
              title="Zoom in"
            >
              <LuZoomIn size={20} />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!url) return;
                const link = document.createElement("a");
                link.href = url;
                link.download = filename || "resume.pdf";
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition"
              title="Download resume"
            >
              <LuDownload size={20} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 bg-gray-100 overflow-auto p-6">
          <Document
            file={url}
            onLoadSuccess={({ numPages: loadedPages }) => setNumPages(loadedPages)}
            loading={
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading resume...
              </div>
            }
            error={
              <div className="flex items-center justify-center h-full text-red-500">
                Unable to load resume.
              </div>
            }
          >
            {numPages &&
              Array.from(new Array(numPages), (_, index) => (
                <div key={`page_${index + 1}`} className="flex justify-center mb-6">
                  <Page
                    pageNumber={index + 1}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-lg"
                  />
                </div>
              ))}
          </Document>
        </div>
      </div>
    </div>
  );
};
export default ResumeViewerModal;
