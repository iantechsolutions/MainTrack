import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:maintrack/bloc/usuario_bloc.dart';
import 'package:maintrack/utils.dart';
import 'package:shadcn_ui/shadcn_ui.dart';

class InstalacionsScreen extends StatefulWidget {
  const InstalacionsScreen({super.key});

  @override
  HomeScreenState createState() => HomeScreenState();
}

class HomeScreenState extends State<InstalacionsScreen> {
  @override
  void initState() {
    super.initState();
  }





@override
  Widget build(BuildContext context) {
    final recipesBloc = BlocProvider.of<UsuarioBloc>(context);
    recipesBloc.add(Initial());
    return Scaffold(
      appBar: AppBar(
        title: const Row(children: [Text("Listado Usuarios de la organizacion")]),
        foregroundColor: Colors.black,
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      ),
      backgroundColor: Theme.of(context).colorScheme.inversePrimary,
      body: BlocConsumer<UsuarioBloc, UsuarioState>(
        listener: (context, state) {},
        builder: (context, state) {
          if (state is UsuarioInitial || state is Loading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
          if (state is UsuariosFetched) {
            if (state.usuarios.isNotEmpty) {
              return ShadTable.list(
                  header: const [
                    ShadTableCell.header(
                        child: Text('ID',
                            style: TextStyle(color: Colors.black))),
                    // ShadTableCell.header(
                    //     child: Text('Fecha de alta',
                    //         style: TextStyle(color: Colors.black))),
                  ],
                  columnSpanExtent: (index) {
                    if (index == 0) return const FixedTableSpanExtent(150);
                    if (index == 1) {
                      return const MaxTableSpanExtent(
                        FixedTableSpanExtent(80),
                        RemainingTableSpanExtent(),
                      );
                    }
                    // uses the default value
                    return null;
                  },
                  children: state.usuarios.map((user) => [
                        ShadTableCell(
                            child: Text(user.id.toString(),
                                style: const TextStyle(
                                  color: Colors.black,
                                  fontWeight: FontWeight.w700,
                                ))),
                        // ShadTableCell(
                        //     child: Text(formatDate(user.fechaDeAlta),
                        //         style: const TextStyle(color: Colors.black)))
                      ]));
            } else {
              return Center(
                child: SizedBox(
                  width: 200,
                  child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pushNamed("/new-recipe");
                      },
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.restaurant),
                          SizedBox(
                            width: 8,
                          ),
                          Text("Add Instalacion")
                        ],
                      )),
                ),
              );
            }
          }
          return Center(
            child: SizedBox(
              width: 200,
              child: ElevatedButton(
                  onPressed: () {
                    recipesBloc.add(UsuariosRefresh());
                  },
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.refresh),
                      SizedBox(
                        width: 8,
                      ),
                      Text("Refresh!")
                    ],
                  )),
            ),
          );
        },
      ),
    );
  }

}