export interface LegalDocument {
  slug: 'terms' | 'privacy' | 'cookies';
  title: string;
  description: string;
  content: string;
}

export const legalDocumentList: LegalDocument[] = [
  {
    slug: 'terms',
    title: 'Conditions d\'utilisation',
    description: 'Les règles de base pour l\'utilisation de nos services.',
    content: `
      ## 1. Acceptation des conditions
      En accédant à et en utilisant l'application Billing Enterprise ERP (KSM), vous acceptez d'être lié par les présentes conditions d'utilisation.

      ## 2. Utilisation du Service
      Vous vous engagez à utiliser le service conformément aux lois applicables, notamment les dispositions comptables OHADA. Vous êtes responsable du maintien de la confidentialité de vos identifiants de connexion.

      ## 3. Mode Hors Ligne (Offline First)
      L'application intègre des fonctionnalités de synchronisation hors ligne. Les données saisies localement sont stockées de manière sécurisée dans le navigateur de l'utilisateur et synchronisées dès que la connexion internet est rétablie. Vous devez vous assurer de ne pas vider le cache ou les données de stockage local de votre navigateur avant la fin de la synchronisation sous peine de perdre les données non synchronisées.

      ## 4. Limitation de responsabilité
      Dans toute la mesure permise par la loi, KSM (YowYob) ne pourra être tenu responsable des pertes de données ou des préjudices financiers résultant d'une mauvaise utilisation du service ou de problèmes de réseau.
    `
  },
  {
    slug: 'privacy',
    title: 'Avis de confidentialité',
    description: 'Comment nous collectons, utilisons et protégeons vos données.',
    content: `
      ## 1. Collecte des données
      Nous collectons les données nécessaires au bon fonctionnement de votre comptabilité et de la gestion de votre organisation (informations sur les vendeurs, agences, clients, factures et devis).

      ## 2. Stockage local et hors ligne
      Afin de garantir un fonctionnement sans coupure (mode Offline), certaines données professionnelles ainsi que les tokens de session chiffrés sont stockés dans le stockage local (\`localStorage\`) et la base de données locale (\`IndexedDB\`) de votre navigateur.

      ## 3. Sécurité
      Nous mettons en œuvre toutes les mesures de sécurité nécessaires pour protéger vos données contre tout accès non autorisé. Les communications entre l'application et les serveurs sont sécurisées (HTTPS/TLS).

      ## 4. Vos droits
      Vous conservez l'accès, le droit de rectification et de suppression de toutes vos données personnelles et professionnelles stockées sur nos serveurs.
    `
  },
  {
    slug: 'cookies',
    title: 'Politique relative aux cookies',
    description: 'Comment nous utilisons les cookies sur nos plateformes.',
    content: `
      ## 1. Qu'est-ce qu'un cookie ?
      Un cookie est un petit fichier texte stocké sur votre terminal lorsque vous visitez un site internet.

      ## 2. Utilisation des cookies et technologies similaires
      Nous utilisons principalement le stockage local du navigateur (\`localStorage\`) pour conserver votre session active et vos paramètres de navigation. Aucun cookie publicitaire tiers n'est utilisé sur nos plateformes.

      ## 3. Cookies techniques essentiels
      Ces cookies et clés de stockage sont strictement nécessaires à l'authentification et à la synchronisation hors ligne de l'application Billing. Ils ne peuvent pas être désactivés.
    `
  }
];
