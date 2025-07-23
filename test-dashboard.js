const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testDashboardAPI() {
  console.log('🧪 Test des routes du dashboard...\n');

  try {
    // Test de la route principale du dashboard
    console.log('1. Test de la route /analytics/dashboard');
    const dashboardResponse = await axios.get(`${API_BASE_URL}/analytics/dashboard`);
    console.log('✅ Dashboard stats récupérées avec succès');
    console.log('   - Total utilisateurs:', dashboardResponse.data.data.totalUsers);
    console.log('   - Utilisateurs actifs:', dashboardResponse.data.data.activeUsers);
    console.log('   - Nouveaux ce mois:', dashboardResponse.data.data.newUsersThisMonth);
    console.log('   - Croissance:', dashboardResponse.data.data.userGrowth + '%');
    console.log('   - Taux d\'engagement:', dashboardResponse.data.data.engagementRate + '%');
    console.log('   - Newsletters envoyées:', dashboardResponse.data.data.newslettersSent);
    console.log('   - Utilisateurs par jour:', dashboardResponse.data.data.usersByDay.length, 'jours');
    console.log('   - Rôles:', dashboardResponse.data.data.roleStats);
    console.log('   - Derniers utilisateurs:', dashboardResponse.data.data.recentUsers.length, 'utilisateurs');
    console.log('   - Notifications:', dashboardResponse.data.data.notifications);
    console.log('');

    // Test de la route d'activité
    console.log('2. Test de la route /analytics/activity');
    const activityResponse = await axios.get(`${API_BASE_URL}/analytics/activity?period=30d`);
    console.log('✅ Données d\'activité récupérées avec succès');
    console.log('   - Activité utilisateurs:', activityResponse.data.data.userActivity);
    console.log('   - Activité cours:', activityResponse.data.data.courseActivity);
    console.log('   - Revenus:', activityResponse.data.data.revenue);
    console.log('   - Engagement:', activityResponse.data.data.engagement);
    console.log('');

    // Test de la route de revenus
    console.log('3. Test de la route /analytics/revenue');
    const revenueResponse = await axios.get(`${API_BASE_URL}/analytics/revenue?period=12m`);
    console.log('✅ Données de revenus récupérées avec succès');
    console.log('   - Revenus actuels:', revenueResponse.data.data.currentMonth);
    console.log('   - Revenus YTD:', revenueResponse.data.data.yearToDate);
    console.log('   - Revenus mensuels:', revenueResponse.data.data.monthlyRevenue.length, 'mois');
    console.log('');

    // Test de la route de démographie
    console.log('4. Test de la route /analytics/users/demographics');
    const demographicsResponse = await axios.get(`${API_BASE_URL}/analytics/users/demographics`);
    console.log('✅ Données démographiques récupérées avec succès');
    console.log('   - Groupes d\'âge:', demographicsResponse.data.data.ageGroups.length, 'groupes');
    console.log('   - Localisations:', demographicsResponse.data.data.locations.length, 'pays');
    console.log('   - Types d\'appareils:', demographicsResponse.data.data.deviceTypes.length, 'types');
    console.log('   - Sources d\'inscription:', demographicsResponse.data.data.registrationSources.length, 'sources');
    console.log('');

    // Test de la route de performance des cours
    console.log('5. Test de la route /analytics/courses/performance');
    const coursePerformanceResponse = await axios.get(`${API_BASE_URL}/analytics/courses/performance`);
    console.log('✅ Données de performance des cours récupérées avec succès');
    console.log('   - Cours analysés:', coursePerformanceResponse.data.data.length, 'cours');
    console.log('   - Résumé:', coursePerformanceResponse.data.summary);
    console.log('');

    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('📊 Le dashboard est maintenant entièrement dynamique.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Assurez-vous que le serveur backend est démarré sur le port 5000');
      console.log('   Commande: cd backend && npm start');
    }
  }
}

// Fonction pour tester la création d'utilisateurs de test
async function createTestUsers() {
  console.log('\n👥 Création d\'utilisateurs de test...\n');

  const testUsers = [
    {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@test.com',
      password: 'password123',
      role: 'user'
    },
    {
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@test.com',
      password: 'password123',
      role: 'user'
    },
    {
      firstName: 'Pierre',
      lastName: 'Durand',
      email: 'pierre.durand@test.com',
      password: 'password123',
      role: 'user'
    },
    {
      firstName: 'Sophie',
      lastName: 'Leroy',
      email: 'sophie.leroy@test.com',
      password: 'password123',
      role: 'user'
    },
    {
      firstName: 'Admin',
      lastName: 'Test',
      email: 'admin.test@test.com',
      password: 'password123',
      role: 'admin'
    }
  ];

  for (const user of testUsers) {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/create`, user);
      console.log(`✅ Utilisateur créé: ${user.firstName} ${user.lastName} (${user.role})`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error?.includes('existe déjà')) {
        console.log(`⚠️  Utilisateur existe déjà: ${user.firstName} ${user.lastName}`);
      } else {
        console.log(`❌ Erreur création utilisateur ${user.firstName}:`, error.response?.data?.error || error.message);
      }
    }
  }
}

// Exécution des tests
async function runTests() {
  console.log('🚀 Démarrage des tests du dashboard dynamique\n');
  
  await createTestUsers();
  await testDashboardAPI();
  
  console.log('\n✨ Tests terminés !');
}

runTests().catch(console.error); 