class OnboardingPage {
  final String title;
  final String description;
  final String imagePath;
  final int pageIndex;
  final List<String> keyFeatures;

  const OnboardingPage({
    required this.title,
    required this.description,
    required this.imagePath,
    required this.pageIndex,
    this.keyFeatures = const [],
  });
}

class OnboardingData {
  static List<OnboardingPage> getPages() {
    return [
      const OnboardingPage(
        title: "",
        description: "",
        imagePath: "assets/images/logo_finea.png",
        pageIndex: 0,
        keyFeatures: [],
      ),
      const OnboardingPage(
        title: "Les mouvements du monde, analysés pour vous",
        description: "Recevez une analyse claire et synthétique de l'économie mondiale, rédigée par un professionnel du secteur bancaire, régulé par l'AMF.\nUn point de vue fiable, sans bruit, pour mieux comprendre les enjeux actuels.",
        imagePath: "/images/notif-removebg-preview.png",
        pageIndex: 1,
        keyFeatures: [],
      ),
      const OnboardingPage(
        title: "Pilotez votre argent avec précision",
        description: "Accédez à des calculateurs simples et puissants pour gérer vos lots de trading, simuler l'effet des intérêts composés et estimer vos capacités d'emprunt bancaire.",
        imagePath: "/images/hands-checker-removebg-preview.png",
        pageIndex: 2,
        keyFeatures: ["Calculateurs avancés", "Simulations précises", "Gestion optimisée"],
      ),
      const OnboardingPage(
        title: "L'éducation financière qui transforme vos décisions",
        description: "Un centre de formation complet pour comprendre, maîtriser et appliquer les bases de l'investissement, quel que soit votre profil.",
        imagePath: "/images/diplome-removebg-preview.png",
        pageIndex: 3,
        keyFeatures: ["Formations certifiées", "Expertise reconnue", "Méthodes éprouvées"],
      ),
      const OnboardingPage(
        title: "Nos Partenaires",
        description: "Pour garantir sécurité et performance, nous avons sélectionné uniquement des partenaires régulés, reconnus pour leur fiabilité et leur conformité.",
        imagePath: "/images/cerrtificate-removebg-preview.png",
        pageIndex: 4,
        keyFeatures: ["Partenaires régulés", "Sécurité garantie", "Confiance établie"],
      ),
      const OnboardingPage(
        title: "Découvre une nouvelle approche innovante",
        description: "Nous proposons une nouvelle approche accessible de l'investissement : une solution innovante qui permet de découvrir le monde de l'investissement à partir de seulement 2€.",
        imagePath: "/images/cadaux-removebg-preview.png",
        pageIndex: 5,
        keyFeatures: ["Accessible dès 2€", "Innovation constante", "Simplicité d'usage"],
      ),
      const OnboardingPage(
        title: "Construisez votre avenir selon votre profil",
        description: "Nous mettons à votre disposition un outil simple et rapide pour déterminer votre profil investisseur. Il s'adapte à votre situation, vos objectifs et votre tolérance au risque afin de vous orienter vers les solutions les plus cohérentes.",
        imagePath: "/images/mail-removebg-preview.png",
        pageIndex: 6,
        keyFeatures: ["Analyses expertes", "Régulation AMF", "Synthèses claires"],
      ),
      const OnboardingPage(
        title: "Plus que des infos, une vraie transmission en temps réel",
        description: "Notre IA partage l'entrée, le suivi et la sortie des trades en temps réel, pour un transfert de gestion fluide et 100 % encadré.",
        imagePath: "/images/calculatrice-removebg-preview.png",
        pageIndex: 7,
        keyFeatures: ["Temps réel", "IA avancée", "Gestion encadrée"],
      ),
    ];
  }
} 