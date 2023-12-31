/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */







declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
}

export interface NexusGenEnums {
  SortOp: "asc" | "desc"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  ArrayAggregation: {};
  FloatAggregation: { // root type
    avg?: number | null; // Float
    max?: number | null; // Float
    min?: number | null; // Float
    sum?: number | null; // Float
  }
  IntegerAggregation: { // root type
    avg?: number | null; // Float
    max?: number | null; // Int
    min?: number | null; // Int
    sum?: number | null; // Int
  }
  Pokemon: { // root type
    attack: number; // Int!
    defense: number; // Int!
    hp: number; // Int!
    id: string; // ID!
    name: string; // String!
    specialAttack: number; // Int!
    specialDefense: number; // Int!
    speed: number; // Int!
  }
  PokemonSummary: {};
  Pokemons: {};
  Query: {};
  StringAggregation: { // root type
    max?: string | null; // String
    min?: string | null; // String
  }
  Trainer: { // root type
    id: string; // ID!
    name: string; // String!
  }
  TrainerSummary: {};
  Trainers: {};
}

export interface NexusGenInterfaces {
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  ArrayAggregation: { // field return type
    count: number; // Int!
  }
  FloatAggregation: { // field return type
    avg: number | null; // Float
    count: number; // Int!
    max: number | null; // Float
    min: number | null; // Float
    sum: number | null; // Float
  }
  IntegerAggregation: { // field return type
    avg: number | null; // Float
    count: number; // Int!
    max: number | null; // Int
    min: number | null; // Int
    sum: number | null; // Int
  }
  Pokemon: { // field return type
    attack: number; // Int!
    defense: number; // Int!
    hp: number; // Int!
    id: string; // ID!
    name: string; // String!
    specialAttack: number; // Int!
    specialDefense: number; // Int!
    speed: number; // Int!
  }
  PokemonSummary: { // field return type
    total: NexusGenRootTypes['ArrayAggregation']; // ArrayAggregation!
  }
  Pokemons: { // field return type
    details: NexusGenRootTypes['Pokemon'][]; // [Pokemon!]!
    summary: NexusGenRootTypes['PokemonSummary']; // PokemonSummary!
  }
  Query: { // field return type
    pokemons: NexusGenRootTypes['Pokemons']; // Pokemons!
    trainers: NexusGenRootTypes['Trainers']; // Trainers!
  }
  StringAggregation: { // field return type
    count: number; // Int!
    max: string | null; // String
    min: string | null; // String
  }
  Trainer: { // field return type
    id: string; // ID!
    name: string; // String!
    pokemons: NexusGenRootTypes['Pokemons']; // Pokemons!
  }
  TrainerSummary: { // field return type
    total: NexusGenRootTypes['ArrayAggregation']; // ArrayAggregation!
  }
  Trainers: { // field return type
    details: NexusGenRootTypes['Trainer'][]; // [Trainer!]!
    summary: NexusGenRootTypes['TrainerSummary']; // TrainerSummary!
  }
}

export interface NexusGenFieldTypeNames {
  ArrayAggregation: { // field return type name
    count: 'Int'
  }
  FloatAggregation: { // field return type name
    avg: 'Float'
    count: 'Int'
    max: 'Float'
    min: 'Float'
    sum: 'Float'
  }
  IntegerAggregation: { // field return type name
    avg: 'Float'
    count: 'Int'
    max: 'Int'
    min: 'Int'
    sum: 'Int'
  }
  Pokemon: { // field return type name
    attack: 'Int'
    defense: 'Int'
    hp: 'Int'
    id: 'ID'
    name: 'String'
    specialAttack: 'Int'
    specialDefense: 'Int'
    speed: 'Int'
  }
  PokemonSummary: { // field return type name
    total: 'ArrayAggregation'
  }
  Pokemons: { // field return type name
    details: 'Pokemon'
    summary: 'PokemonSummary'
  }
  Query: { // field return type name
    pokemons: 'Pokemons'
    trainers: 'Trainers'
  }
  StringAggregation: { // field return type name
    count: 'Int'
    max: 'String'
    min: 'String'
  }
  Trainer: { // field return type name
    id: 'ID'
    name: 'String'
    pokemons: 'Pokemons'
  }
  TrainerSummary: { // field return type name
    total: 'ArrayAggregation'
  }
  Trainers: { // field return type name
    details: 'Trainer'
    summary: 'TrainerSummary'
  }
}

export interface NexusGenArgTypes {
  Pokemon: {
    attack: { // args
      eq?: number | null; // Int
      gt?: number | null; // Int
      gteq?: number | null; // Int
      in?: Array<number | null> | null; // [Int]
      isNull?: boolean | null; // Boolean
      lt?: number | null; // Int
      lteq?: number | null; // Int
      neq?: number | null; // Int
      notIn?: Array<number | null> | null; // [Int]
      opt?: boolean | null; // Boolean
      sort?: NexusGenEnums['SortOp'] | null; // SortOp
    }
    defense: { // args
      eq?: number | null; // Int
      gt?: number | null; // Int
      gteq?: number | null; // Int
      in?: Array<number | null> | null; // [Int]
      isNull?: boolean | null; // Boolean
      lt?: number | null; // Int
      lteq?: number | null; // Int
      neq?: number | null; // Int
      notIn?: Array<number | null> | null; // [Int]
      opt?: boolean | null; // Boolean
      sort?: NexusGenEnums['SortOp'] | null; // SortOp
    }
    hp: { // args
      eq?: number | null; // Int
      gt?: number | null; // Int
      gteq?: number | null; // Int
      in?: Array<number | null> | null; // [Int]
      isNull?: boolean | null; // Boolean
      lt?: number | null; // Int
      lteq?: number | null; // Int
      neq?: number | null; // Int
      notIn?: Array<number | null> | null; // [Int]
      opt?: boolean | null; // Boolean
      sort?: NexusGenEnums['SortOp'] | null; // SortOp
    }
    id: { // args
      eq?: string | null; // ID
      in?: Array<string | null> | null; // [ID]
      isNull?: boolean | null; // Boolean
      neq?: string | null; // ID
      notIn?: Array<string | null> | null; // [ID]
      opt?: boolean | null; // Boolean
    }
    name: { // args
      eq?: string | null; // String
      in?: Array<string | null> | null; // [String]
      isNull?: boolean | null; // Boolean
      neq?: string | null; // String
      notIn?: Array<string | null> | null; // [String]
      opt?: boolean | null; // Boolean
      sort?: NexusGenEnums['SortOp'] | null; // SortOp
    }
    specialAttack: { // args
      eq?: number | null; // Int
      gt?: number | null; // Int
      gteq?: number | null; // Int
      in?: Array<number | null> | null; // [Int]
      isNull?: boolean | null; // Boolean
      lt?: number | null; // Int
      lteq?: number | null; // Int
      neq?: number | null; // Int
      notIn?: Array<number | null> | null; // [Int]
      opt?: boolean | null; // Boolean
      sort?: NexusGenEnums['SortOp'] | null; // SortOp
    }
    specialDefense: { // args
      eq?: number | null; // Int
      gt?: number | null; // Int
      gteq?: number | null; // Int
      in?: Array<number | null> | null; // [Int]
      isNull?: boolean | null; // Boolean
      lt?: number | null; // Int
      lteq?: number | null; // Int
      neq?: number | null; // Int
      notIn?: Array<number | null> | null; // [Int]
      opt?: boolean | null; // Boolean
      sort?: NexusGenEnums['SortOp'] | null; // SortOp
    }
    speed: { // args
      eq?: number | null; // Int
      gt?: number | null; // Int
      gteq?: number | null; // Int
      in?: Array<number | null> | null; // [Int]
      isNull?: boolean | null; // Boolean
      lt?: number | null; // Int
      lteq?: number | null; // Int
      neq?: number | null; // Int
      notIn?: Array<number | null> | null; // [Int]
      opt?: boolean | null; // Boolean
      sort?: NexusGenEnums['SortOp'] | null; // SortOp
    }
  }
  Query: {
    pokemons: { // args
      limit?: number | null; // Int
      offset?: number | null; // Int
    }
    trainers: { // args
      limit?: number | null; // Int
      offset?: number | null; // Int
    }
  }
  Trainer: {
    id: { // args
      eq?: string | null; // ID
      in?: Array<string | null> | null; // [ID]
      isNull?: boolean | null; // Boolean
      neq?: string | null; // ID
      notIn?: Array<string | null> | null; // [ID]
      opt?: boolean | null; // Boolean
    }
    name: { // args
      eq?: string | null; // String
      in?: Array<string | null> | null; // [String]
      isNull?: boolean | null; // Boolean
      neq?: string | null; // String
      notIn?: Array<string | null> | null; // [String]
      opt?: boolean | null; // Boolean
      sort?: NexusGenEnums['SortOp'] | null; // SortOp
    }
    pokemons: { // args
      limit?: number | null; // Int
      offset?: number | null; // Int
    }
  }
}

export interface NexusGenAbstractTypeMembers {
}

export interface NexusGenTypeInterfaces {
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = never;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = never;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}