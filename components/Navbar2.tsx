"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type React from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="flex items-center justify-between px-6 py-4 backdrop-blur-sm border-b bg-black relative"
    >
      <Link href="/" className="flex items-center space-x-2">
        <Bot className="w-8 h-8 text-purple-500" />
        <span className="text-white font-medium text-xl">Prix NC Ai</span>
      </Link>

      {/* Menu desktop */}
      <div className="hidden md:flex items-center space-x-8">
        <NavLink href="/">Acceuil</NavLink>
        <NavLink href="/how-it-works">Nos réalisations</NavLink>
        <NavLink href="/examples">Contact</NavLink>
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <Button
          asChild
          variant="ghost"
          className="text-white hover:text-purple-400"
        >
          <Link href="/signin">Se connecter</Link>
        </Button>
        <Button
          asChild
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Link href="/signup">Commencer</Link>
        </Button>
      </div>

      {/* Menu mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 left-0 w-full bg-black/80 backdrop-blur-md flex flex-col items-center space-y-4 py-6 z-50"
        >
          <NavLink href="/" onClick={() => setIsOpen(false)}>
            Acceuil
          </NavLink>
          <NavLink href="/how-it-works" onClick={() => setIsOpen(false)}>
            Nos réalisations
          </NavLink>
          <NavLink href="/examples" onClick={() => setIsOpen(false)}>
            Contact
          </NavLink>
          <Button
            asChild
            variant="ghost"
            className="text-white hover:text-purple-400"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/signin">Se connecter</Link>
          </Button>
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setIsOpen(false)}
          >
            <Link href="/signup">Commencer</Link>
          </Button>
        </motion.div>
      )}
    </motion.nav>
  );
}

function NavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-gray-300 hover:text-white transition-colors relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full" />
    </Link>
  );
}
