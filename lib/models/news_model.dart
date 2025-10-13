import 'package:flutter/foundation.dart';

class NewsArticle {
  final String id;
  final String title;
  final String content;
  final String? coverImage;
  final String? summary;
  final String status;
  final DateTime? scheduledFor;
  final DateTime? publishedAt;
  final String weekOfYear;
  final List<String> tags;
  final int views;
  final List<String> targetRoles;
  final int priority;
  final String? authorId;
  final Map<String, dynamic>? author;
  final int version;
  final String? lastModifiedBy;
  final DateTime lastModifiedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  NewsArticle({
    required this.id,
    required this.title,
    required this.content,
    this.coverImage,
    this.summary,
    required this.status,
    this.scheduledFor,
    this.publishedAt,
    required this.weekOfYear,
    required this.tags,
    required this.views,
    required this.targetRoles,
    required this.priority,
    this.authorId,
    this.author,
    required this.version,
    this.lastModifiedBy,
    required this.lastModifiedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory NewsArticle.fromJson(Map<String, dynamic> json) {
    return NewsArticle(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      content: json['content'] ?? '',
      coverImage: json['coverImage'],
      summary: json['summary'],
      status: json['status'] ?? 'draft',
      scheduledFor: json['scheduledFor'] != null 
          ? DateTime.parse(json['scheduledFor']) 
          : null,
      publishedAt: json['publishedAt'] != null 
          ? DateTime.parse(json['publishedAt']) 
          : null,
      weekOfYear: json['weekOfYear'] ?? '',
      tags: List<String>.from(json['tags'] ?? []),
      views: json['views'] ?? 0,
      targetRoles: List<String>.from(json['targetRoles'] ?? []),
      priority: json['priority'] ?? 0,
      authorId: json['author'],
      author: json['author'] is Map ? json['author'] : null,
      version: json['version'] ?? 1,
      lastModifiedBy: json['lastModifiedBy'],
      lastModifiedAt: json['lastModifiedAt'] != null 
          ? DateTime.parse(json['lastModifiedAt']) 
          : DateTime.now(),
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'coverImage': coverImage,
      'summary': summary,
      'status': status,
      'scheduledFor': scheduledFor?.toIso8601String(),
      'publishedAt': publishedAt?.toIso8601String(),
      'weekOfYear': weekOfYear,
      'tags': tags,
      'views': views,
      'targetRoles': targetRoles,
      'priority': priority,
      'authorId': authorId,
      'author': author,
      'version': version,
      'lastModifiedBy': lastModifiedBy,
      'lastModifiedAt': lastModifiedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Méthodes utilitaires
  String get authorName {
    if (author != null) {
      final firstName = author!['firstName'] ?? '';
      final lastName = author!['lastName'] ?? '';
      return '$firstName $lastName'.trim();
    }
    return 'Finéa Rédaction';
  }

  bool get isPublished => status == 'published';
  bool get isScheduled => status == 'scheduled';
  bool get isDraft => status == 'draft';

  // Calculer le temps de lecture estimé
  int get estimatedReadTime {
    final textLength = content.length;
    return (textLength / 200).ceil(); // 200 caractères par minute
  }

  // Formater la date de publication
  String get formattedPublishedDate {
    if (publishedAt != null) {
      final now = DateTime.now();
      final difference = now.difference(publishedAt!);
      
      if (difference.inDays > 0) {
        return 'Il y a ${difference.inDays} jour${difference.inDays > 1 ? 's' : ''}';
      } else if (difference.inHours > 0) {
        return 'Il y a ${difference.inHours} heure${difference.inHours > 1 ? 's' : ''}';
      } else if (difference.inMinutes > 0) {
        return 'Il y a ${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''}';
      } else {
        return 'À l\'instant';
      }
    }
    return '';
  }

  // Obtenir l'URL de l'image de couverture ou une image par défaut
  String get imageUrl {
    if (coverImage != null && coverImage!.isNotEmpty) {
      // Si c'est une URL complète, la retourner telle quelle
      if (coverImage!.startsWith('http')) {
        return coverImage!;
      }
      // Sinon, construire l'URL complète en utilisant l'URL de base de l'environnement
      return '${_getBaseUrl()}$coverImage';
    }
    // Image par défaut
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop';
  }

  // Obtenir l'URL de base selon l'environnement
  String _getBaseUrl() {
    // Utiliser la même logique que dans Environment mais pour les uploads
    const bool isProduction = bool.fromEnvironment('PRODUCTION', defaultValue: false);
    const bool isStaging = bool.fromEnvironment('STAGING', defaultValue: false);
    
    if (isProduction) {
      return 'https://finea-academy-1.onrender.com';
    } else if (isStaging) {
      return 'https://finea-academy-staging.onrender.com';
    } else {
      // En développement, utiliser l'IP locale pour mobile et localhost pour web
      if (kIsWeb) {
        return 'http://localhost:5001';
      } else {
        return 'http://192.168.1.230:5001';
      }
    }
  }

  // Obtenir les catégories basées sur les tags
  List<String> get categories {
    final categoryMap = {
      'technologie': ['tech', 'ai', 'intelligence artificielle', 'nvidia', 'intel'],
      'finance': ['finance', 'investissement', 'trading', 'bourse', 'crypto'],
      'économie': ['économie', 'économie', 'macro', 'inflation'],
      'actualités': ['actualités', 'news', 'breaking'],
    };

    final articleTags = tags.map((tag) => tag.toLowerCase()).toList();
    final foundCategories = <String>[];

    for (final entry in categoryMap.entries) {
      if (articleTags.any((tag) => entry.value.contains(tag))) {
        foundCategories.add(entry.key);
      }
    }

    return foundCategories.isNotEmpty ? foundCategories : ['actualités'];
  }

  // Obtenir la catégorie principale
  String get primaryCategory {
    final cats = categories;
    return cats.isNotEmpty ? cats.first : 'actualités';
  }
}
