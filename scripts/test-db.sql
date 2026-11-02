-- Contrôles du schéma
do $$
declare c text; n int;
begin
  -- codes générés automatiquement et au bon format
  insert into households (display_name, seats) values ('Test auto', 2) returning code into c;
  assert c ~ '^[A-HJ-NP-Z2-9]{6}$', 'code mal formé: ' || c;

  -- réponse valide
  insert into rsvps (household_id, attending, guest_count, diet)
    select id, true, 3, 'vegetarian' from households where code = 'K7M4PQ';
  -- trop de personnes : refusé
  begin
    update rsvps set guest_count = 9 where household_id = (select id from households where code = 'K7M4PQ');
    raise exception 'aurait dû échouer (places)';
  exception when check_violation then null; end;
  -- absent avec des personnes : refusé
  begin
    insert into rsvps (household_id, attending, guest_count)
      select id, false, 1 from households where code = 'TR9X2D';
    raise exception 'aurait dû échouer (cohérence)';
  exception when check_violation then null; end;

  select count(*) into n from rsvp_log; assert n = 1, 'historique attendu: 1, obtenu ' || n;
  select guests_confirmed into n from table_occupancy where name = 'Hibiscus'; assert n = 3, 'occupation attendue: 3';
  select count(*) into n from guest_overview where status = 'pending'; assert n = 2, 'en attente attendus: 2';
end $$;

-- anon n'a accès à rien
set role anon;
do $$ begin
  perform 1 from households;
  raise exception 'anon ne devrait pas lire households';
exception when insufficient_privilege then null; end $$;
reset role;
