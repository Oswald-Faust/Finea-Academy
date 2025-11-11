import 'package:flutter/material.dart';
import '../models/economic_event.dart';
import '../services/economic_calendar_service.dart';

class EconomicCalendarScreen extends StatefulWidget {
  const EconomicCalendarScreen({Key? key}) : super(key: key);

  @override
  State<EconomicCalendarScreen> createState() => _EconomicCalendarScreenState();
}

class _EconomicCalendarScreenState extends State<EconomicCalendarScreen> {
  final EconomicCalendarService _calendarService = EconomicCalendarService();
  
  List<EconomicEvent> _events = [];
  List<EconomicEvent> _filteredEvents = [];
  EconomicCalendarSummary? _summary;
  bool _isLoading = true;
  String _errorMessage = '';
  
  // Filtres multiples
  Set<String> _selectedImpacts = {};
  Set<String> _selectedCurrencies = {};
  
  final List<String> _availableCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'];
  final List<String> _impactLevels = ['high', 'medium', 'low'];

  @override
  void initState() {
    super.initState();
    _loadCalendarData();
  }

  Future<void> _loadCalendarData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final events = await _calendarService.getCalendarEvents();
      final summary = await _calendarService.getTodaySummary();
      
      setState(() {
        _events = events;
        _filteredEvents = events;
        _summary = summary;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }


  void _applyFilters() {
    setState(() {
      _filteredEvents = _events.where((event) {
        // Si aucun filtre d'impact n'est sélectionné, on affiche tous les impacts
        bool matchesImpact = _selectedImpacts.isEmpty || 
            _selectedImpacts.contains(event.impact.toLowerCase());
        
        // Si aucune devise n'est sélectionnée, on affiche toutes les devises
        bool matchesCurrency = _selectedCurrencies.isEmpty || 
            _selectedCurrencies.contains(event.currency);
        
        return matchesImpact && matchesCurrency;
      }).toList();
    });
  }

  Color _getImpactColor(String impact) {
    switch (impact.toLowerCase()) {
      case 'high':
        return const Color(0xFFFF5252);
      case 'medium':
        return const Color(0xFFFFA726);
      case 'low':
        return const Color(0xFFFFD54F);
      default:
        return Colors.grey;
    }
  }

  IconData _getImpactIcon(String impact) {
    switch (impact.toLowerCase()) {
      case 'high':
        return Icons.trending_up;
      case 'medium':
        return Icons.show_chart;
      case 'low':
        return Icons.trending_flat;
      default:
        return Icons.info_outline;
    }
  }

  Widget _buildSummaryCard() {
    if (_summary == null) return const SizedBox.shrink();

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF000D64), Color(0xFF001B99)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Résumé du jour',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildSummaryItem('Total', _summary!.total.toString(), Icons.calendar_today),
              _buildSummaryItem('Fort', _summary!.highImpact.toString(), Icons.trending_up, color: const Color(0xFFFF5252)),
              _buildSummaryItem('Moyen', _summary!.mediumImpact.toString(), Icons.show_chart, color: const Color(0xFFFFA726)),
              _buildSummaryItem('Faible', _summary!.lowImpact.toString(), Icons.trending_flat, color: const Color(0xFFFFD54F)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, IconData icon, {Color? color}) {
    return Column(
      children: [
        Icon(icon, color: color ?? Colors.white, size: 24),
        const SizedBox(height: 6),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 11,
          ),
        ),
      ],
    );
  }

  Widget _buildFilters() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        border: Border(
          bottom: BorderSide(color: Colors.grey[300]!),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Filtres',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: Color(0xFF000D64),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Impact',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    const SizedBox(height: 4),
                    InkWell(
                      onTap: _showImpactFilterDialog,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                _selectedImpacts.isEmpty
                                    ? 'Tous'
                                    : _selectedImpacts.length == 3
                                        ? 'Tous'
                                        : _selectedImpacts.map((i) => 
                                            i == 'high' ? 'Fort' : i == 'medium' ? 'Moyen' : 'Faible'
                                          ).join(', '),
                                style: const TextStyle(fontSize: 14),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Icon(Icons.arrow_drop_down, color: Colors.grey[600]),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Devise',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    const SizedBox(height: 4),
                    InkWell(
                      onTap: _showCurrencyFilterDialog,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                _selectedCurrencies.isEmpty
                                    ? 'Toutes'
                                    : _selectedCurrencies.length > 2
                                        ? '${_selectedCurrencies.length} sélectionnées'
                                        : _selectedCurrencies.join(', '),
                                style: const TextStyle(fontSize: 14),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            Icon(Icons.arrow_drop_down, color: Colors.grey[600]),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showImpactFilterDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text(
                'Sélectionner les impacts',
                style: TextStyle(
                  color: Color(0xFF000D64),
                  fontWeight: FontWeight.bold,
                ),
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: _impactLevels.map((impact) {
                  final isSelected = _selectedImpacts.contains(impact);
                  final color = _getImpactColor(impact);
                  final label = impact == 'high' ? 'Fort' : impact == 'medium' ? 'Moyen' : 'Faible';
                  
                  return CheckboxListTile(
                    title: Row(
                      children: [
                        Icon(_getImpactIcon(impact), color: color, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          label,
                          style: TextStyle(
                            color: color,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    value: isSelected,
                    activeColor: color,
                    onChanged: (bool? value) {
                      setDialogState(() {
                        if (value == true) {
                          _selectedImpacts.add(impact);
                        } else {
                          _selectedImpacts.remove(impact);
                        }
                      });
                      setState(() {
                        _applyFilters();
                      });
                    },
                  );
                }).toList(),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    setState(() {
                      _selectedImpacts.clear();
                      _applyFilters();
                    });
                    Navigator.of(context).pop();
                  },
                  child: const Text('Effacer'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Fermer'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _showCurrencyFilterDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text(
                'Sélectionner les devises',
                style: TextStyle(
                  color: Color(0xFF000D64),
                  fontWeight: FontWeight.bold,
                ),
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: _availableCurrencies.map((currency) {
                    final isSelected = _selectedCurrencies.contains(currency);
                    
                    return CheckboxListTile(
                      title: Text(
                        currency,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF000D64),
                        ),
                      ),
                      value: isSelected,
                      activeColor: const Color(0xFF000D64),
                      onChanged: (bool? value) {
                        setDialogState(() {
                          if (value == true) {
                            _selectedCurrencies.add(currency);
                          } else {
                            _selectedCurrencies.remove(currency);
                          }
                        });
                        setState(() {
                          _applyFilters();
                        });
                      },
                    );
                  }).toList(),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    setState(() {
                      _selectedCurrencies.clear();
                      _applyFilters();
                    });
                    Navigator.of(context).pop();
                  },
                  child: const Text('Effacer'),
                ),
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Fermer'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildEventCard(EconomicEvent event) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _showEventDetails(event),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    // Badge d'impact
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: _getImpactColor(event.impact).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        _getImpactIcon(event.impact),
                        color: _getImpactColor(event.impact),
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF000D64).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  event.currency,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF000D64),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                event.time,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            event.event,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF000D64),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (event.hasForecast || event.hasActualData) ...[
                  const SizedBox(height: 12),
                  const Divider(height: 1),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildDataPoint('Précédent', event.previous, Colors.grey),
                      _buildDataPoint('Prévision', event.forecast, const Color(0xFF000D64)),
                      _buildDataPoint('Actuel', event.actual, const Color(0xFF27AE60)),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDataPoint(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey[600],
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: value == '-' ? Colors.grey : color,
          ),
        ),
      ],
    );
  }

  void _showEventDetails(EconomicEvent event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
        ),
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                Container(
                  width: 50,
                  height: 50,
                  decoration: BoxDecoration(
                    color: _getImpactColor(event.impact).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    _getImpactIcon(event.impact),
                    color: _getImpactColor(event.impact),
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        event.event,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF000D64),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${event.date} • ${event.time}',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            _buildDetailRow('Devise', event.currency),
            _buildDetailRow('Impact', event.impactLabel),
            _buildDetailRow('Valeur précédente', event.previous),
            _buildDetailRow('Prévision', event.forecast),
            _buildDetailRow('Valeur actuelle', event.actual),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[700],
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Color(0xFF000D64),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Calendrier Économique',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: const Color(0xFF000D64),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadCalendarData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF000D64)),
              ),
            )
          : _errorMessage.isNotEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red[300],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Erreur de chargement',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[800],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          _errorMessage,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton.icon(
                          onPressed: _loadCalendarData,
                          icon: const Icon(Icons.refresh),
                          label: const Text('Réessayer'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF000D64),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 24,
                              vertical: 12,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : Column(
                  children: [
                    _buildSummaryCard(),
                    _buildFilters(),
                    Expanded(
                      child: _filteredEvents.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.event_busy,
                                    size: 64,
                                    color: Colors.grey[400],
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'Aucun événement trouvé',
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : RefreshIndicator(
                              onRefresh: _loadCalendarData,
                              color: const Color(0xFF000D64),
                              child: ListView.builder(
                                padding: const EdgeInsets.only(
                                  top: 8,
                                  bottom: 24,
                                ),
                                itemCount: _filteredEvents.length,
                                itemBuilder: (context, index) {
                                  return _buildEventCard(_filteredEvents[index]);
                                },
                              ),
                            ),
                    ),
                  ],
                ),
    );
  }
}

