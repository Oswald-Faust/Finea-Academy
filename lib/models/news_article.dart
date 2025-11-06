class NewsArticle {
  final String title;
  final String source;
  final String timeAgo;
  final String? imageUrl;
  final String excerpt;
  final int comments;
  final String? url;

  NewsArticle({
    required this.title,
    required this.source,
    required this.timeAgo,
    this.imageUrl,
    required this.excerpt,
    required this.comments,
    this.url,
  });

  factory NewsArticle.fromJson(Map<String, dynamic> json) {
    return NewsArticle(
      title: json['title'] ?? '',
      source: json['source'] ?? '',
      timeAgo: json['timeAgo'] ?? '',
      imageUrl: json['imageUrl'],
      excerpt: json['excerpt'] ?? '',
      comments: json['comments'] ?? 0,
      url: json['url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'source': source,
      'timeAgo': timeAgo,
      'imageUrl': imageUrl,
      'excerpt': excerpt,
      'comments': comments,
      'url': url,
    };
  }
}

