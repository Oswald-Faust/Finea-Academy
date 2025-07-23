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
      id: json['id'] as String,
      title: json['title'] as String,
      content: json['content'] as String,
      imageUrl: json['imageUrl'] as String,
      source: json['source'] as String,
      date: DateTime.parse(json['date'] as String),
      isBookmarked: json['isBookmarked'] as bool? ?? false,
    );
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