import { collectionType } from 'gql2sql';

export const trainer = collectionType({
  name: "Trainer",
  tableName: "trainer",
  definition(tt) {
    tt.nonNull
      .id('id');

    tt.nonNull
      .string('name');

    tt.nonNull
      .relation('id', 'trainer_to_pokemon', 'trainer_id')
      .relation('pokemon_id', 'pokemon', 'id')
      .collection('pokemons');
  }
});
