import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shadcn_ui/shadcn_ui.dart';
import 'package:maintrack/bloc/org_bloc.dart';

class OrgSwitcher extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return OrganizationSwitcher();
  }
}

class OrganizationSwitcher extends StatefulWidget {
  @override
  _OrganizationSwitcherState createState() => _OrganizationSwitcherState();
}

class _OrganizationSwitcherState extends State<OrganizationSwitcher> {
  String? _selectedOrganization;

  @override
  void initState() {
    super.initState();
  }
  
  
  void _onOrganizationChanged(String? newValue) {
    setState(() {
      _selectedOrganization = newValue;
    });
  }

  var searchValue = '';

  

  @override
  Widget build(BuildContext context) {
    final orgBloc = BlocProvider.of<OrgBloc>(context);
    orgBloc.add(OrgList());
    return Scaffold(
      appBar: AppBar(
        title: Text('Select Organization'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Selected Organization:',
              style: TextStyle(fontSize: 18),
            ),
            SizedBox(height: 8),
            Text(
              _selectedOrganization ?? 'None',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            BlocConsumer<OrgBloc, OrgState>(
              listener: (context, state) {},
              builder: (context, state) {
                if (state is Loading) {
                  return CircularProgressIndicator();
                } else if (state is OrgsFetched) {
                  final organizations = state.orgs;
                  return ShadSelect<String>(
                    placeholder: Text("Seleccione una organizacion"),
                    options: [
                    if (organizations.isEmpty)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child: Text('No se encontraron organizaciones'),
                      ),
                    ...organizations.map(
                      (org) {
                        return Offstage(
                          offstage: !organizations.contains(org),
                          child: ShadOption(
                            value: org.id,
                            child: Text(org.nombre),
                          ),
                        );
                      },
                    )
                  ],
                    selectedOptionBuilder: (context, selected) {
                      return Text(selected ?? 'Ninguna');
                    },
                    onChanged: _onOrganizationChanged,
                  );
                } else if (state is OrgNotFound) {
                  return Text('No se encontraron organizacion');
                } else {
                  return Text('Error al levantar las organizaciones');
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}