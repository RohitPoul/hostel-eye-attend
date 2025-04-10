
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Calendar, Clock, Lock, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const AttendanceForm = () => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(true);
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAttendanceActive, setIsAttendanceActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognitionStatus, setRecognitionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [recognizedStudentName, setRecognizedStudentName] = useState('');
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const attendanceTimeInfo = {
    date: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    startTime: '8:30 PM',
    endTime: '9:30 PM',
  };

  useEffect(() => {
    if (recognitionStatus === 'processing') {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(timer);
            handleRecognitionComplete();
            return 0;
          }
          return prevProgress + 20;
        });
      }, 500);

      return () => {
        clearInterval(timer);
      };
    }
  }, [recognitionStatus]);

  const verifyPassword = () => {
    setIsVerifying(true);
    
    // In a real app, this would be an API call to verify the password
    setTimeout(() => {
      if (password === 'admin123') {
        setIsPasswordDialogOpen(false);
        setIsAttendanceActive(true);
        toast({
          title: "Access Granted",
          description: "You can now take attendance",
        });
      } else {
        toast({
          title: "Invalid Password",
          description: "The password is incorrect",
          variant: "destructive",
        });
      }
      setIsVerifying(false);
    }, 1000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setIsCapturing(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access the camera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsCapturing(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        setRecognitionStatus('processing');
        
        // Stop the camera after capturing
        stopCamera();
      }
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setRecognitionStatus('idle');
    setRecognizedStudentName('');
    setProgress(0);
    startCamera();
  };

  const handleRecognitionComplete = () => {
    // In a real app, this would be the result of the facial recognition process
    // For demo, we'll simulate a successful recognition after a delay
    const success = Math.random() > 0.3; // 70% chance of success
    
    if (success) {
      setRecognitionStatus('success');
      setRecognizedStudentName('John Doe');
      
      toast({
        title: "Attendance Marked",
        description: "Student recognized: John Doe",
      });
    } else {
      setRecognitionStatus('error');
      
      toast({
        title: "Recognition Failed",
        description: "Could not recognize student",
        variant: "destructive",
      });
    }
  };

  const finishAttendance = () => {
    toast({
      title: "Attendance Session Completed",
      description: "Thank you for taking attendance",
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
        if (!open) navigate('/dashboard');
        setIsPasswordDialogOpen(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Admin Password</DialogTitle>
            <DialogDescription>
              You need to enter the admin password to access the attendance screen.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-2">
            <div className="relative">
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Hint: Use "admin123" as the password</p>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              onClick={verifyPassword}
              disabled={isVerifying}
              className="bg-primary hover:bg-primary-dark"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance Session Info */}
      {isAttendanceActive && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <h3 className="font-medium">{attendanceTimeInfo.date}</h3>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-primary mr-2" />
            <p className="text-gray-600">
              Attendance Time: {attendanceTimeInfo.startTime} - {attendanceTimeInfo.endTime}
            </p>
          </div>
        </div>
      )}

      {/* Camera Section */}
      {isAttendanceActive && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Capture Student Face</h2>
          
          <div className="flex flex-col items-center">
            {/* Camera View */}
            <div className="relative w-full max-w-md h-72 bg-gray-100 rounded-lg overflow-hidden mb-4">
              {isCapturing && !capturedImage && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
              
              {capturedImage && (
                <div className="relative w-full h-full">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  
                  {recognitionStatus === 'processing' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
                      <p className="mb-2">Processing...</p>
                      <div className="w-64">
                        <Progress value={progress} />
                      </div>
                    </div>
                  )}
                  
                  {recognitionStatus === 'success' && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-50 flex flex-col items-center justify-center text-white">
                      <User className="h-12 w-12 mb-2" />
                      <p className="text-xl font-bold mb-1">Recognized!</p>
                      <p>{recognizedStudentName}</p>
                    </div>
                  )}
                  
                  {recognitionStatus === 'error' && (
                    <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex flex-col items-center justify-center text-white">
                      <X className="h-12 w-12 mb-2" />
                      <p className="text-xl font-bold mb-1">Not Recognized</p>
                      <p>Please try again</p>
                    </div>
                  )}
                </div>
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            {/* Control Buttons */}
            <div className="space-x-4">
              {!isCapturing && !capturedImage && (
                <Button
                  onClick={startCamera}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Start Camera
                </Button>
              )}
              
              {isCapturing && !capturedImage && (
                <Button
                  onClick={captureImage}
                  className="bg-primary hover:bg-primary-dark"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Capture
                </Button>
              )}
              
              {capturedImage && (
                <>
                  {(recognitionStatus === 'success' || recognitionStatus === 'error') && (
                    <Button
                      onClick={resetCapture}
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  )}
                </>
              )}
              
              <Button
                onClick={finishAttendance}
                variant={capturedImage ? "default" : "outline"}
                className={capturedImage ? "bg-green-600 hover:bg-green-700" : ""}
              >
                Finish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;
