import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import '../models/news_model.dart';
import '../services/api_service.dart';

class NewsDetailScreen extends StatefulWidget {
  final String newsId;

  const NewsDetailScreen({
    super.key,
    required this.newsId,
  });

  @override
  State<NewsDetailScreen> createState() => _NewsDetailScreenState();
}

class _NewsDetailScreenState extends State<NewsDetailScreen> {
  final ApiService _apiService = ApiService();
  NewsArticle? news;
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadNewsDetail();
  }

  Future<void> _loadNewsDetail() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final response = await _apiService.getNewsById(widget.newsId);
      
      if (response.success && response.data != null) {
        setState(() {
          news = NewsArticle.fromJson(response.data!);
          isLoading = false;
        });
      } else {
        setState(() {
          news = null;
          isLoading = false;
          error = response.error ?? 'Actualité non trouvée';
        });
      }
    } catch (e) {
      setState(() {
        isLoading = false;
        error = 'Erreur lors du chargement de l\'actualité';
      });
      print('Erreur lors du chargement de l\'actualité: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: SafeArea(
        child: isLoading
            ? _buildLoadingState()
            : error != null
                ? _buildErrorState()
                : news == null
                    ? _buildNotFoundState()
                    : _buildNewsDetail(),
      ),
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(color: Colors.blue),
          SizedBox(height: 16),
          Text(
            'Chargement de l\'actualité...',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 16,
              fontFamily: 'Poppins',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            color: Colors.red,
            size: 64,
          ),
          const SizedBox(height: 16),
          Text(
            error ?? 'Erreur de chargement',
            style: const TextStyle(
              color: Colors.red,
              fontSize: 18,
              fontFamily: 'Poppins',
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _loadNewsDetail,
            icon: const Icon(Icons.refresh, size: 20),
            label: const Text('Réessayer'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.arrow_back, size: 20),
            label: const Text('Retour'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.grey[700],
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotFoundState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.article_outlined,
            color: Colors.grey,
            size: 64,
          ),
          const SizedBox(height: 16),
          const Text(
            'Actualité non trouvée',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 18,
              fontFamily: 'Poppins',
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Cette actualité n\'existe pas ou a été supprimée.',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 14,
              fontFamily: 'Poppins',
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => Navigator.of(context).pop(),
            icon: const Icon(Icons.arrow_back, size: 20),
            label: const Text('Retour à l\'accueil'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNewsDetail() {
    return CustomScrollView(
      slivers: [
        // App Bar avec image de couverture
        SliverAppBar(
          expandedHeight: 350,
          pinned: true,
          backgroundColor: Colors.transparent,
          leading: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.5),
              borderRadius: BorderRadius.circular(12),
            ),
            child: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
          actions: [
            Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: IconButton(
                icon: const Icon(Icons.share, color: Colors.white),
                onPressed: () => _shareNews(),
              ),
            ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: Stack(
              fit: StackFit.expand,
              children: [
                // Image de couverture
                if (news!.coverImage != null && news!.coverImage!.isNotEmpty)
                  Image.network(
                    news!.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              Colors.blue.withOpacity(0.8),
                              Colors.purple.withOpacity(0.8),
                            ],
                          ),
                        ),
                      );
                    },
                  )
                else
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.blue.withOpacity(0.8),
                          Colors.purple.withOpacity(0.8),
                        ],
                      ),
                    ),
                  ),
                
              ],
            ),
          ),
        ),

        // Contenu de l'actualité
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Titre de l'actualité
                Text(
                  news!.title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                    height: 1.3,
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // Métadonnées
                _buildMetadata(),
                
                const SizedBox(height: 24),
                
                // Contenu principal
                _buildContent(),
                
                const SizedBox(height: 32),
                
                // Tags
                if (news!.tags.isNotEmpty)
                  _buildTags(),
                
                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMetadata() {
    return Row(
      children: [
        // Auteur
        Expanded(
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(
                  Icons.person,
                  color: Colors.blue,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Auteur',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  Text(
                    news!.authorName,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      fontFamily: 'Poppins',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        
        // Date de publication
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            const Text(
              'Publié',
              style: TextStyle(
                color: Colors.white70,
                fontSize: 12,
                fontFamily: 'Poppins',
              ),
            ),
            Text(
              news!.formattedPublishedDate,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
      ],
    );
  }


  Widget _buildContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Contenu',
          style: TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 16),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: Html(
            data: news!.content,
            style: {
              "body": Style(
                color: Colors.white,
                fontSize: FontSize(16),
                lineHeight: LineHeight(1.8),
                fontFamily: 'Poppins',
                margin: Margins.zero,
                padding: HtmlPaddings.zero,
              ),
              "p": Style(
                color: Colors.white,
                fontSize: FontSize(16),
                lineHeight: LineHeight(1.8),
                fontFamily: 'Poppins',
                margin: Margins.only(bottom: 12),
              ),
              "br": Style(
                margin: Margins.only(bottom: 8),
              ),
              "strong": Style(
                fontWeight: FontWeight.bold,
              ),
              "em": Style(
                fontStyle: FontStyle.italic,
              ),
              "h1": Style(
                color: Colors.white,
                fontSize: FontSize(24),
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
              "h2": Style(
                color: Colors.white,
                fontSize: FontSize(22),
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
              "h3": Style(
                color: Colors.white,
                fontSize: FontSize(20),
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
              "ul": Style(
                color: Colors.white,
                padding: HtmlPaddings.only(left: 16),
              ),
              "ol": Style(
                color: Colors.white,
                padding: HtmlPaddings.only(left: 16),
              ),
              "li": Style(
                color: Colors.white,
                margin: Margins.only(bottom: 8),
              ),
              "a": Style(
                color: Colors.blue,
                textDecoration: TextDecoration.underline,
              ),
              "blockquote": Style(
                color: Colors.white70,
                fontStyle: FontStyle.italic,
                border: Border(left: BorderSide(color: Colors.blue, width: 3)),
                padding: HtmlPaddings.only(left: 16),
                margin: Margins.symmetric(vertical: 16),
              ),
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTags() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Tags',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: news!.tags.map((tag) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.blue.withOpacity(0.5)),
              ),
              child: Text(
                tag,
                style: const TextStyle(
                  color: Colors.blue,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  fontFamily: 'Poppins',
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  void _shareNews() {
    // TODO: Implémenter le partage
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Fonctionnalité de partage en développement'),
        backgroundColor: Colors.blue,
      ),
    );
  }
}
