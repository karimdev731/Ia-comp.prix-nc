"use client";

import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ProductSearch from "./ProductSearch";
import ImageUpload from "./ImageUpload";
import ShoppingCart from "./ShoppingCart";
import { Product, ProductDetails } from "@/lib/api/prix-nc-api";
import { LangChainService } from "@/lib/services/langchain-service";

export default function DashboardContent() {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  const [extractedItems, setExtractedItems] = useState<string[]>([]);
  const [isProcessingItems, setIsProcessingItems] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const productSearchRef = useRef<any>(null);

  // Handle adding a product to the cart
  const handleAddToCart = (product: Product) => {
    // Check if product is already in cart
    if (!cartItems.some((item) => item.id === product.id)) {
      setCartItems((prev) => [...prev, product]);
    }
  };

  // Handle removing a product from the cart
  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  // Handle clearing the entire cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Handle extracting items from an image
  const handleExtractItems = (items: string[]) => {
    // Store the extracted items
    setExtractedItems(items);

    // Switch to search tab after extraction
    setActiveTab("search");

    // If items were extracted, set the first one as search query
    if (items.length > 0 && productSearchRef.current) {
      // Pass the first item to the ProductSearch component
      if (productSearchRef.current.setSearchQuery) {
        productSearchRef.current.setSearchQuery(items[0]);
        productSearchRef.current.handleSearch();
      }

      // Process all items to find best prices
      processExtractedItems(items);
    }
  };

  // Process all extracted items to find best prices using LangChain service
  const processExtractedItems = async (items: string[]) => {
    if (!items.length) return;

    setIsProcessingItems(true);

    try {
      // Get user location if available
      let userLocation = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            }
          );
          userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
        } catch (error) {
          console.error("Error getting location:", error);
        }
      }

      // Use LangChain service to process the items and find products
      const result = await LangChainService.processImageAndFindProducts(
        new File([new Blob([items.join("\n")])], "items.txt", {
          type: "text/plain",
        }),
        userLocation
      );

      // Add the best (lowest price) product from each search result to cart
      result.searchResults.forEach((products, index) => {
        if (products && products.length > 0) {
          // Sort by price
          const sortedProducts = [...products].sort(
            (a, b) => a.price - b.price
          );
          handleAddToCart(sortedProducts[0]);
        }
      });

      // Generate shopping recommendations if we have enough products
      if (result.searchResults.some((products) => products.length > 0)) {
        try {
          const recommendationsResult =
            await LangChainService.generateShoppingRecommendations(
              result.searchResults,
              userLocation
            );

          // If we have purchase history, analyze patterns (mock data for now)
          if (cartItems.length > 0) {
            const mockPurchaseHistory = [
              { products: cartItems, date: new Date() },
            ];

            const analysisResult =
              await LangChainService.analyzeShoppingPatterns(
                mockPurchaseHistory
              );
            setRecommendations(analysisResult.recommendations);
          }
        } catch (recError) {
          console.error("Error generating recommendations:", recError);
        }
      }
    } catch (error) {
      console.error("Error processing extracted items:", error);
    } finally {
      setIsProcessingItems(false);
    }
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 h-full">
      <div className="w-full md:w-2/3 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Recherche de Produits</TabsTrigger>
            <TabsTrigger value="upload">Téléverser une Liste</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4">
            <ProductSearch
              ref={productSearchRef}
              onAddToCart={handleAddToCart}
              extractedItems={extractedItems}
            />
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <ImageUpload onExtractItems={handleExtractItems} />
          </TabsContent>
        </Tabs>

        {recommendations.length > 0 && (
          <Card className="mt-4">
            <CardContent className="pt-4">
              <h3 className="font-medium mb-2">Recommandations</h3>
              <ul className="space-y-1 text-sm">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="w-full md:w-1/3">
        <ShoppingCart
          items={cartItems}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
        />
      </div>
    </div>
  );
}
