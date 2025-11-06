class NewsletterArticle {
  final String id;
  final String title;
  final String content;
  final String imageUrl;
  final String source;
  final DateTime date;
  bool isBookmarked;

  NewsletterArticle({
    required this.id,
    required this.title,
    required this.content,
    required this.imageUrl,
    required this.source,
    required this.date,
    this.isBookmarked = false,
  });

  factory NewsletterArticle.fromJson(Map<String, dynamic> json) {
    return NewsletterArticle(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      content: _extractContent(json['content']),
      imageUrl: json['coverImage'] ?? json['imageUrl'] ?? '',
      source: json['source'] ?? 'Finéa app',
      date: json['publishedAt'] != null 
          ? DateTime.parse(json['publishedAt']) 
          : json['createdAt'] != null 
              ? DateTime.parse(json['createdAt'])
              : DateTime.now(),
      isBookmarked: json['isBookmarked'] ?? false,
    );
  }

  static String _extractContent(dynamic content) {
    if (content == null) return '';

    // Si c'est une String, c'est probablement du HTML de Quill.js
    if (content is String) {
      // Nettoyer le HTML pour améliorer l'affichage
      String cleanedContent = _cleanHtmlContent(content);
      return cleanedContent.isNotEmpty ? cleanedContent : 'Contenu non disponible';
    }
    
    if (content is Map<String, dynamic>) {
      // Si c'est du contenu Editor.js (ancien format)
      if (content['blocks'] != null && content['blocks'] is List) {
        final blocks = content['blocks'] as List;
        
        // Si les blocks sont vides, retourner un message
        if (blocks.isEmpty) {
          return 'Contenu non disponible';
        }
        
        return blocks.map((block) {
          if (block['data'] != null && block['data']['text'] != null) {
            return block['data']['text'];
          }
          return '';
        }).join('\n\n');
      }
      
      // Si c'est du contenu HTML
      if (content['htmlContent'] != null) {
        return content['htmlContent'];
      }
    }
    
    return 'Contenu non disponible';
  }

  // Méthode pour nettoyer le contenu HTML
  static String _cleanHtmlContent(String htmlContent) {
    if (htmlContent.isEmpty) return '';
    
    // Remplacer les images base64 très longues par un placeholder
    // Les images base64 commencent par "data:image" et sont très longues
    RegExp base64ImageRegex = RegExp(r'<img[^>]*src="data:image[^"]*"[^>]*>');
    
    String cleanedContent = htmlContent.replaceAllMapped(base64ImageRegex, (match) {
      // Extraire les attributs de l'image
      String imgTag = match.group(0) ?? '';
      
      // Chercher l'attribut alt ou title
      RegExp altRegex = RegExp(r'alt="([^"]*)"');
      RegExp titleRegex = RegExp(r'title="([^"]*)"');
      
      String altText = altRegex.firstMatch(imgTag)?.group(1) ?? 'Image';
      String titleText = titleRegex.firstMatch(imgTag)?.group(1) ?? altText;
      
      // Remplacer par un placeholder avec un message
      return '<div style="padding: 20px; background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; text-align: center; color: #6b7280; font-family: system-ui;">'
          '<p style="margin: 0; font-size: 14px;">📷 $titleText</p>'
          '<p style="margin: 5px 0 0 0; font-size: 12px;">Image disponible dans la version web</p>'
          '</div>';
    });
    
    return cleanedContent;
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'content': content,
      'imageUrl': imageUrl,
      'source': source,
      'date': date.toIso8601String(),
      'isBookmarked': isBookmarked,
    };
  }

  NewsletterArticle copyWith({
    String? id,
    String? title,
    String? content,
    String? imageUrl,
    String? source,
    DateTime? date,
    bool? isBookmarked,
  }) {
    return NewsletterArticle(
      id: id ?? this.id,
      title: title ?? this.title,
      content: content ?? this.content,
      imageUrl: imageUrl ?? this.imageUrl,
      source: source ?? this.source,
      date: date ?? this.date,
      isBookmarked: isBookmarked ?? this.isBookmarked,
    );
  }
} 