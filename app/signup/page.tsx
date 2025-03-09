"use client";

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

export default function Inscription() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erreur lors de l'inscription");
      }

      {
        /* Redirection */
      }
      router.push("/signin");
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      setError(err.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02]">
      <Card className="w-full max-w-lg bg-gray-900">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Inscription</CardTitle>
          <CardDescription>
            Créez votre compte en remplissant le formulaire ci-dessous
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-md">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  {...register("nom", { required: "Le nom est requis" })}
                />
                {errors.nom && (
                  <p className="text-sm text-red-500">{errors.nom.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  {...register("prenom", { required: "Le prénom est requis" })}
                />
                {errors.prenom && (
                  <p className="text-sm text-red-500">
                    {errors.prenom.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "L'email est requis",
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
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "Le mot de passe est requis",
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
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Veuillez confirmer votre mot de passe",
                  validate: (val) => {
                    if (watch("password") != val) {
                      return "Les mots de passe ne correspondent pas";
                    }
                  },
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-white hover:bg-blue-50"
              disabled={isLoading}
            >
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{" "}
            <a href="/signin" className="text-blue-600 hover:underline">
              Connectez-vous
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
