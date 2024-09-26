part of 'org_bloc.dart';

abstract class OrgEvent extends Equatable {
  const OrgEvent();

  @override
  List<Object> get props => [];
}

class Initial extends OrgEvent {}

class OrgDetails extends OrgEvent {
  const OrgDetails({required this.orgId});

  final String orgId;

  @override
  List<Object> get props => [orgId];
}


class OrgList extends OrgEvent {}

class OrgsRefresh extends OrgEvent {}