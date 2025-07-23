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
    
    if (content is String) {
      return content;
    }
    
    if (content is Map<String, dynamic>) {
      // Si c'est du contenu Editor.js
      if (content['blocks'] != null && content['blocks'] is List) {
        final blocks = content['blocks'] as List;
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
    
    return '';
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