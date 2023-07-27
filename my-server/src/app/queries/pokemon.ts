import { collectionType } from 'gql2sql';

export const pokemon = collectionType({
  name: "Pokemon",
  tableName: "pokemon",
  definition(tt) {
    tt.nonNull
      .id('id');

    tt.nonNull
      .string('name');

    tt.nonNull
      .int('hp');

    tt.nonNull
      .int('attack');

    tt.nonNull
      .int('defense');

    tt.nonNull
      .alias('special_attack')
      .int('specialAttack');

    tt.nonNull
      .alias('special_defense')
      .int('specialDefense');

    tt.nonNull
      .int('speed');
  }
});