import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, MapPin, Scan, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ArScannerProps {
  onScanResult: (location: { lat: number; lng: number }) => void;
}

export function ArScanner({ onScanResult }: ArScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setIsScanning(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setHasPermission(false);
      toast({
        variant: "destructive",
        title: "Camera Access Denied",
        description: "Please enable camera permissions to scan infrastructure."
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const performScan = async () => {
    // Simulate getting current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          onScanResult(location);
          toast({
            title: "Scanning...",
            description: "Looking for infrastructure data at your location."
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to a demo location (e.g., near a government building)
          const demoLocation = { lat: 28.6139, lng: 77.2090 }; // New Delhi
          onScanResult(demoLocation);
          toast({
            title: "Using Demo Location",
            description: "Showing sample infrastructure data."
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      // Fallback for browsers without geolocation
      const demoLocation = { lat: 28.6139, lng: 77.2090 };
      onScanResult(demoLocation);
      toast({
        title: "Using Demo Location",
        description: "Showing sample infrastructure data."
      });
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isScanning) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Start AR Scanning</h3>
            <p className="text-muted-foreground text-sm">
              Point your camera at public infrastructure to reveal civic data
            </p>
          </div>
          <Button onClick={startCamera} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Start Camera
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover rounded-lg"
      />
      
      {/* AR Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning reticle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-48 h-48 border-2 border-primary/60 rounded-lg relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Scan className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="absolute top-4 left-4 right-4">
          <Card className="bg-background/80 backdrop-blur-sm">
            <CardContent className="p-3">
              <p className="text-sm text-center">
                Point camera at infrastructure and tap scan
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center pointer-events-auto">
        <Button variant="outline" size="icon" onClick={stopCamera}>
          <X className="w-4 h-4" />
        </Button>
        
        <Button size="lg" onClick={performScan} className="px-8">
          <MapPin className="w-4 h-4 mr-2" />
          Scan Here
        </Button>
        
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>
    </div>
  );
}