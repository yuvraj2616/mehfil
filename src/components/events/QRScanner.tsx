"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, NotFoundException, Exception } from "@zxing/library";
import { Camera, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QRScannerProps {
  onScan: (result: string) => void;
  isScanning: boolean;
}

export function QRScanner({ onScan, isScanning }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef(new BrowserMultiFormatReader());
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [errorLine, setErrorLine] = useState<string>("");

  useEffect(() => {
    let unmounted = false;

    async function initCamera() {
      try {
        const videoInputDevices = await codeReader.current.listVideoInputDevices();
        if (unmounted) return;

        if (videoInputDevices.length === 0) {
          setHasCamera(false);
          setErrorLine("No camera apparatus detected");
          return;
        }

        setHasCamera(true);

        if (isScanning && videoRef.current) {
          codeReader.current.decodeFromVideoDevice(
            null, // Auto select back camera if available
            videoRef.current,
            (result, err) => {
              if (result) {
                onScan(result.getText());
              }
              if (err && !(err instanceof NotFoundException)) {
                // Warning only logged if it's a real error, not just "QR not found in frame"
                console.error(err);
              }
            }
          );
        }
      } catch (err: any) {
        if (!unmounted) {
          setHasCamera(false);
          setErrorLine("Camera permissions denied or unavailable");
        }
      }
    }

    initCamera();

    return () => {
      unmounted = true;
      codeReader.current.reset();
    };
  }, [isScanning, onScan]);

  if (hasCamera === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#0A0D15] rounded-xl border border-gray-800 text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
          <Camera className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-white font-bold mb-1">Scanner Engine Offline</p>
        <p className="text-xs text-gray-500">{errorLine}</p>
        <Button 
          variant="outline" 
          className="mt-6 border-primary text-primary hover:bg-primary hover:text-black"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-black border-2 border-primary/30 aspect-square max-w-sm mx-auto shadow-[0_0_30px_rgba(255,0,122,0.1)]">
      {/* Scanner frame overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
        <div className="flex-1 bg-black/60 backdrop-blur-[2px]" />
        <div className="flex">
          <div className="w-12 bg-black/60 backdrop-blur-[2px]" />
          <div className="flex-1 aspect-square relative border-2 border-primary/50">
            {/* Corner brackets */}
            <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-4 border-l-4 border-primary" />
            <div className="absolute -top-[2px] -right-[2px] w-8 h-8 border-t-4 border-r-4 border-primary" />
            <div className="absolute -bottom-[2px] -left-[2px] w-8 h-8 border-b-4 border-l-4 border-primary" />
            <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-4 border-r-4 border-primary" />
            
            {/* Scan animation line */}
            {isScanning && (
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_10px_#FF007A] animate-scan" />
            )}
          </div>
          <div className="w-12 bg-black/60 backdrop-blur-[2px]" />
        </div>
        <div className="flex-1 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse shadow-black drop-shadow-md">
            {isScanning ? "Align Code within matrix" : "Scanner Paused"}
          </p>
        </div>
      </div>

      <video
        ref={videoRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isScanning ? "opacity-100" : "opacity-30 grayscale"}`}
        playsInline
        muted
      />
    </div>
  );
}
