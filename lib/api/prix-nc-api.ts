// Using fetch instead of request-promise for browser compatibility
// API calls now go through our Next.js API route to avoid CORS issues

// Interface pour les produits
export interface Product {
  id: string;
  name: string;
  price: number;
  store: Store;
  imageUrl?: string;
  category?: string;
  availability?: boolean;
}

// Interface pour les magasins
export interface Store {
  id: string;
  name: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  distance?: number;
}

// Interface des paramètres de recherche
export interface SearchParams {
  query: string;
  page?: number;
  size?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  sortBy?: "price" | "distance" | "store";
}

// Interface pour les résultats de recherche avec pagination
export interface SearchResult {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

export const PrixNcApi = {
  /**
   * Recherche des produits avec pagination
   */
  searchProducts: async (params: SearchParams): Promise<SearchResult> => {
    try {
      const url = `/api/prixnc?query=${encodeURIComponent(params.query)}&page=${
        params.page ?? 0
      }&size=${params.size ?? 15}`; // 15 items par page

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Initialiser les valeurs par défaut pour la pagination
      const pagination = {
        currentPage: params.page ?? 0,
        totalPages: data.page?.totalPages ?? 1,
        totalItems: data.page?.totalElements ?? 0,
        pageSize: params.size ?? 15
      };

      if (!data._embedded || !data._embedded.produitsprix) {
        return { products: [], pagination };
      }

      const products = data._embedded.produitsprix.map((item: any) => ({
        id: item.id,
        name: item.nom,
        price: item.meilleurPrix,
        // Always provide a store object with default values if needed
        store: {
          id: item.idCommerce || item.idCommune || "unknown",
          name: item.secteurConso || "Non spécifié",
          distance: item.distance || null,
        },
        category: item.sousSecteurConso || "Non catégorisé",
        availability: !item.promotion,
      }));

      return {
        products,
        pagination
      };
    } catch (error) {
      console.error("Erreur de recherche produits:", error);
      throw error;
    }
  },

  /**
   * Récupération des détails d'un produit
   */
  getProductById: async (productId: string): Promise<Product> => {
    try {
      const url = `/api/prixnc?endpoint=produits&id=${encodeURIComponent(
        productId
      )}`;

      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.statusText}`);
      }

      const item = await response.json();
      return {
        id: item.id,
        name: item.nom,
        price: item.meilleurPrix,
        // Always provide a store object with default values
        store: {
          id: item.idCommerce || item.idCommune || "unknown",
          name: item.secteurConso || "Non spécifié",
          distance: item.distance || null,
        },
        category: item.sousSecteurConso || "Non catégorisé",
        availability: !item.promotion,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des détails du produit:",
        error
      );
      throw error;
    }
  },
};
