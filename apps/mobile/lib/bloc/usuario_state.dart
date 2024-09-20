part of 'usuario_bloc.dart';

abstract class UsuarioState extends Equatable {
  const UsuarioState();

  @override
  List<Object> get props => [];
}

class Loading extends UsuarioState {}

class UsuarioInitial extends UsuarioState {}

class UsuarioNotFound extends UsuarioState {}

class UsuariosFetched extends UsuarioState {
  const UsuariosFetched({required this.usuarios});

  final List<Usuario> usuarios;

  @override
  List<Object> get props => [usuarios];
}

class UsuarioFetched extends UsuarioState {
  const UsuarioFetched({required this.usuario});

  final Usuario usuario;

  @override
  List<Object> get props => [usuario];
}
