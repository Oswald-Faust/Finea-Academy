import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../widgets/custom_bottom_navigation.dart';
import '../models/newsletter_model.dart';
import 'main_navigation_screen.dart';
import 'newsletter_detail_screen.dart';

class NewsletterScreen extends StatefulWidget {
  const NewsletterScreen({super.key});

  @override
  State<NewsletterScreen> createState() => _NewsletterScreenState();
}

class _NewsletterScreenState extends State<NewsletterScreen> {
  final List<NewsletterArticle> _articles = [
    NewsletterArticle(
      id: '1',
      title: 'La guerre commerciale de Donald Trump, un immense défi pour l\'économie mondiale',
      content: 'La guerre commerciale initiée par Donald Trump en 2018 visait à réduire le déficit commercial américain, notamment avec la Chine. Cette politique protectionniste a bouleversé les équilibres économiques mondiaux, entraînant une hausse des droits de douane, des représailles économiques et des tensions sur les chaînes d\'approvisionnement. Cette politique a perturbé les équilibres économiques mondiaux, provoquant un ralentissement du commerce international, des incertitudes pour les entreprises et un impact direct sur les consommateurs, marquant un tournant majeur dans la mondialisation.',
      imageUrl: 'assets/images/Bourse 1 .jpg',
      source: 'Finéa app',
      date: DateTime(2025, 7, 3),
      isBookmarked: false,
    ),
    NewsletterArticle(
      id: '2',
      title: 'Les pays pauvres étranglés par le poids de la dette',
      content: 'Les pays en développement font face à une crise de la dette sans précédent. L\'accumulation de dettes publiques et privées, combinée à la hausse des taux d\'intérêt et à la dépréciation des monnaies locales, plonge de nombreux pays dans une situation économique critique. Cette crise menace la stabilité financière mondiale et remet en question les mécanismes de financement du développement international.',
      imageUrl: 'assets/images/Bourse 2 .jpg',
      source: 'Finéa app',
      date: DateTime(2025, 7, 1),
      isBookmarked: false,
    ),
    NewsletterArticle(
      id: '3',
      title: 'L\'impact des cryptomonnaies sur l\'économie traditionnelle',
      content: 'L\'émergence des cryptomonnaies bouleverse les systèmes financiers traditionnels. Bitcoin, Ethereum et autres monnaies numériques créent de nouveaux paradigmes économiques, remettant en question le rôle des banques centrales et des institutions financières établies.',
      imageUrl: 'assets/images/Trading 1.jpg',
      source: 'Finéa app',
      date: DateTime(2025, 6, 28),
      isBookmarked: true,
    ),
    NewsletterArticle(
      id: '4',
      title: 'Les enjeux de la transition énergétique pour l\'économie mondiale',
      content: 'La transition vers les énergies renouvelables représente un défi économique majeur. Cette transformation nécessite des investissements massifs dans les infrastructures vertes tout en gérant la transition des industries polluantes vers des modèles durables.',
      imageUrl: 'assets/images/Bourse 3 .jpg',
      source: 'Finéa app',
      date: DateTime(2025, 6, 25),
      isBookmarked: false,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0f0f23),
      body: Column(
        children: [
          Expanded(
            child: CustomScrollView(
              slivers: [
                // Header avec logo et titre
                SliverToBoxAdapter(
                  child: Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // Logo et titre
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: const Color(0xFF000D64),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.public,
                                color: Colors.white,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            const Text(
                              'finéa',
                              style: TextStyle(
                                color: Color(0xFF000D64),
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Poppins',
                              ),
                            ),
                            const Spacer(),
                            // Graphique en ligne
                            Container(
                              width: 60,
                              height: 30,
                              child: CustomPaint(
                                painter: LineChartPainter(),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'Newsletter',
                          style: TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Liste des articles
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final article = _articles[index];
                      return FadeInUp(
                        duration: Duration(milliseconds: 600 + (index * 100)),
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          child: _buildArticleCard(article),
                        ),
                      );
                    },
                    childCount: _articles.length,
                  ),
                ),
                
                // Espace en bas
                const SliverToBoxAdapter(
                  child: SizedBox(height: 100),
                ),
              ],
            ),
          ),
          
          // Barre de navigation en bas
          CustomBottomNavigation(
            currentIndex: 0, // Newsletter est sélectionné
            onTap: (index) {
              // Navigation vers les différentes pages
              if (index != 0) { // Si ce n'est pas la page actuelle
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    builder: (context) => const MainNavigationScreen(),
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }

  Widget _buildArticleCard(NewsletterArticle article) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () => _openArticle(article),
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                // Image de l'article
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    image: DecorationImage(
                      image: AssetImage(article.imageUrl),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                
                const SizedBox(width: 16),
                
                // Contenu de l'article
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        article.title,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Poppins',
                        ),
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${article.source} ${_formatDate(article.date)}',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.7),
                          fontSize: 12,
                          fontFamily: 'Poppins',
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(width: 12),
                
                // Icône de bookmark
                IconButton(
                  onPressed: () => _toggleBookmark(article),
                  icon: Icon(
                    article.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                    color: article.isBookmarked ? Colors.blue : Colors.white,
                    size: 24,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openArticle(NewsletterArticle article) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => NewsletterDetailScreen(article: article),
      ),
    );
  }

  void _toggleBookmark(NewsletterArticle article) {
    setState(() {
      article.isBookmarked = !article.isBookmarked;
    });
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          article.isBookmarked ? 'Article ajouté aux favoris' : 'Article retiré des favoris',
        ),
        backgroundColor: Colors.blue,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year}';
  }
}

// Peintre personnalisé pour le graphique en ligne
class LineChartPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.blue
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(0, size.height * 0.8);
    path.lineTo(size.width * 0.3, size.height * 0.6);
    path.lineTo(size.width * 0.6, size.height * 0.4);
    path.lineTo(size.width, size.height * 0.2);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
} 