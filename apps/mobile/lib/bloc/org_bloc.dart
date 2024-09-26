import 'dart:convert';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:maintrack/constants.dart';
import 'package:maintrack/models/org.dart';
import 'package:http/http.dart' as http;
part 'org_state.dart';
part 'org_event.dart';

class OrgBloc extends Bloc<OrgEvent, OrgState> {
  final String _baseUrl = Constants.getBaseUrl(); // replace with your API URL
  final storage = const FlutterSecureStorage();

  OrgBloc() : super(OrgInitial()) {
    on<OrgEvent>((event, emit) async {
      emit(Loading());
      if (event is OrgDetails) {
        print('Fetching org details...');
        Org? org = await _getOrgFromApi(id: event.orgId);
        print('Fetched org ID: ${org?.id}');
        emit(org != null
            ? OrgFetched(org: org)
            : OrgNotFound());
      }
      if (event is Initial || event is OrgList || event is OrgsRefresh) {
        print('Fetching orgs...');
        List<Org> orgs = await _getOrgsFromApi();
        print('Fetched ${orgs.length} orgs');
        emit(OrgsFetched(orgs: orgs));
      }
    });
  }

  Future<List<Org>> _getOrgsFromApi() async {
    String? accessToken = await storage.read(key: "credenciales");
    final response = await http.get(
      Uri.parse('$_baseUrl/orgs'),
      headers: <String, String>{'Authorization': "Bearer $accessToken" ?? ""},
    );
    if (response.statusCode == 200) {
      // If the server returns a 200 OK response, parse the JSON.
      Map<String, dynamic> map = json.decode(response.body);
      Iterable list = map['clients'];
      return list.map((model) => Org.fromJson(model)).toList();
    } else {
      // If the server returns an unsuccessful response code, throw an exception.
      throw Exception('Failed to load clients');
    }
  }

  Future<Org?> _getOrgFromApi({required String id}) async {
    String? accessToken = await storage.read(key: "credenciales");
    final response = await http.get(Uri.parse('$_baseUrl/p/orgs/$id'),
        headers: <String, String>{
          'Authorization': "Bearer $accessToken" ?? ""
        }); // replace '/clients' with your endpoint

    if (response.statusCode == 200) {
      // If the server returns a 200 OK response, parse the JSON.
      return Org.fromJson(json.decode(response.body));
    } else {
      // If the server returns an unsuccessful response code, throw an exception.
      throw Exception('Failed to load client');
    }
  }
}
