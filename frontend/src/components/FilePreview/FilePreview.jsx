import React from 'react';
import { FileText, Code, Volume2, Video, Image, X, Download, File, Loader2 } from 'lucide-react';

/**
 * Format bytes to human readable string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Get the corresponding icon for a file type category
 */
const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image':
      return Image;
    case 'document':
      return FileText;
    case 'code':
      return Code;
    case 'audio':
      return Volume2;
    case 'video':
      return Video;
    default:
      return File;
  }
};

export default function FilePreview({ file, onRemove, readOnly = false, isUploading = false }) {
  if (!file) return null;

  const fileName = file.name || file.originalname || 'file';
  const fileSize = file.size;
  const fileType = file.fileType || 'document';
  const fileUrl = file.url;

  const IconComponent = getFileIcon(fileType);

  // Image Layout
  if (fileType === 'image' && fileUrl) {
    return (
      <div className="relative group max-w-xs rounded-2xl overflow-hidden border border-border-color/80 bg-input-bg/40 shadow-lg transition-all hover:border-white/40 mt-2">
        <img
          src={fileUrl}
          alt={fileName}
          className="max-h-48 w-full object-cover select-none cursor-pointer hover:scale-102 transition-transform duration-200"
          onClick={() => window.open(fileUrl, '_blank')}
        />
        
        {/* Hover Overlay with Metadata */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[11px] font-semibold text-white truncate font-outfit">{fileName}</span>
            <span className="text-[9px] text-muted-text font-mono mt-0.5">{formatBytes(fileSize)}</span>
          </div>
          {readOnly && (
            <a
              href={fileUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Remove Button (for MessageInput preview) */}
        {!readOnly && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-xl bg-black/60 hover:bg-black/80 border border-white/10 text-white hover:text-red-400 transition-colors shadow-md cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Uploading Spinner */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
      </div>
    );
  }

  // Document/Code/Audio/Video Layout (Card representation)
  return (
    <div className="relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-elevated-card/90 border border-border-color hover:border-white/40 shadow-md transition-all max-w-sm mt-2">
      {/* Type Icon */}
      <div className="p-2.5 rounded-xl bg-input-bg border border-border-color/60 text-secondary-text shrink-0">
        {isUploading ? (
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        ) : (
          <IconComponent className="h-5 w-5" />
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-xs font-semibold text-white truncate font-outfit" title={fileName}>
          {fileName}
        </span>
        <span className="text-[10px] text-muted-text font-mono mt-1">
          {isUploading ? 'Uploading...' : formatBytes(fileSize)}
        </span>
      </div>

      {/* Action buttons */}
      <div className="shrink-0 flex items-center gap-1.5">
        {readOnly && fileUrl && (
          <a
            href={fileUrl}
            download={fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-input-bg border border-border-color hover:border-white/30 text-secondary-text hover:text-white transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
        )}

        {!readOnly && onRemove && !isUploading && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-xl bg-input-bg/40 border border-transparent hover:border-border-color hover:text-red-400 text-muted-text transition-colors cursor-pointer"
            title="Remove attachment"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
