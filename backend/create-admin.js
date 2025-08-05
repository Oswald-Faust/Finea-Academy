const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importer le modèle User
const User = require('./models/User');

// Configuration MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://faustfrank370:writer55FF@cluster0.km3u4wj.mongodb.net/finea_academie?retryWrites=true&w=majority&appName=Cluster0";

// Fonction pour créer un admin
const createAdmin = async () => {
  try {
    console.log('🔍 Connexion à MongoDB...');
    
    // Connexion à MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connecté à MongoDB');
    
    // Données de l'admin
    const adminData = {
      firstName: 'Admin',
      lastName: 'Finéa',
      email: 'admin@finea.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      phone: '+33123456789',
      address: {
        street: '123 Rue de l\'Académie',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          marketing: false
        },
        language: 'fr',
        theme: 'auto'
      }
    };
    
    console.log('🔍 Vérification si l\'admin existe déjà...');
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('⚠️  Un admin avec cet email existe déjà');
      console.log('ID:', existingAdmin._id);
      console.log('Role:', existingAdmin.role);
      console.log('Créé le:', existingAdmin.createdAt);
      
      // Option pour mettre à jour le role
      if (existingAdmin.role !== 'admin') {
        console.log('🔄 Mise à jour du role vers admin...');
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Role mis à jour vers admin');
      }
      
      return;
    }
    
    console.log('➕ Création du nouvel admin...');
    
    // Créer l'admin
    const admin = new User(adminData);
    await admin.save();
    
    console.log('✅ Admin créé avec succès !');
    console.log('📋 Détails de l\'admin :');
    console.log('- ID:', admin._id);
    console.log('- Nom:', admin.fullName);
    console.log('- Email:', admin.email);
    console.log('- Role:', admin.role);
    console.log('- Créé le:', admin.createdAt);
    
    // Générer un token JWT pour l'admin
    const token = admin.generateAuthToken();
    console.log('🔑 Token JWT généré:', token);
    
    console.log('\n🎉 Admin prêt à utiliser !');
    console.log('📧 Email: admin@finea.com');
    console.log('🔑 Mot de passe: Admin123!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
    
    if (error.code === 11000) {
      console.log('💡 Un utilisateur avec cet email existe déjà');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Connexion fermée');
  }
};

// Lancer la création de l'admin
console.log('🚀 Création de l\'administrateur Finéa Académie...\n');
createAdmin(); 