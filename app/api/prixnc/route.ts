import { NextResponse } from "next/server";
import fetch from "node-fetch";

const API_BASE_URL = "https://prix.nc/api/v1";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") ?? "";
  const page = searchParams.get("page") ?? "0";
  const size = searchParams.get("size") ?? "15"; // Default to 15 items per page
  const sort = searchParams.get("sort") ?? "nom,asc";
  const endpoint = searchParams.get("endpoint") ?? "produitsprix/search";
  const id = searchParams.get("id") ?? "";

  try {
    let url;

    if (endpoint === "produits" && id) {
      // For getProductById endpoint
      url = `${API_BASE_URL}/${endpoint}/${id}`;
    } else {
      // For searchProducts endpoint
      url = `${API_BASE_URL}/${endpoint}?nom=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=${sort}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erreur API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur serveur:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
