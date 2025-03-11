"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  ShoppingCart,
  ArrowUpDown,
} from "lucide-react";
import {
  PrixNcApi,
  Product,
  SearchParams,
  SearchResult,
  ProductDetails,
} from "@/lib/api/prix-nc-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LangChainService } from "@/lib/services/langchain-service";
import { ProductDetails as ProductDetailsComponent } from "./ProductDetails";

interface ProductSearchProps {
  onProductSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  extractedItems?: string[];
}

export interface ProductSearchRef {
  setSearchQuery: (query: string) => void;
  handleSearch: () => Promise<void>;
}

const ProductSearch = forwardRef<ProductSearchRef, ProductSearchProps>(
  ({ onProductSelect, onAddToCart, extractedItems }, ref) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"price" | "distance" | "store">(
      "price"
    );
    const [userLocation, setUserLocation] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);

    // État de pagination
    const [pagination, setPagination] = useState({
      currentPage: 0,
      totalPages: 1,
      totalItems: 0,
      pageSize: 15,
    });

    // Variables d'état pour les détails du produit
    const [selectedProduct, setSelectedProduct] =
      useState<ProductDetails | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Rendre la requête de recherche et handleSearch accessibles via ref
    useImperativeHandle(ref, () => ({
      setSearchQuery,
      handleSearch,
    }));

    // Obtenir la localisation de l'utilisateur au montage du composant
    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.error(
              "Erreur lors de l'obtention de la localisation:",
              error
            );
          }
        );
      }
    }, []);

    const handleSearch = async (page = 0) => {
      if (!searchQuery.trim()) return;

      setIsLoading(true);
      setError(null);

      try {
        const searchParams: SearchParams = {
          query: searchQuery,
          page: page,
          size: 15,
          location: userLocation || undefined,
          sortBy: sortBy,
        };

        const result = await PrixNcApi.searchProducts(searchParams);
        setSearchResults(result.products);
        setPagination(result.pagination);
      } catch (err) {
        console.error("Search error:", err);
        setError(
          "Une erreur est survenue lors de la recherche. Veuillez réessayer."
        );
      } finally {
        setIsLoading(false);
      }
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
      if (newPage >= 0 && newPage < pagination.totalPages) {
        handleSearch(newPage);
      }
    };

    {
      /*Fonction de tri*/
    }
    const handleSortChange = (value: string) => {
      setSortBy(value as "price" | "distance" | "store");

      // Re-trier les  resultats existants
      if (searchResults.length > 0) {
        let sortedResults = [...searchResults];

        switch (value) {
          case "price":
            sortedResults.sort((a, b) => a.price - b.price);
            break;
          case "distance":
            if (userLocation) {
              sortedResults.sort(
                (a, b) =>
                  (a.store?.distance || Infinity) -
                  (b.store?.distance || Infinity)
              );
            }
            break;
          case "store":
            sortedResults.sort((a, b) =>
              (a.store?.name || "").localeCompare(b.store?.name || "")
            );
            break;
        }

        setSearchResults(sortedResults);
      }
    };

    // Gérer la sélection des produits pour plus de détails
    // Handle product selection for details
    const handleProductSelect = async (product: Product) => {
      setIsLoadingDetails(true);
      try {
        console.log("Selected product:", product);
        const details = await PrixNcApi.getProductById(
          product.id,
          product.name
        );
        setSelectedProduct(details);
        setIsDetailsOpen(true);
        // Appeler également onProductSelect du parent si fourni
        if (onProductSelect) {
          onProductSelect(product);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des détails du produit:",
          error
        );
        setError("Impossible de charger les détails du produit.");
      } finally {
        setIsLoadingDetails(false);
      }
    };

    // Add new state for content visibility
    const [isContentVisible, setIsContentVisible] = useState(true);

    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recherche de Produits</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsContentVisible(!isContentVisible)}
            title={isContentVisible ? "Réduire" : "Agrandir"}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </CardHeader>
        {isContentVisible && (
          <CardContent>
            <div className="flex flex-col space-y-4">
              {/* Recherche d'un produit */}
              <div className="flex space-x-2">
                <div className="flex-1 text-white">
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading}>
                  {isLoading ? "Recherche..." : <Search className="h-4 w-4" />}
                </Button>
              </div>

              {/* Localisation de l'utilisateur */}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {userLocation
                    ? "Localisation activée"
                    : "Localisation non disponible"}
                </span>
              </div>

              {/* Filtrage des résultats */}
              <div className="flex items-center space-x-2 text-white">
                <span className="text-sm">Trier par:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Prix (croissant)</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="store">Magasin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Affichage des erreurs */}
              {error && (
                <div className="p-2 bg-red-100 text-red-800 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Résultats de recherche */}
              {searchResults.length > 0 ? (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">
                    Résultats ({searchResults.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((product) => (
                      <Card key={product.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {product.store.name}
                              </p>
                              {product.store.distance && (
                                <p className="text-xs text-muted-foreground">
                                  {product.store.distance.toFixed(1)} km
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">
                                {product.price.toLocaleString("fr-FR")} XPF
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.availability !== false
                                  ? "En stock"
                                  : "Stock non confirmé"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleProductSelect(product)}
                              disabled={isLoadingDetails}
                            >
                              {isLoadingDetails ? "Chargement..." : "Détails"}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                onAddToCart && onAddToCart(product)
                              }
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Ajouter
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center mt-6 space-x-2 ">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 0}
                      >
                        <ChevronLeft className="h-4 w-4 text-white hover:text-purple-500" />
                      </Button>

                      <span className="text-sm">
                        Page {pagination.currentPage + 1} sur{" "}
                        {pagination.totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={
                          pagination.currentPage === pagination.totalPages - 1
                        }
                      >
                        <ChevronRight className="h-4 w-4 text-white hover:text-purple-500" />
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                searchQuery && (
                  <div className="text-center my-8 text-muted-foreground">
                    Aucun résultat trouvé pour "{searchQuery}"
                  </div>
                )
              )}

              {/* Composant de détails du produit à la fin de la déclaration de retour, en dehors de la boucle */}
              <ProductDetailsComponent
                product={selectedProduct}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                onAddToCart={(product) => {
                  if (onAddToCart) onAddToCart(product);
                  setIsDetailsOpen(false);
                }}
              />
            </div>
          </CardContent>
        )}
      </Card>
    );
  }
);

ProductSearch.displayName = "ProductSearch";

export default ProductSearch;
