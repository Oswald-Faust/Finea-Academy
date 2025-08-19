class Contest {
  final String id;
  final String title;
  final String description;
  final String type;
  final bool isWeeklyContest;
  final int? weekNumber;
  final int? year;
  final String status;
  final DateTime startDate;
  final DateTime endDate;
  final DateTime drawDate;
  final bool autoDrawEnabled;
  final bool drawCompleted;
  final DateTime? drawCompletedAt;
  final int? maxParticipants;
  final int currentParticipants;
  final List<Participant> participants;
  final List<Winner> winners;
  final List<Prize> prizes;
  final String? rules;
  final Map<String, dynamic> eligibilityCriteria;
  final Map<String, dynamic> metadata;
  final String createdBy;
  final String? lastModifiedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Contest({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.isWeeklyContest,
    this.weekNumber,
    this.year,
    required this.status,
    required this.startDate,
    required this.endDate,
    required this.drawDate,
    required this.autoDrawEnabled,
    required this.drawCompleted,
    this.drawCompletedAt,
    this.maxParticipants,
    required this.currentParticipants,
    required this.participants,
    required this.winners,
    required this.prizes,
    this.rules,
    required this.eligibilityCriteria,
    required this.metadata,
    required this.createdBy,
    this.lastModifiedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Contest.fromJson(Map<String, dynamic> json) {
    return Contest(
      id: json['_id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      type: json['type'] ?? 'general',
      isWeeklyContest: json['isWeeklyContest'] ?? false,
      weekNumber: json['weekNumber'],
      year: json['year'],
      status: json['status'] ?? 'draft',
      startDate: DateTime.parse(json['startDate']),
      endDate: DateTime.parse(json['endDate']),
      drawDate: DateTime.parse(json['drawDate']),
      autoDrawEnabled: json['autoDrawEnabled'] ?? false,
      drawCompleted: json['drawCompleted'] ?? false,
      drawCompletedAt: json['drawCompletedAt'] != null 
          ? DateTime.parse(json['drawCompletedAt']) 
          : null,
      maxParticipants: json['maxParticipants'],
      currentParticipants: json['currentParticipants'] ?? 0,
      participants: (json['participants'] as List<dynamic>?)
          ?.map((p) => Participant.fromJson(p))
          .toList() ?? [],
      winners: (json['winners'] as List<dynamic>?)
          ?.map((w) => Winner.fromJson(w))
          .toList() ?? [],
      prizes: (json['prizes'] as List<dynamic>?)
          ?.map((p) => Prize.fromJson(p))
          .toList() ?? [],
      rules: json['rules'],
      eligibilityCriteria: json['eligibilityCriteria'] ?? {},
      metadata: json['metadata'] ?? {},
      createdBy: json['createdBy'] ?? '',
      lastModifiedBy: json['lastModifiedBy'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'title': title,
      'description': description,
      'type': type,
      'isWeeklyContest': isWeeklyContest,
      'weekNumber': weekNumber,
      'year': year,
      'status': status,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'drawDate': drawDate.toIso8601String(),
      'autoDrawEnabled': autoDrawEnabled,
      'drawCompleted': drawCompleted,
      'drawCompletedAt': drawCompletedAt?.toIso8601String(),
      'maxParticipants': maxParticipants,
      'currentParticipants': currentParticipants,
      'participants': participants.map((p) => p.toJson()).toList(),
      'winners': winners.map((w) => w.toJson()).toList(),
      'prizes': prizes.map((p) => p.toJson()).toList(),
      'rules': rules,
      'eligibilityCriteria': eligibilityCriteria,
      'metadata': metadata,
      'createdBy': createdBy,
      'lastModifiedBy': lastModifiedBy,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Getters utiles
  bool get isActive {
    final now = DateTime.now();
    return status == 'active' && 
           startDate.isBefore(now) && 
           endDate.isAfter(now);
  }

  bool get isOpenForRegistration {
    final now = DateTime.now();
    return status == 'active' && 
           startDate.isBefore(now) && 
           endDate.isAfter(now) &&
           (maxParticipants == null || currentParticipants < maxParticipants!);
  }

  bool get isDrawTime {
    final now = DateTime.now();
    return status == 'active' && 
           autoDrawEnabled && 
           !drawCompleted && 
           now.isAfter(drawDate);
  }

  int get daysUntilEnd {
    final now = DateTime.now();
    return endDate.difference(now).inDays;
  }

  int get daysUntilDraw {
    final now = DateTime.now();
    return drawDate.difference(now).inDays;
  }
}

class Participant {
  final String user;
  final DateTime joinedAt;
  final bool isWinner;
  final int? position;
  final String? prize;
  final String? notes;

  Participant({
    required this.user,
    required this.joinedAt,
    required this.isWinner,
    this.position,
    this.prize,
    this.notes,
  });

  factory Participant.fromJson(Map<String, dynamic> json) {
    return Participant(
      user: json['user'] is String ? json['user'] : json['user']['_id'] ?? '',
      joinedAt: DateTime.parse(json['joinedAt']),
      isWinner: json['isWinner'] ?? false,
      position: json['position'],
      prize: json['prize'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user,
      'joinedAt': joinedAt.toIso8601String(),
      'isWinner': isWinner,
      'position': position,
      'prize': prize,
      'notes': notes,
    };
  }
}

class Winner {
  final String user;
  final int position;
  final String prize;
  final DateTime selectedAt;
  final String? selectedBy;
  final String? notes;

  Winner({
    required this.user,
    required this.position,
    required this.prize,
    required this.selectedAt,
    this.selectedBy,
    this.notes,
  });

  factory Winner.fromJson(Map<String, dynamic> json) {
    return Winner(
      user: json['user'] is String ? json['user'] : json['user']['_id'] ?? '',
      position: json['position'],
      prize: json['prize'],
      selectedAt: DateTime.parse(json['selectedAt']),
      selectedBy: json['selectedBy'],
      notes: json['notes'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': user,
      'position': position,
      'prize': prize,
      'selectedAt': selectedAt.toIso8601String(),
      'selectedBy': selectedBy,
      'notes': notes,
    };
  }
}

class Prize {
  final int position;
  final String name;
  final String? description;
  final double? value;
  final String type;

  Prize({
    required this.position,
    required this.name,
    this.description,
    this.value,
    required this.type,
  });

  factory Prize.fromJson(Map<String, dynamic> json) {
    return Prize(
      position: json['position'],
      name: json['name'],
      description: json['description'],
      value: json['value']?.toDouble(),
      type: json['type'] ?? 'other',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'position': position,
      'name': name,
      'description': description,
      'value': value,
      'type': type,
    };
  }
}
