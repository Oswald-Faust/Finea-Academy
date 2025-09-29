enum ActusCategory {
  economie,
  bourse,
  crypto,
  immobilier,
  politique,
  technologie,
  international,
}

class ActusArticle {
  final String id;
  final String title;
  final String content;
  final String? imageUrl;
  final String? summary;
  final ActusCategory category;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isPublished;
  final bool isFeatured;
  final List<String> tags;
  final String? author;
  final int? readTime; // en minutes
  final int views;
  final bool isBookmarked;

  const ActusArticle({
    required this.id,
    required this.title,
    required this.content,
    this.imageUrl,
    this.summary,
    required this.category,
    required this.createdAt,
    required this.updatedAt,
    this.isPublished = true,
    this.isFeatured = false,
    this.tags = const [],
    this.author,
    this.readTime,
    this.views = 0,
    this.isBookmarked = false,
  });

  factory ActusArticle.fromJson(Map<String, dynamic> json) {
    return ActusArticle(
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      imageUrl: json['imageUrl'] as String?,
      summary: json['summary'] as String?,
      category: ActusCategory.values.firstWhere(
        (e) => e.toString().split('.').last == json['category'],
        orElse: () => ActusCategory.economie,
      ),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      isPublished: json['isPublished'] as bool? ?? true,
      isFeatured: json['isFeatured'] as bool? ?? false,
      tags: List<String>.from(json['tags'] as List? ?? []),
      author: json['author'] as String?,
      readTime: json['readTime'] as int?,
      views: json['views'] as int? ?? 0,
      isBookmarked: json['isBookmarked'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'imageUrl': imageUrl,
      'summary': summary,
      'category': category.toString().split('.').last,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isPublished': isPublished,
      'isFeatured': isFeatured,
      'tags': tags,
      'author': author,
      'readTime': readTime,
      'views': views,
      'isBookmarked': isBookmarked,
    };
  }

  // Getters helper
  String get categoryLabel {
    switch (category) {
      case ActusCategory.economie:
        return 'Economie';
      case ActusCategory.bourse:
        return 'Bourse';
      case ActusCategory.crypto:
        return 'Crypto';
      case ActusCategory.immobilier:
        return 'Immobilier';
      case ActusCategory.politique:
        return 'Politique';
      case ActusCategory.technologie:
        return 'Technologie';
      case ActusCategory.international:
        return 'International';
    }
  }

  String get categoryIcon {
    switch (category) {
      case ActusCategory.economie:
        return '📊';
      case ActusCategory.bourse:
        return '📈';
      case ActusCategory.crypto:
        return '₿';
      case ActusCategory.immobilier:
        return '🏠';
      case ActusCategory.politique:
        return '🏛';
      case ActusCategory.technologie:
        return '💻';
      case ActusCategory.international:
        return '🌍';
    }
  }

  String get formattedDate {
    final now = DateTime.now();
    final difference = now.difference(createdAt);
    
    if (difference.inDays == 0) {
      return 'Aujourd\'hui';
    } else if (difference.inDays == 1) {
      return 'Hier';
    } else if (difference.inDays < 7) {
      return 'Il y a ${difference.inDays} jours';
    } else {
      return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
    }
  }

  String get shortContent {
    if (summary != null && summary!.isNotEmpty) {
      return summary!;
    }
    
    // Prendre les premiers 150 caracteres du contenu
    if (content.length <= 150) {
      return content;
    }
    
    return '${content.substring(0, 150)}...';
  }
}

// Classe utilitaire pour les donnees de demonstration
class ActusData {
  static List<ActusArticle> get sampleActus => [
    ActusArticle(
      id: '1',
      title: 'Nvidia va investir 5 milliards USD dans Intel et co-developper des puces pour PC et data centers',
      content: 'Nvidia va investir 5 milliards USD dans Intel et co-developper des puces pour PC et data centers avec son rival de toujours. Cette collaboration historique entre les deux geants des semi-conducteurs vise a renforcer la chaine d\'approvisionnement americaine face a la guerre technologique avec la Chine.',
      summary: 'Nvidia investit 5 milliards USD dans Intel pour co-developper des puces, renforcant la chaine d\'approvisionnement americaine.',
      imageUrl: 'https://images.unsplash.com/photo-1599305445771-b1be9b6a2d8b?w=400&h=300&fit=crop',
      category: ActusCategory.technologie,
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      updatedAt: DateTime.now().subtract(const Duration(hours: 2)),
      isPublished: true,
      isFeatured: true,
      tags: ['Nvidia', 'Intel', 'Semi-conducteurs', 'IA'],
      author: 'Finea Redaction',
      readTime: 3,
      views: 1250,
    ),
    ActusArticle(
      id: '2',
      title: 'La guerre commerciale de Donald Trump, un immense defi pour l\'economie mondiale',
      content: 'La guerre commerciale de Donald Trump represente un immense defi pour l\'economie mondiale. Les nouvelles mesures protectionnistes annoncees pourraient avoir des repercussions majeures sur les echanges commerciaux internationaux et les chaines d\'approvisionnement globales.',
      summary: 'Les nouvelles mesures protectionnistes de Trump menacent l\'economie mondiale et les echanges commerciaux.',
      category: ActusCategory.economie,
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      isPublished: true,
      isFeatured: false,
      tags: ['Trump', 'Guerre commerciale', 'Economie mondiale'],
      author: 'Finea Redaction',
      readTime: 5,
      views: 2100,
    ),
    ActusArticle(
      id: '3',
      title: 'Bitcoin atteint un nouveau record historique a 100 000 USD',
      content: 'Le Bitcoin a atteint un nouveau record historique en franchissant la barre symbolique des 100 000 USD. Cette hausse spectaculaire s\'explique par l\'adoption croissante des institutions et la demande des investisseurs institutionnels.',
      summary: 'Bitcoin franchit la barre des 100 000 USD grace a l\'adoption institutionnelle croissante.',
      category: ActusCategory.crypto,
      createdAt: DateTime.now().subtract(const Duration(hours: 6)),
      updatedAt: DateTime.now().subtract(const Duration(hours: 6)),
      isPublished: true,
      isFeatured: false,
      tags: ['Bitcoin', 'Crypto', 'Record', 'Institutionnel'],
      author: 'Finea Redaction',
      readTime: 2,
      views: 3200,
    ),
    ActusArticle(
      id: '4',
      title: 'L\'immobilier francais resiste mieux que prevu en 2024',
      content: 'Contre toute attente, l\'immobilier francais a montre une resistance remarquable en 2024. Malgre les taux d\'interet eleves, les prix se maintiennent dans la plupart des regions, avec une demande toujours soutenue.',
      summary: 'L\'immobilier francais resiste aux taux eleves avec des prix qui se maintiennent.',
      category: ActusCategory.immobilier,
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      updatedAt: DateTime.now().subtract(const Duration(days: 2)),
      isPublished: true,
      isFeatured: false,
      tags: ['Immobilier', 'France', 'Taux d\'interet', 'Prix'],
      author: 'Finea Redaction',
      readTime: 4,
      views: 890,
    ),
  ];
}
