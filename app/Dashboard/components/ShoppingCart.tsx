"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart as CartIcon, Trash2, MapPin } from "lucide-react";
import { Product } from "@/lib/api/prix-nc-api";

interface ShoppingCartProps {
  items: Product[];
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export default function ShoppingCart({
  items,
  onRemoveItem,
  onClearCart,
}: ShoppingCartProps) {
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Calculate total price whenever items change
  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  }, [items]);

  // Group items by store
  const itemsByStore = items.reduce((acc, item) => {
    // Ensure store and store.name exist, provide default if not
    const storeName = item.store?.name || "Magasin non spécifié";
    if (!acc[storeName]) {
      acc[storeName] = [];
    }
    acc[storeName].push(item);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          <div className="flex items-center">
            <CartIcon className="mr-2 h-5 w-5" />
            Panier ({items.length})
          </div>
        </CardTitle>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearCart}>
            <Trash2 className="h-4 w-4 mr-1" /> Vider
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Votre panier est vide</p>
            <p className="text-sm mt-2">
              Ajoutez des produits depuis la recherche
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-6">
              {Object.entries(itemsByStore).map(([storeName, storeItems]) => (
                <div key={storeName} className="space-y-2">
                  <div className="flex items-center text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                    {storeName}
                  </div>
                  <div className="space-y-2">
                    {storeItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-2 rounded-md bg-muted/50"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.price.toLocaleString("fr-FR")} XPF
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {items.length > 0 && (
        <CardFooter className="flex justify-between border-t pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold">
              {totalPrice.toLocaleString("fr-FR")} XPF
            </p>
          </div>
          <Button>Comparer les prix</Button>
        </CardFooter>
      )}
    </Card>
  );
}
