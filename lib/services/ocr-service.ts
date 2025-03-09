import { createWorker } from "tesseract.js";
import { OcrResult } from "../api/prix-nc-api";

/**
 * Service for OCR (Optical Character Recognition) functionality
 */
export const OcrService = {
  /**
   * Process an image and extract text using Tesseract.js
   * @param imageFile The image file to process
   * @returns Promise with the extracted text and identified items
   */
  processImage: async (imageFile: File): Promise<OcrResult> => {
    try {
      console.log("🔹 Initialisation du worker OCR...");
      const worker = await createWorker({
        langPath: "/tessdata", // Chemin vers les fichiers de langue Tesseract
        // logger: (m) => console.log("OCR Progress:", m),  // ❌ Désactiver pour tester
      });

      console.log("✅ Worker OCR chargé avec succès !");
      await worker.loadLanguage("fra");
      await worker.initialize("fra");

      console.log("🔹 Conversion de l'image en format lisible...");
      const imageData = await fileToImageData(imageFile);

      console.log("🔹 Début de l'analyse OCR...");
      const { data } = await worker.recognize(imageData);
      console.log("🔍 Data OCR reçue :", data);
      console.log("✅ Texte extrait :", data.text);
      if (!data || typeof data.text !== "string") {
        console.error("❌ Erreur : Texte OCR invalide !");
        return { text: "", items: [] };
      }

      // Récupérer le texte brut
      const text = data.text.trim();

      // ✅ Mode TEST : Retourner le texte brut sans filtrage pour vérifier si l'OCR fonctionne
      // return { text, items: [text] };

      // 🔹 Filtrage pour extraire uniquement les éléments de la liste de courses
      const items = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .filter((line) => {
          if (/^\d+([.,]\d+)?$/.test(line)) return false; // Supprime les nombres seuls
          if (line.length < 0) return false; // Supprime les lignes très courtes
          return true;
        });

      await worker.terminate();
      console.log("✅ OCR terminé et worker arrêté.");

      return { text, items };
    } catch (error) {
      console.error(
        "❌ Erreur lors du traitement de l'image avec l'OCR :",
        error
      );
      throw error;
    }
  },
};

/**
 * Helper function to convert a File object to image data that Tesseract can process
 */
async function fileToImageData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        console.log("✅ Image convertie en base64");
        resolve(event.target.result as string);
      } else {
        reject(new Error("❌ Échec de la lecture du fichier image"));
      }
    };

    reader.onerror = () => {
      reject(new Error("❌ Erreur lors de la lecture du fichier image"));
    };

    reader.readAsDataURL(file);
  });
}
