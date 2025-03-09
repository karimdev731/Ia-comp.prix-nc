"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    content: `Bienvenue sur Prix NC AI ("prixncai.nc"). Nous attachons une grande importance à la protection de vos données personnelles et à la transparence dans leur utilisation. Cette page décrit nos pratiques en matière de collecte, d'utilisation, de conservation et de protection des informations. En accédant au Site et en l'utilisant, vous acceptez les présentes conditions.`,
  },
  {
    title: "2. Collecte et Utilisation des Données",
    content: `
      <h3>2.1 Types de Données Collectées</h3>
      <p>Le Site collecte uniquement les informations nécessaires au bon fonctionnement de ses services, notamment :</p>
      <ul>
        <li>Les requêtes de recherche saisies par l'utilisateur (texte ou image) ;</li>
        <li>Les tendances de recherche anonymisées et agrégées ;</li>
        <li>Les informations techniques (adresse IP anonymisée, type de navigateur, système d'exploitation) à des fins d'amélioration du service.</li>
      </ul>
      <p>Aucune donnée personnelle identifiable (nom, email, téléphone) n'est collectée sans consentement explicite de l'utilisateur.</p>

      <h3>2.2 Finalité de la Collecte</h3>
      <p>Les données collectées sont utilisées aux fins suivantes :</p>
      <ul>
        <li>Améliorer la précision des résultats fournis par l'IA et le moteur de recherche ;</li>
        <li>Analyser les tendances de recherche à des fins statistiques ;</li>
        <li>Garantir la sécurité et le bon fonctionnement du Site.</li>
      </ul>
    `,
  },
  {
    title: "3. Responsabilité",
    content: `
      <h3>3.1 Fiabilité des Informations</h3>
      <p>Les sources des informations diffusées sur le Site sont réputées fiables. Toutefois, le Site ne garantit pas qu'elles soient exemptes d'erreurs, d'omissions ou de défauts. Les informations fournies sont à titre indicatif et général, sans valeur contractuelle.</p>

      <h3>3.2 Utilisation des Informations</h3>
      <p>Le Site ne peut être tenu responsable de l'interprétation ou de l'utilisation des informations disponibles. L'utilisateur est seul responsable de l'usage qu'il en fait.</p>

      <h3>3.3 Sécurité Informatique</h3>
      <p>Le Site ne peut être tenu responsable d'éventuels virus ou programmes malveillants qui pourraient infecter le matériel informatique de l'utilisateur suite à une utilisation, un accès ou un téléchargement provenant du Site.</p>

      <h3>3.4 Utilisation Hors Cadre Prévu</h3>
      <p>Toute utilisation du Site en dehors de son cadre initial (recherche de prix, comparaison de produits) est sous la responsabilité exclusive de l'utilisateur. Cette utilisation abusive pourra être retenue contre lui en cas de litige.</p>
    `,
  },
  {
    title: "4. Partage et Conservation des Données",
    content: `
      <h3>4.1 Anonymisation et Stockage</h3>
      <p>Toutes les données collectées sont anonymisées avant stockage. Aucune donnée nominative n'est enregistrée ni partagée.</p>

      <h3>4.2 Partage des Données avec des Tiers</h3>
      <p>Le Site peut partager des statistiques anonymisées sur les tendances de recherche avec des partenaires commerciaux, notamment des entreprises de marketing et d'analyse de données. En aucun cas, ces informations ne permettent d'identifier un utilisateur.</p>
    `,
  },
  {
    title: "5. Droits des Utilisateurs",
    content: `
      <p>Conformément au Règlement Général sur la Protection des Données (RGPD), les utilisateurs disposent des droits suivants :</p>
      <ul>
        <li><strong>Droit d'accès</strong> : Vous pouvez demander quelles informations nous avons collectées sur vous.</li>
        <li><strong>Droit à l'effacement</strong> : Vous pouvez demander la suppression de vos données si vous pensez qu'elles ont été collectées de manière inappropriée.</li>
        <li><strong>Droit d'opposition</strong> : Vous pouvez refuser que vos données soient collectées et traitées.</li>
      </ul>
      <p>Toute demande relative à ces droits peut être adressée à [Email de Contact].</p>
    `,
  },
  {
    title: "6. Modifications de la Politique de Confidentialité",
    content: `Nous nous réservons le droit de modifier cette politique à tout moment. Les utilisateurs seront informés de toute modification importante via une notification sur le Site.`,
  },
  {
    title: "7. Contact",
    content: `Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter à l'adresse suivante : [Email de Contact].`,
  },
];

export default function PrivacyPolicy() {
  const [openSections, setOpenSections] = useState<number[]>([]);

  const toggleSection = (index: number) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 bg-gray-200 ">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gray-300 p-2">
        Confidentialité et Politique d'Utilisation
      </h1>
      {/*Menu sur le coté*/}
      <div className="flex flex-col md:flex-row gap-8">
        <nav className="md:w-1/4 md:sticky md:top-8 md:self-start bg-gray-300 p-4 rounded-lg shadow-sm">
          <ul className="space-y-2">
            {sections.map((section, index) => (
              <li key={index}>
                <a
                  href={`#section-${index}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 hover:bg-gray-100"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:w-3/4">
          {sections.map((section, index) => (
            <div key={index} id={`section-${index}`} className="mb-8">
              <h2
                className="text-2xl font-semibold mb-4 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection(index)}
              >
                {section.title}
                {openSections.includes(index) ? (
                  <ChevronUp className="w-6 h-6" />
                ) : (
                  <ChevronDown className="w-6 h-6" />
                )}
              </h2>
              {openSections.includes(index) && (
                <div
                  className="prose max-w-none bg-gray-200"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
