"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2025 HNC.dev. Tous droits réservés.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/Terms"
            className="text-white hover:underline text-sm  underline-offset-4"
          >
            Conditions d'utilisation et Confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  );
}
