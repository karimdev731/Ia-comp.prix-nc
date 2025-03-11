"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function SignIn() {
  return <SignInContent />;
}

function SignInContent() {
  const { data: session, status } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      // Authentification avec credentials (email/password)
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      /* Redirection */
      router.push("/Dashboard");
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setError(err.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirection si déjà connecté
  if (session) {
    router.push("/Dashboard");
    return null;
  }

  {
    /* Affichage au chargement de la page */
  }
  if (status === "loading") return <p>Chargement...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Card className="w-full max-w-md bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Se connecter</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour continuer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email", {
                  required: "Adresse email requise",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Adresse email invalide",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de Passe</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Mot de passe requis",
                  minLength: {
                    value: 8,
                    message:
                      "Le mot de passe doit contenir au moins 8 caractères",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-200 hover:bg-blue-300 font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Connexion en cours ..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-4">
          <Button
            className="w-full bg-white flex items-center justify-start pl-3 gap-1 hover:text-red-500 hover:bg-blue-100 font-bold"
            onClick={async () => {
              setIsLoading(true);
              try {
                const result = await signIn("google", { redirect: false });
                if (!result?.error) {
                  router.push("/Dashboard");
                }
              } catch (err) {
                console.error("Erreur de connexion Google:", err);
                setError("Erreur lors de la connexion avec Google");
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading}
          >
            <img src="/logogoogle2.png" className="w-6 h-6" />
            <span className="flex-1 text-center ">
              Se connecter avec Google
            </span>
          </Button>

          <p className="text-sm text-gray-600">
            Je n'ai pas de compte ?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              S'enregistrer
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
