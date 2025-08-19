import 'dart:convert';
import 'dart:io';

// Script de test pour vérifier l'API de concours
void main() async {
  print('🧪 Test de l\'API Concours Hebdomadaire');
  print('=====================================\n');

  const baseUrl = 'http://localhost:5000/api';

  try {
    // Test 1: Vérifier le concours actuel
    print('1️⃣ Test du concours actuel...');
    final currentResponse = await _makeRequest('$baseUrl/contests/weekly/current');
    if (currentResponse != null) {
      print('✅ Concours actuel récupéré');
      final contest = json.decode(currentResponse);
      if (contest['success'] && contest['data'] != null) {
        print('   📊 Titre: ${contest['data']['title']}');
        print('   📅 Statut: ${contest['data']['status']}');
        print('   👥 Participants: ${contest['data']['currentParticipants']}');
        print('   🎯 Date de tirage: ${contest['data']['drawDate']}');
      } else {
        print('   ⚠️ Aucun concours actif');
      }
    } else {
      print('❌ Erreur lors de la récupération du concours');
    }

    print('');

    // Test 2: Vérifier les statistiques
    print('2️⃣ Test des statistiques...');
    final statsResponse = await _makeRequest('$baseUrl/contests/weekly/stats');
    if (statsResponse != null) {
      print('✅ Statistiques récupérées');
      final stats = json.decode(statsResponse);
      if (stats['success'] && stats['data'] != null) {
        print('   📈 Total concours: ${stats['data']['totalContests']}');
        print('   👥 Total participants: ${stats['data']['totalParticipants']}');
        print('   🏆 Concours terminés: ${stats['data']['completedContests']}');
      }
    } else {
      print('❌ Erreur lors de la récupération des statistiques');
    }

    print('');

    // Test 3: Vérifier l'historique
    print('3️⃣ Test de l\'historique...');
    final historyResponse = await _makeRequest('$baseUrl/contests/weekly/history?limit=3');
    if (historyResponse != null) {
      print('✅ Historique récupéré');
      final history = json.decode(historyResponse);
      if (history['success'] && history['data'] != null) {
        final contests = history['data'] as List;
        print('   📚 ${contests.length} concours dans l\'historique');
        for (int i = 0; i < contests.length && i < 3; i++) {
          final contest = contests[i];
          print('   ${i + 1}. ${contest['title']} (${contest['status']})');
        }
      }
    } else {
      print('❌ Erreur lors de la récupération de l\'historique');
    }

    print('');

    // Test 4: Vérifier la participation (sans authentification)
    print('4️⃣ Test de participation (sans auth)...');
    final participateResponse = await _makeRequest(
      '$baseUrl/contests/weekly/participate',
      method: 'POST',
      body: '{}',
    );
    if (participateResponse != null) {
      print('✅ Réponse reçue pour la participation');
      final result = json.decode(participateResponse);
      print('   📝 Réponse: ${result['success']} - ${result['error'] ?? 'OK'}');
    } else {
      print('❌ Erreur lors de la participation');
    }

  } catch (e) {
    print('💥 Erreur générale: $e');
  }

  print('\n🏁 Test terminé !');
}

Future<String?> _makeRequest(String url, {String method = 'GET', String? body}) async {
  try {
    final client = HttpClient();
    final request = await client.openUrl(method, Uri.parse(url));
    
    request.headers.set('Content-Type', 'application/json');
    
    if (body != null) {
      request.write(body);
    }
    
    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();
    
    await client.close();
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return responseBody;
    } else {
      print('   ⚠️ Status: ${response.statusCode}');
      return responseBody;
    }
  } catch (e) {
    print('   💥 Erreur réseau: $e');
    return null;
  }
}
