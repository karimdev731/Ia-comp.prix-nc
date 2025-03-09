import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { OcrService } from "./ocr-service";
import {
  PrixNcApi,
  Product,
  SearchParams,
  SearchResult,
} from "../api/prix-nc-api";

/**
 * Service for orchestrating interactions between OCR, API, and recommendation logic using LangChain
 */
export const LangChainService = {
  /**
   * Process an image, extract text, identify products, and search for them
   * @param imageFile The image file to process
   * @param userLocation Optional user location for distance-based recommendations
   * @returns Promise with the extracted items and search results
   */
  processImageAndFindProducts: async (
    imageFile: File,
    userLocation?: { latitude: number; longitude: number }
  ): Promise<{ items: string[]; searchResults: Product[][] }> => {
    try {
      // Step 1: Process the image with OCR
      const ocrResult = await OcrService.processImage(imageFile);

      // Step 2: Use LangChain to improve item extraction from OCR text
      const enhancedItems = await this.enhanceItemExtraction(ocrResult.text);

      // Step 3: Search for each identified product
      const searchPromises = enhancedItems.map(async (item) => {
        const searchParams: SearchParams = {
          query: item,
          location: userLocation,
          sortBy: "price",
        };

        try {
          const result = await PrixNcApi.searchProducts(searchParams);
          return result.products; // Return just the products array
        } catch (error) {
          console.error(`Error searching for product ${item}:`, error);
          return [];
        }
      });

      const searchResults = await Promise.all(searchPromises);

      return {
        items: enhancedItems,
        searchResults,
      };
    } catch (error) {
      console.error("Error in processImageAndFindProducts:", error);
      throw error;
    }
  },

  /**
   * Use LangChain to enhance item extraction from OCR text
   * @param text The raw text from OCR
   * @returns Promise with enhanced list of product items
   */
  enhanceItemExtraction: async (text: string): Promise<string[]> => {
    try {
      // Initialize the language model
      const model = new ChatOpenAI({
        temperature: 0,
        modelName: "gpt-3.5-turbo",
      });

      // Create a prompt template for extracting shopping list items
      const promptTemplate = PromptTemplate.fromTemplate(
        `You are an AI assistant that helps identify shopping list items from OCR-extracted text.
        The text might be noisy or contain irrelevant information.
        
        Extract a clean list of product names from the following text. Focus on food items, groceries, and household products.
        Ignore prices, quantities, dates, and other non-product information.
        Format the output as a JSON array of strings, with each string being a product name.
        
        OCR Text:
        {text}
        
        Output (JSON array of product names):`
      );

      // Create a processing chain
      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);

      // Run the chain
      const result = await chain.invoke({ text });

      // Parse the JSON result
      try {
        const parsedItems = JSON.parse(result);
        if (Array.isArray(parsedItems)) {
          return parsedItems;
        }
        return [];
      } catch (parseError) {
        console.error("Error parsing LLM output:", parseError);
        // Fallback to simple line-based extraction
        return text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 3 && !/^\d+([.,]\d+)?$/.test(line));
      }
    } catch (error) {
      console.error("Error in enhanceItemExtraction:", error);
      throw error;
    }
  },

  /**
   * Generate shopping recommendations based on product search results
   * @param searchResults Array of product arrays from searches
   * @param userLocation Optional user location for distance-based recommendations
   * @returns Promise with optimized shopping recommendations
   */
  generateShoppingRecommendations: async (
    searchResults: Product[][],
    userLocation?: { latitude: number; longitude: number }
  ): Promise<{
    bestPriceStores: Record<string, Product[]>;
    savingsAmount: number;
  }> => {
    try {
      // Initialize the language model
      const model = new ChatOpenAI({
        temperature: 0,
        modelName: "gpt-3.5-turbo",
      });

      // Group products by store
      const storeProducts: Record<string, Product[]> = {};

      // Track the lowest price found for each product
      const lowestPrices: Record<string, number> = {};

      // Process all search results
      searchResults.forEach((products) => {
        if (products.length === 0) return;

        // Find the lowest price for this product
        const productName = products[0].name;
        const lowestPrice = Math.min(...products.map((p) => p.price));
        lowestPrices[productName] = lowestPrice;

        // Group by store
        products.forEach((product) => {
          const storeName = product.store.name;
          if (!storeProducts[storeName]) {
            storeProducts[storeName] = [];
          }
          storeProducts[storeName].push(product);
        });
      });

      // Calculate potential savings
      let totalLowestPrice = 0;
      Object.values(lowestPrices).forEach((price) => {
        totalLowestPrice += price;
      });

      // Find the best store for each product
      const bestPriceStores: Record<string, Product[]> = {};

      Object.entries(storeProducts).forEach(([storeName, products]) => {
        // Group products by name to avoid duplicates
        const uniqueProducts: Record<string, Product> = {};

        products.forEach((product) => {
          const existingProduct = uniqueProducts[product.name];
          if (!existingProduct || product.price < existingProduct.price) {
            uniqueProducts[product.name] = product;
          }
        });

        bestPriceStores[storeName] = Object.values(uniqueProducts);
      });

      // Calculate the total price if buying everything from a single store
      const storeTotals: Record<string, number> = {};
      Object.entries(bestPriceStores).forEach(([storeName, products]) => {
        storeTotals[storeName] = products.reduce(
          (sum, product) => sum + product.price,
          0
        );
      });

      // Calculate potential savings
      const lowestStoreTotal = Math.min(...Object.values(storeTotals));
      const savingsAmount = lowestStoreTotal - totalLowestPrice;

      return {
        bestPriceStores,
        savingsAmount,
      };
    } catch (error) {
      console.error("Error in generateShoppingRecommendations:", error);
      throw error;
    }
  },

  /**
   * Optimize shopping route based on store locations and product prices
   * @param products List of products to purchase
   * @param userLocation User's current location
   * @returns Optimized shopping route with stores to visit
   */
  optimizeShoppingRoute: async (
    products: Product[],
    userLocation: { latitude: number; longitude: number }
  ): Promise<{
    route: Array<{ store: Store; products: Product[] }>;
    totalDistance: number;
  }> => {
    try {
      // Group products by store
      const storeProducts: Record<string, Product[]> = {};

      products.forEach((product) => {
        const storeId = product.store.id;
        if (!storeProducts[storeId]) {
          storeProducts[storeId] = [];
        }
        storeProducts[storeId].push(product);
      });

      // Calculate distances and create route
      const route = Object.entries(storeProducts).map(
        ([storeId, storeProducts]) => {
          return {
            store: storeProducts[0].store,
            products: storeProducts,
          };
        }
      );

      // Sort stores by distance from user location
      route.sort((a, b) => {
        const distanceA = a.store.distance || Infinity;
        const distanceB = b.store.distance || Infinity;
        return distanceA - distanceB;
      });

      // Calculate total route distance (simplified linear path)
      let totalDistance = 0;
      let previousLocation = userLocation;

      route.forEach((stop) => {
        const storeLocation = stop.store.location;
        const distance = calculateDistance(
          previousLocation.latitude,
          previousLocation.longitude,
          storeLocation.latitude,
          storeLocation.longitude
        );

        totalDistance += distance;
        previousLocation = storeLocation;
      });

      return {
        route,
        totalDistance,
      };
    } catch (error) {
      console.error("Error in optimizeShoppingRoute:", error);
      throw error;
    }
  },

  /**
   * Analyze shopping patterns and provide insights
   * @param purchaseHistory Array of previous purchases
   * @returns Analysis of shopping patterns and recommendations
   */
  analyzeShoppingPatterns: async (
    purchaseHistory: Array<{ products: Product[]; date: Date }>
  ): Promise<{
    frequentItems: string[];
    priceTrends: Record<string, number[]>;
    recommendations: string[];
  }> => {
    try {
      const model = new ChatOpenAI({
        temperature: 0.2,
        modelName: "gpt-3.5-turbo",
      });

      // Extract all product names from purchase history
      const allProducts: string[] = [];
      const productPrices: Record<string, number[]> = {};

      purchaseHistory.forEach((purchase) => {
        purchase.products.forEach((product) => {
          allProducts.push(product.name);

          if (!productPrices[product.name]) {
            productPrices[product.name] = [];
          }
          productPrices[product.name].push(product.price);
        });
      });

      // Count frequency of each product
      const productFrequency: Record<string, number> = {};
      allProducts.forEach((product) => {
        productFrequency[product] = (productFrequency[product] || 0) + 1;
      });

      // Sort products by frequency
      const frequentItems = Object.entries(productFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map((entry) => entry[0]);

      // Create prompt for recommendations
      const promptTemplate = PromptTemplate.fromTemplate(
        `You are an AI shopping assistant that helps users optimize their grocery shopping.
        Based on the following purchase history, suggest 5 recommendations to help the user save money or improve their shopping experience.
        
        Frequent items purchased:
        {frequentItems}
        
        Provide 5 specific, actionable recommendations:`
      );

      // Create a processing chain for recommendations
      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);

      // Run the chain to get recommendations
      const recommendationsText = await chain.invoke({
        frequentItems: frequentItems.join("\n"),
      });

      // Parse recommendations into an array
      const recommendations = recommendationsText
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter((line) => line.length > 0)
        .slice(0, 5);

      return {
        frequentItems,
        priceTrends: productPrices,
        recommendations,
      };
    } catch (error) {
      console.error("Error in analyzeShoppingPatterns:", error);
      throw error;
    }
  },
};

/**
 * Calculate distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
}
