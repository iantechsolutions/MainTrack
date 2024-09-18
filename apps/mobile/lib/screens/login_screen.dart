import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:main_track/constants.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shadcn_ui/shadcn_ui.dart'; // Ensure this package is correctly imported
// ignore: depend_on_referenced_packages
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  LoginScreenState createState() => LoginScreenState();
}

class LoginScreenState extends State<LoginScreen> {
  String? token;
  final storage = const FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _checkPermission(); // Check for GPS permission on init
  }

  Future<void> _checkPermission() async {
    var status = await Permission.location.status;
    if (status.isGranted) {
      // Permission is granted, proceed as usual
    } else {
      // Request permission
      _requestPermission();
    }
  }

  Future<void> _requestPermission() async {
    var status = await Permission.location.request();
    if (!status.isGranted) {
      _showPermissionDeniedDialog();
    }
  }

  bool buttonPressed = false;
  void _showPermissionDeniedDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Permiso denegado'),
        content: const Text(
            'Acceso a la ubicacion es necesario para usar esta app.'),
        actions: [
          TextButton(
            onPressed: () => SystemNavigator.pop(),
            child: const Text('Salir'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: ThemeData(
        primaryColor: Colors.blue, // Set your theme colors here
        buttonTheme: ButtonThemeData(
          buttonColor: Colors.blue, // Default color for all buttons
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
          padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 30),
        ),
      ),
      child: MaterialApp(
        home: Scaffold(
          body: Center(
            child: SingleChildScrollView(
              child: Center(
                child: Container(
                  padding: const EdgeInsets.all(20),
                  child: token == null ? loginButton() : userActions(),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget loginButton() {
    return ShadButton.secondary(
      // Shadcn button component
      backgroundColor: Theme.of(context).colorScheme.primary,
      enabled: !buttonPressed,
      onPressed: () async {
        buttonPressed = true;

        final url = Constants.getBaseUrl() + '/signin';
        final Map bodyData = {'a': 'b'};

        final body = json.encode(bodyData);
        final response = await http.post(Uri.parse(url),
            body: body, headers: {"Content-Type": "application/json"});

        if (response.statusCode != 200) {
          setState(() {
            showDialog(
              context: context,
              builder: (context) => AlertDialog(
                title: const Text('Credenciales inválidas'),
                actions: [
                  TextButton(
                    onPressed: () => SystemNavigator.pop(),
                    child: const Text('Salir'),
                  ),
                ],
              ),
            );
          });
        } else {
          setState(() {
            token = response.body;
          });
        }

        buttonPressed = false;
      },
      // borderRadius: BorderRadius.circular(20.0),
      child: const Text("Ingresar",
          style: TextStyle(fontSize: 20, color: Colors.white)),
    );
  }

  Widget userActions() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // actionButton("Listado x", '/x'),
        logoutButton(),
      ],
    );
  }

  Widget actionButton(String text, String route) {
    return ShadButton.outline(
      // Using shadcn UI component
      onPressed: () {
        Navigator.pushNamed(context, route);
      },

      // borderRadius: BorderRadius.circular(15.0),
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 15),
      child: Text(
        text,
        style: const TextStyle(color: Colors.black),
      ),
    );
  }

  Widget logoutButton() {
    return ShadButton.destructive(
      onPressed: () async {
        // logout()
        await storage.delete(key: "credenciales");
        setState(() {
          token = null;
        });
      },
      // borderRadius: BorderRadius.circular(15.0),
      child: const Text("Cerrar sesion", style: TextStyle(fontSize: 20)),
    );
  }
}
