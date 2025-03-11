"use client";

import { useState } from "react";
import { ProductDetails as ProductDetailsType } from "@/lib/api/prix-nc-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, MapPin, ShoppingBag } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProductDetailsProps {
  product: ProductDetailsType | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductDetailsType) => void;
}

export function ProductDetails({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailsProps) {
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  if (!product) return null;

  const toggleStore = (storeId: string) => {
    setSelectedStore((prev) => (prev === storeId ? null : storeId));
  };

  const handleAddToCart = (
    e: React.MouseEvent,
    product: ProductDetailsType
  ) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {product.name}
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4"></DialogClose>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Catégorie:{" "}
                {product.category ? product.category : "Non catégorisé"}
              </p>
              <p className="text-sm text-muted-foreground">
                Disponibilité:{" "}
                {product.availability === true
                  ? "En stock"
                  : "Stock non confirmé"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {product.price
                  ? `À partir de ${product.price.toLocaleString("fr-FR")} XPF`
                  : "Prix non disponible"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2">
              Points de vente ({product.sellingPoints?.length || 0})
            </h3>
            <div className="space-y-2">
              {product.sellingPoints?.map((point) => (
                <div
                  key={point.id}
                  className="border rounded-md p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleStore(point.id)}
                  aria-expanded={selectedStore === point.id}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{point.storeName}</p>
                      {point.location?.address && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          {point.location.address}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {point.price
                          ? `${point.price.toLocaleString("fr-FR")} XPF`
                          : "Prix inconnu"}
                      </p>
                      {point.pricePerUnit && (
                        <p className="text-xs text-muted-foreground">
                          {point.pricePerUnit.toLocaleString("fr-FR")} XPF
                          {point.unitType ? `/${point.unitType}` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  {selectedStore === point.id && (
                    <div className="mt-2 pt-2 border-t text-sm">
                      {point.lastUpdate && (
                        <p className="text-xs text-muted-foreground">
                          Dernière mise à jour: {formatDate(point.lastUpdate)}
                        </p>
                      )}
                      {point.distance && (
                        <p className="text-xs text-muted-foreground">
                          Distance: {point.distance.toFixed(1)} km
                        </p>
                      )}
                      <div className="mt-2">
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <ShoppingBag className="h-4 w-4 mr-2" />
                          Ajouter au panier
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
