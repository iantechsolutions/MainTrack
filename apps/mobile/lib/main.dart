import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:maintrack/bloc/usuario_bloc.dart';
import 'package:maintrack/screens/login_screen.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<UsuarioBloc>(create: (context) => UsuarioBloc()),
      ], // Blocs
      child: ShadApp.material(
        theme: ShadThemeData(
            brightness: Brightness.dark,
            colorScheme: const ShadSlateColorScheme.light()),
        darkTheme: ShadThemeData(
            brightness: Brightness.dark,
            colorScheme: const ShadSlateColorScheme.light()),
        // theme: ThemeData(useMaterial3: true, colorScheme: ColorScheme.dark()),
        // Start the app with the LoginScreen
        initialRoute: '/',
        routes: {
          '/': (context) => const LoginScreen(),
        },
      ),
    );
  }
}
