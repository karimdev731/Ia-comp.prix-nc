// Utilisation de fetch au lieu de request-promise pour la compatibilité avec le navigateur
// Les appels d'API passent désormais par notre route API Next.js pour éviter les problèmes CORS

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

// Interface pour les points de vente d'un produit
export interface SellingPoint {
  id: string;
  storeName: string;
  price: number;
  pricePerUnit?: number;
  unitType?: string;
  lastUpdate?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  distance?: number;
}

// Interface pour les détails d'un produit avec ses points de vente
export interface ProductDetails extends Product {
  sellingPoints: SellingPoint[];
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
        pageSize: params.size ?? 15,
      };

      if (!data._embedded || !data._embedded.produitsprix) {
        return { products: [], pagination };
      }

      const products = data._embedded.produitsprix.map((item: any) => ({
        id: item.id,
        name: item.nom,
        price: item.meilleurPrix,
        // Fournissez toujours un objet de magasin avec des valeurs par défaut si nécessaire
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
        pagination,
      };
    } catch (error) {
      console.error("Erreur de recherche produits:", error);
      throw error;
    }
  },

  /**
   * Récupération des détails d'un produit avec tous ses points de vente
   */
  getProductById: async (
    productId: string,
    productName: string
  ): Promise<ProductDetails> => {
    try {
      console.log(
        "Getting product details for:",
        productId,
        "Name:",
        productName
      );

      // Étape 1: Récupérer l'idProduit en utilisant le nom exact du produit
      const getIdUrl = `/api/prixnc?action=getIdProduit&name=${encodeURIComponent(
        productName
      )}`;
      console.log("Fetching idProduit from:", getIdUrl);

      const idResponse = await fetch(getIdUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!idResponse.ok) {
        const errorText = await idResponse.text();
        console.error(
          "idProduit fetch error:",
          idResponse.status,
          idResponse.statusText,
          errorText
        );
        throw new Error(
          `Erreur récupération idProduit: ${idResponse.statusText}`
        );
      }

      const idData = await idResponse.json();
      const realIdProduit = idData.idProduit;

      if (!realIdProduit) {
        throw new Error("Impossible de récupérer l'identifiant du produit");
      }

      console.log("✅ Récupéré idProduit:", realIdProduit);

      // Étape 2: Récupérer les points de vente avec l'idProduit correct
      const sellingPointsUrl = `/api/prixnc?action=sellingPoints&idProduit=${encodeURIComponent(
        realIdProduit
      )}`;
      console.log("Fetching selling points from:", sellingPointsUrl);

      const sellingPointsResponse = await fetch(sellingPointsUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!sellingPointsResponse.ok) {
        const errorText = await sellingPointsResponse.text();
        console.error(
          "Selling points API error:",
          sellingPointsResponse.status,
          sellingPointsResponse.statusText,
          errorText
        );
        throw new Error(
          `Erreur API points de vente: ${sellingPointsResponse.statusText} - ${errorText}`
        );
      }

      const sellingPointsData = await sellingPointsResponse.json();
      console.log("Selling points data received:", sellingPointsData);

      // Vérifier si nous avons des points de vente
      if (
        !sellingPointsData._embedded ||
        !sellingPointsData._embedded.relevesprix ||
        sellingPointsData._embedded.relevesprix.length === 0
      ) {
        throw new Error("Aucun point de vente trouvé pour ce produit");
      }

      // Utiliser les informations du premier point de vente pour construire les détails du produit
      const firstPoint = sellingPointsData._embedded.relevesprix[0];

      // Transformer les données des points de vente
      const sellingPoints: SellingPoint[] = [];

      sellingPointsData._embedded.relevesprix.forEach((point: any) => {
        sellingPoints.push({
          id: point.id || `sp-${Math.random().toString(36).substr(2, 9)}`,
          storeName: point.magasin || "Magasin non spécifié",
          price: point.prix || 0,
          pricePerUnit: point.prixParUnite,
          unitType: point.uniteLabelCourt,
          lastUpdate: point.dateReleve,
          location: {
            address: point.adresse,
            latitude: point.latitude,
            longitude: point.longitude,
          },
          distance: point.distance || null,
        });
      });

      // Trouver le prix le plus bas parmi tous les points de vente
      const lowestPrice = Math.min(
        ...sellingPoints.map((point) => point.price)
      );

      // Construire l'objet ProductDetails à partir des données des points de vente
      return {
        id: productId,
        name: productName || firstPoint.nom || "Produit sans nom",
        price: lowestPrice,
        store: {
          id: firstPoint.idMagasin || "unknown",
          name: firstPoint.magasin || "Non spécifié",
          distance: null,
        },
        category: firstPoint.sousSecteurConso || "Non catégorisé", // Essayer de récupérer la catégorie depuis le point de vente
        availability: true,
        sellingPoints: sellingPoints,
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
