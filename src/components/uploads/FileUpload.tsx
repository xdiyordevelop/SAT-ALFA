"use client";

import { useState } from "react";
import {
  uploadMockTestAttachment,
  deleteMockTestAttachment,
} from "@/server/actions/file.actions";
import { FileUp, Trash2 } from "lucide-react";

interface FileUploadProps {
  mockTestId: string;
  onUploadSuccess?: (attachment: any) => void;
}

export function FileUpload({ mockTestId, onUploadSuccess }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setError(null);
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadMockTestAttachment(formData, mockTestId);

        if (result.error) {
          setError(result.error);
        } else if (result.attachment) {
          setAttachments((prev) => [...prev, result.attachment]);
          onUploadSuccess?.(result.attachment);
        }
      }
    } catch (err) {
      setError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const result = await deleteMockTestAttachment(attachmentId);
      if (result.error) {
        setError(result.error);
      } else {
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      }
    } catch (err) {
      setError("Delete failed");
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors {
 isDragging
 ? "border-yellow-500 bg-slate-50 dark:bg-[#0a0a0a]"
 : "border-neutral-300 hover:border-neutral-400"
 }`}
      >
        <FileUp className="w-8 h-8 mx-auto mb-3 text-slate-500 dark:text-slate-400" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Drag files here or click to select
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Max 10MB. PDF, images, documents
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          disabled={isUploading}
          className="hidden"
          id={`file-upload-${mockTestId}`}
        />
        <label
          htmlFor={`file-upload-${mockTestId}`}
          className="inline-block px-4 py-2 bg-yellow- text-slate-900 dark:text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-[#d9ff00] disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Select Files"}
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Attachments
          </p>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between bg-slate-50 dark:bg-[#0a0a0a] p-3 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(attachment.fileSize / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                onClick={() => handleDelete(attachment.id)}
                className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
