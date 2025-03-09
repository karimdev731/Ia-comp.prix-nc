import { NextResponse } from "next/server";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

{
  /*config connexion bdd*/
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const { nom, prenom, email, password } = await request.json();

    // Vérifier si l'utilisateur existe déjà
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (userCheck.rows.length > 0) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer le nouvel utilisateur
    const result = await pool.query(
      "INSERT INTO users (nom, prenom, email, password) VALUES ($1, $2, $3, $4) RETURNING id",
      [nom, prenom, email, hashedPassword]
    );

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", userId: result.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { message: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
