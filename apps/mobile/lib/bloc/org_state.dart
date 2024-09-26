part of 'org_bloc.dart';

abstract class OrgState extends Equatable {
  const OrgState();

  @override
  List<Object> get props => [];
}

class Loading extends OrgState {}

class OrgInitial extends OrgState {}

class OrgNotFound extends OrgState {}

class OrgsFetched extends OrgState {
  const OrgsFetched({required this.orgs});

  final List<Org> orgs;

  @override
  List<Object> get props => [orgs];
}

class OrgFetched extends OrgState {
  const OrgFetched({required this.org});

  final Org org;

  @override
  List<Object> get props => [org];
}
