enum ShipmentStatus {
  planned,
  booked,
  inTransit,
  arrived,
  delivered,
  cancelled,
}

class ShipmentModel {
  final String id;
  final String tenantId;
  final String? buyerId;
  final String shipmentId;
  final ShipmentStatus status;
  final String originCountry;
  final String destinationCountry;
  final String? containerNumber;
  final String? vesselName;
  final DateTime? departureDate;
  final DateTime? estimatedArrival;
  final DateTime? actualArrival;
  final String? billOfLading;
  final String? shippingLine;
  final String? portOfLoading;
  final String? portOfDischarge;
  final double? weightKg;
  final List<ShipmentUpdate>? trackingUpdates;
  final List<IoTSensorReading>? sensorReadings;
  final List<String>? documents;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const ShipmentModel({
    required this.id,
    required this.tenantId,
    this.buyerId,
    required this.shipmentId,
    required this.status,
    required this.originCountry,
    required this.destinationCountry,
    this.containerNumber,
    this.vesselName,
    this.departureDate,
    this.estimatedArrival,
    this.actualArrival,
    this.billOfLading,
    this.shippingLine,
    this.portOfLoading,
    this.portOfDischarge,
    this.weightKg,
    this.trackingUpdates,
    this.sensorReadings,
    this.documents,
    this.createdAt,
    this.updatedAt,
  });

  factory ShipmentModel.fromJson(Map<String, dynamic> json) {
    return ShipmentModel(
      id: json['id'] as String? ?? '',
      tenantId: json['tenantId'] as String? ?? '',
      buyerId: json['buyerId'] as String?,
      shipmentId: json['shipmentId'] as String? ?? '',
      status: _parseShipmentStatus(json['status'] as String?),
      originCountry: json['originCountry'] as String? ?? '',
      destinationCountry: json['destinationCountry'] as String? ?? '',
      containerNumber: json['containerNumber'] as String?,
      vesselName: json['vesselName'] as String?,
      departureDate: json['departureDate'] != null
          ? DateTime.tryParse(json['departureDate'].toString())
          : null,
      estimatedArrival: json['estimatedArrival'] != null
          ? DateTime.tryParse(json['estimatedArrival'].toString())
          : null,
      actualArrival: json['actualArrival'] != null
          ? DateTime.tryParse(json['actualArrival'].toString())
          : null,
      billOfLading: json['billOfLading'] as String?,
      shippingLine: json['shippingLine'] as String?,
      portOfLoading: json['portOfLoading'] as String?,
      portOfDischarge: json['portOfDischarge'] as String?,
      weightKg: (json['weightKg'] as num?)?.toDouble(),
      trackingUpdates: (json['trackingUpdates'] as List?)
          ?.map((e) => ShipmentUpdate.fromJson(e as Map<String, dynamic>))
          .toList(),
      sensorReadings: (json['sensorReadings'] as List?)
          ?.map((e) => IoTSensorReading.fromJson(e as Map<String, dynamic>))
          .toList(),
      documents: (json['documents'] as List?)
          ?.map((e) => e.toString())
          .toList(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'tenantId': tenantId,
        'buyerId': buyerId,
        'shipmentId': shipmentId,
        'status': status.name,
        'originCountry': originCountry,
        'destinationCountry': destinationCountry,
        'containerNumber': containerNumber,
        'vesselName': vesselName,
        'departureDate': departureDate?.toIso8601String(),
        'estimatedArrival': estimatedArrival?.toIso8601String(),
        'actualArrival': actualArrival?.toIso8601String(),
        'billOfLading': billOfLading,
        'shippingLine': shippingLine,
        'portOfLoading': portOfLoading,
        'portOfDischarge': portOfDischarge,
        'weightKg': weightKg,
        'trackingUpdates': trackingUpdates?.map((e) => e.toJson()).toList(),
        'sensorReadings': sensorReadings?.map((e) => e.toJson()).toList(),
        'documents': documents,
        'createdAt': createdAt?.toIso8601String(),
        'updatedAt': updatedAt?.toIso8601String(),
      };

  static ShipmentStatus _parseShipmentStatus(String? value) {
    switch (value?.toLowerCase()) {
      case 'planned':
        return ShipmentStatus.planned;
      case 'booked':
        return ShipmentStatus.booked;
      case 'in_transit':
        return ShipmentStatus.inTransit;
      case 'arrived':
        return ShipmentStatus.arrived;
      case 'delivered':
        return ShipmentStatus.delivered;
      case 'cancelled':
        return ShipmentStatus.cancelled;
      default:
        return ShipmentStatus.planned;
    }
  }

  String get statusLabel {
    switch (status) {
      case ShipmentStatus.planned:
        return 'Planned';
      case ShipmentStatus.booked:
        return 'Booked';
      case ShipmentStatus.inTransit:
        return 'In Transit';
      case ShipmentStatus.arrived:
        return 'Arrived';
      case ShipmentStatus.delivered:
        return 'Delivered';
      case ShipmentStatus.cancelled:
        return 'Cancelled';
    }
  }

  String get route => '$originCountry → $destinationCountry';

  bool get isInProgress =>
      status == ShipmentStatus.booked ||
      status == ShipmentStatus.inTransit ||
      status == ShipmentStatus.arrived;

  int get progressPercentage {
    switch (status) {
      case ShipmentStatus.planned:
        return 0;
      case ShipmentStatus.booked:
        return 20;
      case ShipmentStatus.inTransit:
        return 50;
      case ShipmentStatus.arrived:
        return 75;
      case ShipmentStatus.delivered:
        return 100;
      case ShipmentStatus.cancelled:
        return 0;
    }
  }
}

class ShipmentUpdate {
  final String id;
  final String status;
  final String? location;
  final String? description;
  final DateTime timestamp;

  const ShipmentUpdate({
    required this.id,
    required this.status,
    this.location,
    this.description,
    required this.timestamp,
  });

  factory ShipmentUpdate.fromJson(Map<String, dynamic> json) {
    return ShipmentUpdate(
      id: json['id'] as String? ?? '',
      status: json['status'] as String? ?? '',
      location: json['location'] as String?,
      description: json['description'] as String?,
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'status': status,
        'location': location,
        'description': description,
        'timestamp': timestamp.toIso8601String(),
      };
}

class IoTSensorReading {
  final String id;
  final double? temperature;
  final double? humidity;
  final double? co2Level;
  final DateTime timestamp;

  const IoTSensorReading({
    required this.id,
    this.temperature,
    this.humidity,
    this.co2Level,
    required this.timestamp,
  });

  factory IoTSensorReading.fromJson(Map<String, dynamic> json) {
    return IoTSensorReading(
      id: json['id'] as String? ?? '',
      temperature: (json['temperature'] as num?)?.toDouble(),
      humidity: (json['humidity'] as num?)?.toDouble(),
      co2Level: (json['co2Level'] as num?)?.toDouble(),
      timestamp: json['timestamp'] != null
          ? DateTime.tryParse(json['timestamp'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'temperature': temperature,
        'humidity': humidity,
        'co2Level': co2Level,
        'timestamp': timestamp.toIso8601String(),
      };
}
