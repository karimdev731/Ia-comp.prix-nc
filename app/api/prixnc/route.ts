import { NextResponse } from "next/server";
import fetch from "node-fetch";

const API_BASE_URL = "https://prix.nc/api/v1";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "15"; // Par défaut 15 éléments
  const sort = searchParams.get("sort") ?? "nom,asc";
  const endpoint = searchParams.get("endpoint") ?? "produitsprix/search";
  const action = searchParams.get("action") ?? "";
  let idProduit = searchParams.get("idProduit") ?? "";
  const productName = searchParams.get("name") ?? ""; // Nom exact du produit
  const id = searchParams.get("id") ?? ""; // ID du produit (différent de idProduit)

  try {
    let url;

    // 🟢 Étape 1 : Récupération de l'idProduit UNIQUEMENT si on clique sur "Détails"
    if (action === "getIdProduit" && productName) {
      // Recherche exacte par nom de produit
      const productSearchUrl = `${API_BASE_URL}/produitsprix/search?nom=${encodeURIComponent(
        productName
      )}&page=0&size=1&sort=nom,asc`;
      console.log("🔍 Requête pour récupérer idProduit:", productSearchUrl);

      const productResponse = await fetch(productSearchUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!productResponse.ok) {
        return NextResponse.json(
          {
            error: `Erreur lors de la récupération de l'idProduit: ${productResponse.statusText}`,
          },
          { status: productResponse.status }
        );
      }

      const productData = await productResponse.json();
      const produits = productData._embedded?.produitsprix;

      if (!produits || produits.length === 0) {
        return NextResponse.json(
          { error: "Aucun produit trouvé avec ce nom." },
          { status: 404 }
        );
      }

      // Trouver le produit qui correspond exactement au nom recherché
      const exactMatch = produits.find(
        (p: any) => p.nom.toLowerCase() === productName.toLowerCase()
      ) || produits[0];

      idProduit = exactMatch.idProduit;
      console.log("✅ idProduit récupéré:", idProduit);

      return NextResponse.json({ idProduit });
    }

    // 🟠 Étape 2 : Récupération des points de vente après obtention de l'idProduit
    if (action === "sellingPoints" && idProduit) {
      url = `${API_BASE_URL}/relevesprix/search/findByIdProduitOrderByPrixParUniteAscPrixAscMagasinAsc?idProduit=${idProduit}`;
      console.log("📌 Récupération des points de vente avec idProduit:", url);
    }
    // 🔷 Étape 3 : Recherche générale de produits (RESTE INCHANGÉ)
    else if (!action) {
      url = `${API_BASE_URL}/${endpoint}?nom=${encodeURIComponent(
        query
      )}&page=${page}&size=${size}&sort=${sort}`;
      console.log("🔎 Recherche de produits avec URL:", url);
    } else {
      return NextResponse.json(
        { error: "Action inconnue ou paramètres invalides." },
        { status: 400 }
      );
    }

    // 🟣 Étape finale : Exécuter la requête API
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("API Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      console.error("API Error:", response.status, response.statusText);
      
      // Try to get more details from the error response
      let errorDetails = "";
      try {
        const errorData = await response.text();
        errorDetails = errorData;
        console.error("Error details:", errorData);
      } catch (e) {
        console.error("Could not parse error details:", e);
      }
      
      return NextResponse.json(
        { 
          error: `Erreur API: ${response.statusText}`, 
          details: errorDetails,
          url: url
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ 
      error: "Erreur serveur", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
