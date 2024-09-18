import 'dart:convert';
import 'package:equatable/equatable.dart';

Usuario usuarioFromJson(String str) => Usuario.fromJson(json.decode(str));

class Usuario extends Equatable {
  final String id;

  const Usuario({
    required this.id,
  });

  factory Usuario.fromJson(Map<String, dynamic> json) => Usuario(
        id: json["Id"],
      );

  @override
  List<Object?> get props => [id];
}
