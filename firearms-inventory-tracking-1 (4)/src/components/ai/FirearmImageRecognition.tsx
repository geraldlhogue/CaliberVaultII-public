import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

interface RecognitionResult {
  manufacturer?: string;
  model?: string;
  type?: string;
  caliber?: string;
  confidence: number;
  features: string[];
}

export function FirearmImageRecognition() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);
    setProgress(0);
    setResult(null);

    try {
      setProgress(20);
      
      const { data, error } = await supabase.functions.invoke('analyze-firearm-image', {
        body: { imageData }
      });

      if (error) throw error;

      setProgress(100);
      setResult(data as RecognitionResult);
      
      toast({
        title: 'Recognition Complete',
        description: data.manufacturer && data.model 
          ? `Identified: ${data.manufacturer} ${data.model}`
          : 'Analysis complete'
      });
    } catch (error) {
      console.error('Recognition error:', error);
      toast({
        title: 'Recognition Failed',
        description: 'Unable to analyze image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setImage(imageData);
      analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        setImage(imageData);
        analyzeImage(imageData);
        
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera',
        variant: 'destructive'
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          AI Firearm Recognition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Upload or capture a photo to automatically identify manufacturer, model, and specifications using AI.
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-4">
          <Button onClick={() => fileInputRef.current?.click()} size="lg" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <Button onClick={handleCapture} variant="outline" size="lg" className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {image && (
          <div className="space-y-4">
            <img src={image} alt="Uploaded" className="w-full max-h-96 object-contain rounded-lg border" />
            
            {analyzing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing with AI...</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    Recognition Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Manufacturer</p>
                      <p className="font-semibold">{result.manufacturer || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-semibold">{result.model || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-semibold">{result.type || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Caliber</p>
                      <p className="font-semibold">{result.caliber || 'Unknown'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Confidence</p>
                    <div className="flex items-center gap-2">
                      <Progress value={result.confidence * 100} className="flex-1" />
                      <Badge variant={result.confidence > 0.8 ? 'default' : 'secondary'}>
                        {(result.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>

                  {result.features && result.features.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Detected Features</p>
                      <ul className="space-y-1">
                        {result.features.map((feature, i) => (
                          <li key={i} className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
