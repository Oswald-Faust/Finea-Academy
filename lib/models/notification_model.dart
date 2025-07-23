class NotificationModel {
  final String id;
  final String title;
  final String message;
  final String type;
  final String priority;
  final String status;
  final DateTime createdAt;
  final DateTime? sentAt;
  final DateTime? scheduledFor;
  final bool isGlobal;
  final List<String> targetUsers;
  final List<String> targetRoles;
  final List<String> targetSegments;
  final List<ReadBy> readBy;
  final Map<String, dynamic> metadata;
  final String? createdBy;
  final String? lastModifiedBy;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.priority,
    required this.status,
    required this.createdAt,
    this.sentAt,
    this.scheduledFor,
    this.isGlobal = false,
    this.targetUsers = const [],
    this.targetRoles = const [],
    this.targetSegments = const [],
    this.readBy = const [],
    this.metadata = const {},
    this.createdBy,
    this.lastModifiedBy,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'info',
      priority: json['priority'] ?? 'medium',
      status: json['status'] ?? 'draft',
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
      sentAt: json['sentAt'] != null 
          ? DateTime.parse(json['sentAt']) 
          : null,
      scheduledFor: json['scheduledFor'] != null 
          ? DateTime.parse(json['scheduledFor']) 
          : null,
      isGlobal: json['isGlobal'] ?? false,
      targetUsers: json['targetUsers'] != null 
          ? List<String>.from(json['targetUsers'].map((id) => id.toString()))
          : [],
      targetRoles: json['targetRoles'] != null 
          ? List<String>.from(json['targetRoles'])
          : [],
      targetSegments: json['targetSegments'] != null 
          ? List<String>.from(json['targetSegments'])
          : [],
      readBy: json['readBy'] != null 
          ? (json['readBy'] as List).map((read) => ReadBy.fromJson(read)).toList()
          : [],
      metadata: json['metadata'] ?? {},
      createdBy: json['createdBy']?.toString(),
      lastModifiedBy: json['lastModifiedBy']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'message': message,
      'type': type,
      'priority': priority,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'sentAt': sentAt?.toIso8601String(),
      'scheduledFor': scheduledFor?.toIso8601String(),
      'isGlobal': isGlobal,
      'targetUsers': targetUsers,
      'targetRoles': targetRoles,
      'targetSegments': targetSegments,
      'readBy': readBy.map((read) => read.toJson()).toList(),
      'metadata': metadata,
      'createdBy': createdBy,
      'lastModifiedBy': lastModifiedBy,
    };
  }

  bool isReadBy(String userId) {
    return readBy.any((read) => read.userId == userId);
  }

  NotificationModel copyWith({
    String? id,
    String? title,
    String? message,
    String? type,
    String? priority,
    String? status,
    DateTime? createdAt,
    DateTime? sentAt,
    DateTime? scheduledFor,
    bool? isGlobal,
    List<String>? targetUsers,
    List<String>? targetRoles,
    List<String>? targetSegments,
    List<ReadBy>? readBy,
    Map<String, dynamic>? metadata,
    String? createdBy,
    String? lastModifiedBy,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      title: title ?? this.title,
      message: message ?? this.message,
      type: type ?? this.type,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      sentAt: sentAt ?? this.sentAt,
      scheduledFor: scheduledFor ?? this.scheduledFor,
      isGlobal: isGlobal ?? this.isGlobal,
      targetUsers: targetUsers ?? this.targetUsers,
      targetRoles: targetRoles ?? this.targetRoles,
      targetSegments: targetSegments ?? this.targetSegments,
      readBy: readBy ?? this.readBy,
      metadata: metadata ?? this.metadata,
      createdBy: createdBy ?? this.createdBy,
      lastModifiedBy: lastModifiedBy ?? this.lastModifiedBy,
    );
  }
}

class ReadBy {
  final String userId;
  final DateTime readAt;

  ReadBy({
    required this.userId,
    required this.readAt,
  });

  factory ReadBy.fromJson(Map<String, dynamic> json) {
    return ReadBy(
      userId: json['user']?.toString() ?? '',
      readAt: json['readAt'] != null 
          ? DateTime.parse(json['readAt']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user': userId,
      'readAt': readAt.toIso8601String(),
    };
  }
} 