import 'dart:convert';
import 'package:equatable/equatable.dart';

Org OrgFromJson(String str) => Org.fromJson(json.decode(str));

class Org extends Equatable {
  final String id;
  final String nombre;

  const Org({
    required this.id,
    required this.nombre
  });

  factory Org.fromJson(Map<String, dynamic> json) => Org(
        id: json["Id"],
        nombre: json["Nombre"]
      );

  @override
  List<Object?> get props => [id,];
}
