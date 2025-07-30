"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Cloud, Upload } from "lucide-react";

interface DropzoneProps {
  className?: string;
  onDrop?: (acceptedFiles: File[]) => void;
  maxSize?: number;
  accept?: Record<string, string[]>;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export function Dropzone({
  className,
  onDrop,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept,
  ...props
}: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      maxSize,
      accept,
    });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25",
        isDragReject && "border-destructive bg-destructive/5",
        className,
      )}
      {...props}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        {isDragActive ? (
          <Cloud className="size-8 animate-bounce text-primary" />
        ) : (
          <Upload className="size-8 text-muted-foreground" />
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          {isDragActive
            ? "Drop the files here"
            : "Drag & drop files here, or click to select files"}
        </p>
      </div>
    </div>
  );
}
