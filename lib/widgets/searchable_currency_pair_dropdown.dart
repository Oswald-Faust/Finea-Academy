import 'dart:async';
import 'package:flutter/material.dart';
import '../models/trading_data_model.dart';

class _SearchResult {
  final CurrencyPair pair;
  final int score;
  
  _SearchResult({required this.pair, required this.score});
}

class SearchableCurrencyPairDropdown extends StatefulWidget {
  final String label;
  final String? value;
  final ValueChanged<String?> onChanged;
  final List<CurrencyPair> currencyPairs;

  const SearchableCurrencyPairDropdown({
    super.key,
    required this.label,
    required this.value,
    required this.onChanged,
    required this.currencyPairs,
  });

  @override
  State<SearchableCurrencyPairDropdown> createState() => _SearchableCurrencyPairDropdownState();
}

class _SearchableCurrencyPairDropdownState extends State<SearchableCurrencyPairDropdown> {
  late TextEditingController _searchController;
  List<CurrencyPair> _filteredPairs = [];
  Timer? _debounceTimer;
  String _currentQuery = '';
  bool _isSearching = false;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
    _filteredPairs = List.from(widget.currencyPairs);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _currentQuery = query;
    _debounceTimer?.cancel();
    
    // Afficher l'indicateur de recherche immédiatement
    if (query.isNotEmpty) {
      setState(() {
        _isSearching = true;
      });
    }
    
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  void _performSearch(String query) {
    if (!mounted) return;
    
    setState(() {
      _isSearching = false;
      
      if (query.isEmpty) {
        _filteredPairs = List.from(widget.currencyPairs);
      } else {
        try {
          final lowerQuery = query.toLowerCase();
          final results = <_SearchResult>[];
          
          for (final pair in widget.currencyPairs) {
            int score = 0;
            
            // Score basé sur la correspondance exacte du symbole
            if (pair.symbol.toLowerCase() == lowerQuery) {
              score += 100;
            } else if (pair.symbol.toLowerCase().startsWith(lowerQuery)) {
              score += 80;
            } else if (pair.symbol.toLowerCase().contains(lowerQuery)) {
              score += 60;
            }
            
            // Score basé sur le nom
            if (pair.name.toLowerCase().contains(lowerQuery)) {
              score += 40;
            }
            
            // Score basé sur les devises
            if (pair.baseCurrency.toLowerCase().contains(lowerQuery)) {
              score += 20;
            }
            if (pair.quoteCurrency.toLowerCase().contains(lowerQuery)) {
              score += 20;
            }
            
            // Score basé sur le displayName
            if (pair.displayName.toLowerCase().contains(lowerQuery)) {
              score += 30;
            }
            
            if (score > 0) {
              results.add(_SearchResult(pair: pair, score: score));
            }
          }
          
          // Trier par score décroissant, puis par nom alphabétique
          results.sort((a, b) {
            if (a.score != b.score) {
              return b.score.compareTo(a.score);
            }
            return a.pair.name.compareTo(b.pair.name);
          });
          
          _filteredPairs = results.map((result) => result.pair).toList();
        } catch (e) {
          // En cas d'erreur, garder la liste actuelle
          print('Erreur lors du filtrage: $e');
          _filteredPairs = List.from(widget.currencyPairs);
        }
      }
    });
  }

  void _showSearchDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Dialog(
              backgroundColor: const Color(0xFF1a1a3a),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Container(
                width: MediaQuery.of(context).size.width * 0.9,
                height: MediaQuery.of(context).size.height * 0.7,
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // En-tête
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Rechercher ${widget.label.toLowerCase()}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Poppins',
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        IconButton(
                          onPressed: () => Navigator.pop(context),
                          icon: const Icon(Icons.close, color: Colors.white),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    
                    // Barre de recherche
                    TextField(
                      controller: _searchController,
                      onChanged: _onSearchChanged,
                      style: const TextStyle(
                        color: Colors.white,
                        fontFamily: 'Poppins',
                      ),
                      decoration: InputDecoration(
                        hintText: 'Rechercher par symbole, nom ou devise...',
                        hintStyle: TextStyle(
                          color: Colors.white.withOpacity(0.5),
                          fontFamily: 'Poppins',
                        ),
                        prefixIcon: const Icon(Icons.search, color: Colors.white70),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.1),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.white.withOpacity(0.2)),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: Colors.white.withOpacity(0.2)),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: const BorderSide(color: Color(0xFF000D64)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    
                    // Indicateur de recherche
                    if (_isSearching)
                      const Padding(
                        padding: EdgeInsets.all(16.0),
                        child: Center(
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF000D64)),
                          ),
                        ),
                      ),
                    
                    // Liste des paires filtrées
                    Expanded(
                      child: _filteredPairs.isEmpty && _currentQuery.isNotEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.search_off,
                                  color: Colors.white.withOpacity(0.5),
                                  size: 48,
                                ),
                                const SizedBox(height: 16),
                                Text(
                                  'Aucun résultat trouvé',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.7),
                                    fontSize: 16,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Essayez avec d\'autres mots-clés',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.5),
                                    fontSize: 14,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            itemCount: _filteredPairs.length,
                            itemBuilder: (context, index) {
                          // Protection contre les erreurs d'indexation
                          if (index >= _filteredPairs.length) {
                            return const SizedBox.shrink();
                          }
                          
                          final pair = _filteredPairs[index];
                          final isSelected = widget.value == pair.symbol;
                          
                          return Container(
                            margin: const EdgeInsets.only(bottom: 4),
                            decoration: BoxDecoration(
                              color: isSelected 
                                ? const Color(0xFF000D64).withOpacity(0.3)
                                : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: ListTile(
                              onTap: () {
                                widget.onChanged(pair.symbol);
                                Navigator.pop(context);
                              },
                              leading: Container(
                                width: 50,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: isSelected 
                                    ? const Color(0xFF000D64)
                                    : Colors.white.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Center(
                                  child: Text(
                                    pair.symbol,
                                    style: TextStyle(
                                      color: isSelected ? Colors.white : Colors.white70,
                                      fontSize: 10,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                ),
                              ),
                              title: Text(
                                pair.name,
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.white70,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Poppins',
                                ),
                              ),
                              subtitle: Text(
                                pair.baseCurrency == pair.quoteCurrency 
                                  ? pair.symbol
                                  : '${pair.baseCurrency}/${pair.quoteCurrency}',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                  fontSize: 14,
                                  fontFamily: 'Poppins',
                                ),
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    'Min: ${pair.minLotSize}',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.6),
                                      fontSize: 12,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                  Text(
                                    'Pip: ${pair.pipPosition}',
                                    style: TextStyle(
                                      color: Colors.white.withOpacity(0.6),
                                      fontSize: 12,
                                      fontFamily: 'Poppins',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedPair = widget.value != null 
      ? PopularCurrencyPairs.findBySymbol(widget.value!) 
      : null;
      
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 14,
            fontWeight: FontWeight.w500,
            fontFamily: 'Poppins',
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.white.withOpacity(0.2),
              width: 1,
            ),
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: _showSearchDialog,
              borderRadius: BorderRadius.circular(12),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                child: Row(
                  children: [
                    if (selectedPair != null) ...[
                      Expanded(
                        child: Center(
                          child: Container(
                            constraints: const BoxConstraints(
                              minWidth: 60,
                              maxWidth: 100,
                            ),
                            height: 40,
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF000D64), Color(0xFF1A237E)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              ),
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF000D64).withOpacity(0.3),
                                  blurRadius: 3,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                selectedPair.baseCurrency == selectedPair.quoteCurrency 
                                  ? selectedPair.symbol
                                  : '${selectedPair.baseCurrency}/${selectedPair.quoteCurrency}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Poppins',
                                ),
                                textAlign: TextAlign.center,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                    ] else ...[
                      Expanded(
                        child: Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.search, color: Colors.white70, size: 20),
                              ),
                              const SizedBox(width: 16),
                              Text(
                                'Sélectionner ${widget.label.toLowerCase()}',
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.7),
                                  fontSize: 16,
                                  fontFamily: 'Poppins',
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                    ],
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Icon(Icons.keyboard_arrow_down, color: Colors.white70, size: 20),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
