import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { QrCode, Camera, X } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (data: any) => void;
  title?: string;
}

export function QRScanner({ open, onOpenChange, onScan, title = "Scan QR Code" }: QRScannerProps) {
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open && isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open, isScanning]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Cannot access camera. Please use manual input.");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleManualSubmit = () => {
    if (!manualInput.trim()) {
      toast.error("Please enter QR code data");
      return;
    }

    try {
      // Try to parse as JSON first
      const parsedData = JSON.parse(manualInput);
      onScan(parsedData);
      onOpenChange(false);
      setManualInput("");
    } catch {
      // If not JSON, treat as batch number
      onScan({ batch_number: manualInput.trim() });
      onOpenChange(false);
      setManualInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Scanner */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Camera Scanner</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScanning(!isScanning)}
              >
                <Camera className="w-4 h-4 mr-2" />
                {isScanning ? "Stop Camera" : "Start Camera"}
              </Button>
            </div>

            {isScanning && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-gray-100 rounded-lg"
                />
                <div className="absolute inset-0 border-2 border-dashed border-primary rounded-lg pointer-events-none flex items-center justify-center">
                  <div className="text-primary text-sm bg-white px-2 py-1 rounded">
                    Position QR code in view
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="manual-input">Manual Input</Label>
            <div className="flex gap-2">
              <Input
                id="manual-input"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter batch number or QR code data"
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              />
              <Button onClick={handleManualSubmit}>
                Scan
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              You can type the batch number or paste the complete QR code data
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}