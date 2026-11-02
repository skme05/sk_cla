-- Données d'exemple (à remplacer par les vraies) : tables, deux foyers de test, menu proposé
insert into public.seating_tables (name, capacity, pos_x, pos_y, sort_order) values
  ('Hibiscus', 10, 70, 70, 1), ('Cocotier', 10, 160, 62, 2), ('Frangipanier', 10, 250, 70, 3),
  ('Corail', 10, 70, 138, 4), ('Mangrove', 10, 160, 130, 5), ('Alizé', 10, 250, 138, 6);

insert into public.households (code, display_name, phone, seats, table_id) values
  ('K7M4PQ', 'Famille Ilunga', '+2250700000001', 4, (select id from public.seating_tables where name = 'Hibiscus')),
  ('TR9X2D', 'Esther Kabila',  '+2250700000002', 1, (select id from public.seating_tables where name = 'Corail'));

insert into public.menu_items (course, name, description, tags, sort_order) values
  ('cocktail', 'Alloco & brochettes', 'Bananes plantains frites, brochettes de bœuf et poivrons grillés', '{Épicé}', 1),
  ('cocktail', 'Accras de poisson', 'Beignets de poisson au citron vert, sauce pimentée maison', '{}', 2),
  ('starter',  'Salade avocat-crevettes', 'Avocat, crevettes grillées, jeunes pousses, vinaigrette passion', '{}', 1),
  ('main',     'Poisson braisé & attiéké', 'Capitaine braisé au feu de bois, attiéké, oignons et tomates', '{Spécialité}', 1),
  ('main',     'Kedjenou de poulet', 'Poulet mijoté à l''étouffée dans le canari, aux légumes', '{Sans porc}', 2),
  ('dessert',  'Gâteau des mariés', 'Trois étages, vanille et coco, fleurs d''hibiscus', '{}', 1),
  ('dessert',  'Fruits tropicaux', 'Mangue, ananas, fruit de la passion et menthe fraîche', '{Végétarien}', 2),
  ('drinks',   'Bar tropical', 'Bissap, gnamankoudji, eau de coco, champagne', '{Sans alcool possible}', 1);
