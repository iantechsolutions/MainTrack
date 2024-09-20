import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:maintrack/constants.dart';
import 'package:shadcn_ui/shadcn_ui.dart'; // Ensure this package is correctly imported
// ignore: depend_on_referenced_packages
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class StartScreen extends StatefulWidget {
  const StartScreen({super.key});

  @override
  StartScreenState createState() => StartScreenState();
}

class StartScreenState extends State<StartScreen> {
  String? token;
  final storage = const FlutterSecureStorage();
  bool buttonPressed = false;
  @override
  void initState() {
    super.initState();
    // _checkPermission(); // Check for GPS permission on init
  }
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
                  // child: token == null ? loginButton() : userActions(),
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
  Widget registerButton() {
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
}