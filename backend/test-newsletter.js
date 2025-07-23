const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testNewsletterAPI = async () => {
  console.log('🚀 Test de l\'API Newsletter Finéa Académie\n');
  
  try {
    // 1. Créer des articles de test
    console.log('1. Création des articles de test...');
    const createResponse = await axios.post(`${BASE_URL}/newsletters/seed-test-data`);
    console.log('✅ Articles de test créés:', createResponse.data.message);
    
    // 2. Récupérer tous les articles
    console.log('\n2. Récupération des articles...');
    const articlesResponse = await axios.get(`${BASE_URL}/newsletters?status=published&limit=10`);
    console.log('✅ Articles récupérés:', articlesResponse.data.data.length, 'articles');
    
    // Afficher les articles
    articlesResponse.data.data.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title}`);
    });
    
    // 3. Récupérer un article spécifique
    if (articlesResponse.data.data.length > 0) {
      const firstArticle = articlesResponse.data.data[0];
      console.log(`\n3. Récupération de l'article "${firstArticle.title}"...`);
      const articleResponse = await axios.get(`${BASE_URL}/newsletters/${firstArticle._id}`);
      console.log('✅ Article récupéré:', articleResponse.data.data.title);
    }
    
    // 4. Test du bookmark
    if (articlesResponse.data.data.length > 0) {
      const firstArticle = articlesResponse.data.data[0];
      console.log(`\n4. Test du bookmark pour l'article "${firstArticle.title}"...`);
      const bookmarkResponse = await axios.patch(`${BASE_URL}/newsletters/${firstArticle._id}/bookmark`, {
        isBookmarked: true
      });
      console.log('✅ Bookmark testé:', bookmarkResponse.data.message);
    }
    
    console.log('\n🎉 Tous les tests de l\'API Newsletter sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
  }
};

// Exécuter le test
testNewsletterAPI(); 