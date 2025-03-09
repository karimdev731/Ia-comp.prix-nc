"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, FileText, X } from "lucide-react";
import { LangChainService } from "@/lib/services/langchain-service";

interface ImageUploadProps {
  onExtractItems: (items: string[]) => void;
}

export default function ImageUpload({ onExtractItems }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setExtractedText(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setExtractedText(null);
    setError(null);
  };

  const handleProcessImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Get user location if available
      let userLocation = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (locErr) {
          console.error("Error getting location:", locErr);
        }
      }

      // Use LangChain service to process the image and extract items
      const result = await LangChainService.processImageAndFindProducts(selectedFile, userLocation);
      
      // Get the OCR text from the first step of the process
      const ocrResult = await LangChainService.enhanceItemExtraction(result.items.join('\n'));
      setExtractedText(result.items.join('\n'));
      
      // Pass the enhanced items to the parent component
      onExtractItems(result.items);
    } catch (err) {
      console.error("Image processing error:", err);
      setError("Une erreur est survenue lors du traitement de l'image");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Extraire une liste de courses depuis une image</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium">
                  Cliquez pour téléverser une image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF jusqu'à 10MB
                </p>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                {preview && (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Aperçu"
                      className="max-h-64 rounded-lg mx-auto"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <Button
                onClick={handleProcessImage}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Extraire le texte
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <div className="p-2 bg-red-100 text-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          {extractedText && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Texte extrait:</h3>
              <div className="p-3 bg-muted rounded-md">
                <pre className="text-xs whitespace-pre-wrap">
                  {extractedText}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
