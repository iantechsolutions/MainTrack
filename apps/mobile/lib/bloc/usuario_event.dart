part of 'usuario_bloc.dart';

abstract class UsuarioEvent extends Equatable {
  const UsuarioEvent();

  @override
  List<Object> get props => [];
}

class Initial extends UsuarioEvent {}

class UsuarioDetails extends UsuarioEvent {
  const UsuarioDetails({required this.usuarioId});

  final String usuarioId;

  @override
  List<Object> get props => [usuarioId];
}


class UsuarioList extends UsuarioEvent {}

class UsuariosRefresh extends UsuarioEvent {}