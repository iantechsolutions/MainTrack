part of 'usuario_bloc.dart';

abstract class UsuarioState extends Equatable {
  const UsuarioState();

  @override
  List<Object> get props => [];
}

class Loading extends UsuarioState {}

class UsuarioInitial extends UsuarioState {}

class UsuarioNotFound extends UsuarioState {}

class UsuarioFetched extends UsuarioState {
  const UsuarioFetched({required this.usuario});

  final Usuario usuario;

  @override
  List<Object> get props => [usuario];
}
