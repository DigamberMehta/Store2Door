import React from "react";
import { Image as ImageIcon } from "lucide-react";

const EvidenceFilesCard = ({ evidenceFiles }) => {
  if (!evidenceFiles || evidenceFiles.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center">
        <ImageIcon className="w-5 h-5 mr-2 text-pink-600" />
        Evidence Files
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {evidenceFiles.map((file, idx) => (
          <a
            key={idx}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-gray-200 rounded-lg p-2 hover:border-pink-500 hover:shadow-md transition-all"
          >
            <div className="aspect-square bg-pink-50 rounded flex items-center justify-center mb-2">
              <ImageIcon className="w-8 h-8 text-pink-400" />
            </div>
            <p className="text-xs text-gray-600 truncate">
              {file.filename || `File ${idx + 1}`}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default EvidenceFilesCard;
