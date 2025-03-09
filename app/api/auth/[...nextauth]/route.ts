import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

{
  /*config connexion bdd*/
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        try {
          // Vérifier si l'utilisateur existe dans la base de données
          const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [credentials.email]
          );

          const user = result.rows[0];

          if (!user) {
            throw new Error("Aucun utilisateur trouvé avec cet email");
          }

          // Vérifier le mot de passe
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordMatch) {
            throw new Error("Mot de passe incorrect");
          }

          // Retourner les informations de l'utilisateur
          return {
            id: user.id,
            name: `${user.prenom} ${user.nom}`,
            email: user.email,
          };
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          throw new Error(error.message || "Erreur lors de l'authentification");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
