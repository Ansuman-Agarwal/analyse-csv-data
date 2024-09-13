/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { DynamicTable } from "@/components/DynamicTable";

export default function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, string | number>[]>([]);
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const GetFileData = (file: File) => {
    Papa.parse<Record<string, string | number>>(file, {
      header: true,
      complete: async (results) => {
        console.log(results);
        setData(results.data);
      },
    });
  };

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setFileUploaded(true);
      GetFileData(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setFileUploaded(true);
      GetFileData(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {!fileUploaded && (
        <>
          <label htmlFor="picture" className="text-lg mb-2 block">
            Upload Picture
          </label>
          <div
            {...getRootProps()}
            onClick={handleClick}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary bg-primary/10"
              : "border-gray-300 hover:border-primary"
          }
          sm:p-12 md:p-16`}
          >
            <input
              {...getInputProps({
                id: "picture",
                onChange: handleFileChange,
                ref: fileInputRef,
              })}
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            {isDragActive ? (
              <p className="mt-4 text-lg">Drop the file here ...</p>
            ) : (
              <p className="mt-4 text-lg">
                Drag & drop a file here, or click to select a file
              </p>
            )}
            {file && (
              <p className="mt-4 text-sm text-gray-500">
                Selected file: {file.name}
              </p>
            )}
          </div>
        </>
      )}
      {fileUploaded && <DynamicTable data={data} />}
    </div>
  );
}
