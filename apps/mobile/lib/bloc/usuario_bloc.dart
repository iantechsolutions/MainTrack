import 'dart:convert';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:maintrack/constants.dart';
import 'package:maintrack/models/usuario.dart';
import 'package:http/http.dart' as http;
part 'usuario_state.dart';
part 'usuario_event.dart';

class UsuarioBloc extends Bloc<UsuarioEvent, UsuarioState> {
  final String _baseUrl = Constants.getBaseUrl(); // replace with your API URL
  final storage = const FlutterSecureStorage();

  UsuarioBloc() : super(UsuarioInitial()) {
    on<UsuarioEvent>((event, emit) async {
      emit(Loading());
      if (event is UsuarioDetails) {
        print('Fetching usuario details...');
        Usuario? usuario = await _getUsuarioFromApi(id: event.usuarioId);
        print('Fetched usuario ID: ${usuario?.id}');
        emit(usuario != null
            ? UsuarioFetched(usuario: usuario)
            : UsuarioNotFound());
      }
      if (event is Initial || event is UsuarioList || event is UsuariosRefresh) {
        print('Fetching usuarios...');
        List<Usuario> usuarios = await _getUsuariosFromApi();
        print('Fetched ${usuarios.length} usuarios');
        emit(UsuariosFetched(usuarios: usuarios));
      }
    });
  }

  Future<List<Usuario>> _getUsuariosFromApi() async {
    String? accessToken = await storage.read(key: "credenciales");
    final response = await http.get(
      Uri.parse('$_baseUrl/usuarios'),
      headers: <String, String>{'Authorization': "Bearer $accessToken" ?? ""},
    );
    if (response.statusCode == 200) {
      // If the server returns a 200 OK response, parse the JSON.
      Map<String, dynamic> map = json.decode(response.body);
      Iterable list = map['clients'];
      return list.map((model) => Usuario.fromJson(model)).toList();
    } else {
      // If the server returns an unsuccessful response code, throw an exception.
      throw Exception('Failed to load clients');
    }
  }

  Future<Usuario?> _getUsuarioFromApi({required String id}) async {
    String? accessToken = await storage.read(key: "credenciales");
    final response = await http.get(Uri.parse('$_baseUrl/p/usuarios/$id'),
        headers: <String, String>{
          'Authorization': "Bearer $accessToken" ?? ""
        }); // replace '/clients' with your endpoint

    if (response.statusCode == 200) {
      // If the server returns a 200 OK response, parse the JSON.
      return Usuario.fromJson(json.decode(response.body));
    } else {
      // If the server returns an unsuccessful response code, throw an exception.
      throw Exception('Failed to load client');
    }
  }
}
