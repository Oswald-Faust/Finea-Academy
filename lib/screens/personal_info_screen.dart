import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import '../models/user_model.dart';
import '../widgets/custom_bottom_navigation.dart';
import 'main_navigation_screen.dart';

class PersonalInfoScreen extends StatefulWidget {
  const PersonalInfoScreen({super.key});

  @override
  State<PersonalInfoScreen> createState() => _PersonalInfoScreenState();
}

class _PersonalInfoScreenState extends State<PersonalInfoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  
  final bool _isLoading = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  void _loadUserData() {
    final authService = Provider.of<AuthService>(context, listen: false);
    final user = authService.currentUser;
    
    if (user != null) {
      _firstNameController.text = user.firstName;
      _lastNameController.text = user.lastName;
      _emailController.text = user.email;
      _phoneController.text = user.phone ?? '';
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _saveChanges() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSaving = true);
      
      try {
        // TODO: Implémenter la mise à jour des informations utilisateur
        // Pour l'instant, on simule une sauvegarde
        await Future.delayed(const Duration(seconds: 2));
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Informations mises à jour avec succès'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erreur lors de la mise à jour: $e'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        if (mounted) {
          setState(() => _isSaving = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthService>(
      builder: (context, authService, child) {
        final user = authService.currentUser;
        
        return Scaffold(
          backgroundColor: const Color(0xFF0f0f23),
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            title: const Text(
              'Informations personnelles',
              style: TextStyle(
                color: Colors.white,
                fontSize: 20,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            centerTitle: true,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
          body: Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24.0),
                  child: FadeInUp(
                    duration: const Duration(milliseconds: 600),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 20),
                          
                          // Avatar section
                          Center(
                            child: Stack(
                              children: [
                                Container(
                                  width: 100,
                                  height: 100,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(color: Colors.white, width: 3),
                                    color: Colors.white.withOpacity(0.1),
                                  ),
                                  child: ClipOval(
                                    child: user?.avatar != null
                                        ? Image.network(
                                            user!.avatar!,
                                            fit: BoxFit.cover,
                                            errorBuilder: (context, error, stackTrace) {
                                              return Image.asset(
                                                'assets/images/logo_finea.png',
                                                fit: BoxFit.cover,
                                              );
                                            },
                                          )
                                        : Image.asset(
                                            'assets/images/logo_finea.png',
                                            fit: BoxFit.cover,
                                          ),
                                  ),
                                ),
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.camera_alt,
                                      color: Color(0xFF000D64),
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          
                          const SizedBox(height: 40),
                          
                          // Informations de base
                          const Text(
                            'Informations de base',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          
                          const SizedBox(height: 20),
                          
                          // Prénom et Nom
                          Row(
                            children: [
                              Expanded(
                                child: _buildTextField(
                                  controller: _firstNameController,
                                  label: 'Prénom',
                                  icon: Icons.person,
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: _buildTextField(
                                  controller: _lastNameController,
                                  label: 'Nom',
                                  icon: Icons.person_outline,
                                ),
                              ),
                            ],
                          ),
                          
                          const SizedBox(height: 16),
                          
                          // Email
                          _buildTextField(
                            controller: _emailController,
                            label: 'Email',
                            icon: Icons.email,
                            keyboardType: TextInputType.emailAddress,
                            enabled: false, // Email non modifiable
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Veuillez entrer votre email';
                              }
                              if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                                return 'Veuillez entrer un email valide';
                              }
                              return null;
                            },
                          ),
                          
                          const SizedBox(height: 16),
                          
                          // Téléphone
                          _buildTextField(
                            controller: _phoneController,
                            label: 'Téléphone (optionnel)',
                            icon: Icons.phone,
                            keyboardType: TextInputType.phone,
                          ),
                          
                          const SizedBox(height: 40),
                          
                          // Bouton de sauvegarde
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton(
                              onPressed: _isSaving ? null : _saveChanges,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: _isSaving
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                      ),
                                    )
                                  : const Text(
                                      'Sauvegarder',
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              
              // Barre de navigation en bas
              CustomBottomNavigation(
                currentIndex: 2, // Accueil est sélectionné par défaut
                onTap: (index) {
                  // Navigation vers les différentes pages
                  if (index != 2) { // Si ce n'est pas la page actuelle
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
      },
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    bool enabled = true,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white),
      enabled: enabled,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Colors.white.withOpacity(0.8)),
        prefixIcon: Icon(icon, color: Colors.white.withOpacity(0.8)),
        filled: true,
        fillColor: Colors.white.withOpacity(0.1),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.white, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red, width: 2),
        ),
      ),
      validator: validator ?? (value) {
        if (value == null || value.isEmpty) {
          return 'Ce champ est requis';
        }
        return null;
      },
    );
  }
} 