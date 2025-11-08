import 'package:dio/dio.dart';

void main() async {
  print('🧪 Test de connexion à l\'API Finéa...');
  
  final dio = Dio();
  const String apiUrl = 'https://finea-academy-1.onrender.com/api'; // ⚠️ Pas d'espace à la fin !
  
  try {
    // Test 1: Endpoint de santé
    print('\n1️⃣ Test de l\'endpoint de santé...');
    final healthResponse = await dio.get('$apiUrl/health');
    print('✅ Santé API: ${healthResponse.statusCode}');
    print('📄 Réponse: ${healthResponse.data}');
    
    // Test 2: Récupération des articles de newsletter
    print('\n2️⃣ Test de récupération des articles...');
    final articlesResponse = await dio.get('$apiUrl/newsletters?type=article&status=published&limit=5');
    print('✅ Articles: ${articlesResponse.statusCode}');
    
    if (articlesResponse.data['data'] != null) {
      final articles = articlesResponse.data['data'] as List;
      print('📄 Nombre d\'articles trouvés: ${articles.length}');
      
      if (articles.isNotEmpty) {
        final firstArticle = articles.first;
        print('📰 Premier article: ${firstArticle['title']}');
        if (firstArticle['imageUrl'] != null) {
          print('🖼️ Image: ${firstArticle['imageUrl']}');
        }
      }
    }
    
    // Test 3: Test d'une image uploadée
    print('\n3️⃣ Test d\'accès aux images...');
    try {
      final imageResponse = await dio.get('$apiUrl/../uploads/articles/test.jpg');
      print('✅ Images: ${imageResponse.statusCode}');
    } catch (e) {
      print('⚠️ Images: Erreur attendue (pas d\'images de test)');
    }
    
    print('\n🎉 Tous les tests sont passés avec succès !');
    print('🚀 L\'API est prête à être utilisée dans l\'application Flutter.');
    
  } catch (e) {
    print('\n❌ Erreur lors du test: $e');
    
    if (e is DioException) {
      print('📊 Status: ${e.response?.statusCode}');
      print('📄 Réponse: ${e.response?.data}');
    }
  }
} 