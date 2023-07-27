import { Children, Context, FC, ReactNode, createContext, createElement, useContext, useEffect, useMemo, useRef, useState } from "react";
import { atom, useAtom, useSetAtom, useStore, useAtomValue, Atom, PrimitiveAtom } from 'jotai';

type Atomize<T extends Idable> = Atom<{ [K in keyof T]: Atom<T[K]> }>;
type AtomGroup<T extends Idable> = Record<string, Atomize<T>>;

type Container = { children: ReactNode };
type Idable = { id: string };

type Pokemon = {
  id: string,
  name: string,
  hp: number,
  attack: number,
  defense: number,
  specialAttack: number,
  specialDefense: number,
  speed: number,
}

type Trainer = {
  id: string,
  name: string,
  pokemons: string[],
}

type Remote<T> =
  | RemoteField<T>
  | RemoteCollection
  | RemoteSubCollection<T>
  | RemoteBarrier

type RemoteField<T> = {
  kind: "field",
  keys: (keyof T & string)[],
}

type RemoteCollection = {
  kind: "collection",
  name: string,
}

type RemoteSubCollection<T> = {
  kind: "sub_collection",
  key: keyof T & string,
}

type RemoteBarrier = {
  kind: "barrier",
}

type StringArrayPart<T> = { [P in keyof T as T[P] extends string[] ? P : never]: T[P] };

type RemoteProps<T> = {
  div?: boolean,
  gt?: number,
  render?: (props: { value: T, setValue: (x: T) => void }) => JSX.Element,
}

type RemoteComponent<T> = <K extends (keyof T & string)[]>(...keys: K) => <U>(f: (props: Pick<T, K[number]>) => U) => FC<RemoteProps<any>> & { _remote: RemoteField<T> };
type RemoteFieldComponent<T> = <K extends keyof T & string>(key: K) => FC<RemoteProps<T[K]>> & { _remote: RemoteField<T> };
type RemoteCollectionComponent = (name: string) => FC<{ children: ReactNode }> & { _remote: RemoteCollection };
type RemoteSubCollectionComponent<T> = <K extends keyof StringArrayPart<T> & string>(Provider: FC<Idable & Container>, key: K) => FC<{ children: ReactNode }> & { _remote: RemoteSubCollection<T> };

function remote<T extends Idable>(Context: Context<Idable>, baseAtom: Atom<AtomGroup<T>>): RemoteComponent<T> {
  return <K extends (keyof T & string)[]>(...keys: K) => {
    type Props = Pick<T, K[number]>;
    return <U extends unknown>(derive: (props: Props) => U) => {
      return Object.assign(({ div, render }: RemoteProps<any>) => {
        const { id } = useContext(Context);
        const [value, setValue] = useAtom(useMemo(() => atom(get => {
          const self = get(get(baseAtom)[id]);
          return derive(Object.fromEntries(keys.map(key => [key, get(self[key])])) as Props);
        }), [id]));

        if (render)
          return createElement(render, { value, setValue });
        if (div)
          return <div>{value as ReactNode}</div>;
        return <>{value}</>;
      }, {
        _remote: {
          kind: "field" as const,
          keys,
        },
      });
    }
  }
}

function remoteField<T extends Idable>(Context: Context<Idable>, baseAtom: Atom<AtomGroup<T>>): RemoteFieldComponent<T> {
  return <K extends keyof T & string>(key: K) => {
    return remote<T>(Context, baseAtom)(key)(x => x[key] as ReactNode);
  }
}

function remoteCollection<T extends Idable>(Provider: FC<Idable & Container>, baseAtom: Atom<AtomGroup<T>>): RemoteCollectionComponent {
  return (name: string) => Object.assign(({ children }: Container) => {
    const ids = useAtomValue(useMemo(() => atom(get => {
      return Object.keys(get(baseAtom));
    }), []));

    return (
      <>
        {ids.map(id => (
          <Provider id={id} key={id}>
            {children}
          </Provider>
        ))}
      </>
    )
  }, {
    _remote: {
      kind: "collection" as const,
      name
    },
  });
}

function remoteSubCollection<T extends Idable>(Context: Context<Idable>, baseAtom: Atom<AtomGroup<T>>): RemoteSubCollectionComponent<T> {
  return <K extends keyof StringArrayPart<T> & string>(Provider: FC<Idable & Container>, key: K) => {
    return Object.assign(({ children }: Container) => {
      const { id } = useContext(Context);
      const ids = useAtomValue(useMemo(() => atom(get => {
        const self = get(get(baseAtom)[id]);
        return get(self[key]) as string[] ?? [];
      }), [id]));
      return (
        <>
          {ids.map(id => (
            <Provider id={id} key={id}>
              {children}
            </Provider>
          ))}
        </>
      )
    }, {
      _remote: {
        kind: "sub_collection" as const,
        key,
      },
    });
  }
}


type RemoteBuilder<T> = {
  field: RemoteFieldComponent<T>,
  derived: RemoteComponent<T>,
  collection: RemoteCollectionComponent,
  subCollection: RemoteSubCollectionComponent<T>,
}

function RemoteResource<T extends Idable>() {
  return <U extends unknown>(b: (b: RemoteBuilder<T>) => U) => {
    const Context = createContext<Idable>({ get id(): string { throw new Error() } });
    const Provider = ({ children, id }: Container & Idable) => (
      <Context.Provider value={{ id }}>
        {children}
      </Context.Provider>
    );
    const baseAtom = atom({} as AtomGroup<T>);
    return {
      Context,
      Provider,
      baseAtom,
      Resource: Object.assign(Provider, b({
        field: remoteField<T>(Context, baseAtom),
        derived: remote<T>(Context, baseAtom),
        collection: remoteCollection<T>(Provider, baseAtom),
        subCollection: remoteSubCollection<T>(Context, baseAtom),
      })),
    };
  }
}

const { Resource: Pokemon, Context: PokemonContext, Provider: PokemonProvider, baseAtom: PokemonAtom } = RemoteResource<Pokemon>()(({ field, derived, collection }) => ({
  Id: field('id'),
  Name: field('name'),
  Hp: field('hp'),
  Attack: field('attack'),
  Defense: field('defense'),
  SpecialAttack: field('specialAttack'),
  SpecialDefense: field('specialDefense'),
  Speed: field('speed'),
  UppercaseName: derived('name')(({ name }) => name.toUpperCase()),
  TotalStats: derived('hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed')(props => Object.values(props).reduce((p, c) => p + c, 0)),
  All: collection('pokemons'),
}));

const { Resource: Trainer, Context: TrainerContext, baseAtom: TrainerAtom } = RemoteResource<Trainer>()(({ field, derived, collection, subCollection }) => ({
  Id: field('id'),
  Name: field('name'),
  Pokemons: subCollection(PokemonProvider, 'pokemons'),
  All: collection('trainers'),
}));

type GQLField =
  | GQLPrimitiveField
  | GQLCollectionField

type GQLPrimitiveField = {
  kind: "GQLPrimitiveField",
  name: string,
  gt?: number,
}

type GQLCollectionField = {
  kind: "GQLCollectionField",
  name: string,
  fields: GQLField[],
}

class RemoteConfigError extends Error {
}

function dedupeFields<T extends { name: string }>(arr: T[]): T[] {
  let r: T[] = [];

  for (const x of arr) {
    const i = r.findIndex(e => e.name === x.name);
    if (i === -1) {
      r.push(x);
    }
    else {
      const field = r[i];
      const u = "gt" in field && field.gt !== undefined;
      const v = "gt" in x && x.gt !== undefined;
      if (u && v) {
        throw new RemoteConfigError(`Conflict of greater than filter for ${field.name} ${field.gt} ${x.gt}`);
      }
      else if (v) {
        // @ts-expect-error
        r[i].gt = x.gt;
      }
    }
  }

  return r;
}

function childrenArray(x: ReactNode): ReactNode[] {
  if (x === undefined || x === null) return [];
  if (Array.isArray(x)) return x;
  return [x];
}

function extractQueryFields(node: ReactNode): GQLField[] {
  if (typeof node === "object" && node !== null && "type" in node && typeof node.type === "function") {
    if ("_remote" in node.type) {
      const remote = node.type._remote as Remote<any>;
      switch (remote.kind) {
        case "barrier": return [];
        case "field": {
          const keys = remote.keys;
          return keys.map(key => ({ kind: "GQLPrimitiveField", name: key, gt: node.props.gt }));
        }
        case "collection": {
          const children = childrenArray(node.props.children);
          const fields = dedupeFields(children.flatMap(extractQueryFields).concat([{ kind: "GQLPrimitiveField", name: "id" }]));
          return [{
            kind: "GQLCollectionField",
            name: remote.name,
            fields,
          }];
        }
        case "sub_collection": {
          const children = childrenArray(node.props.children);
          const fields = dedupeFields(children.flatMap(extractQueryFields).concat([{ kind: "GQLPrimitiveField", name: "id" }]));
          return [{
            kind: "GQLCollectionField",
            name: remote.key,
            fields,
          }];
        }
      }
    }
    else {
      try {
        // // useState.apply = ;
        // console.log(useState);
        // useState.prototype.constructor = (x) => [x, () => { }];
        // // // @ts-ignore
        // Object.defineProperty(useState, 'name', { value: 'aslkdslkad' });
        // // //useState.prototype.apply = (x) => [x, () => { }];
        // console.log(useState.name);
        // @ts-expect-error  
        return extractQueryFields(node.type(node.props));
      }
      catch (e) {
        console.error(e);
        if (e instanceof RemoteConfigError) throw e;
        return [];
      }
    }
  }

  const children = childrenArray((node as any)?.props?.children);
  return dedupeFields(children.flatMap(extractQueryFields));
}

function toGQLQuery(fields: GQLField[], name: string): { query: string, variables: any, variablesFlat: any[] } {
  let tab = '';
  let p = 0;
  let variables: any = {};
  const variablesFlat: any[] = [];


  function addVariable(value: any) {
    const idx = p++;
    const variable = `p${idx}`;
    variables[variable] = value;
    variablesFlat.push(value);
    return `$${variable}`;
  }

  function indent(x: string) {
    return tab + x;
  }

  function scope<T>(f: () => T) {
    tab += '  ';
    const value = f();
    tab = tab.slice(0, -2);
    return value;
  }

  function imp(field: GQLField): string {
    switch (field.kind) {
      case "GQLPrimitiveField": {
        if (field.gt !== undefined) {
          return `${field.name}(gt: ${addVariable(field.gt)})`;
        }
        else {
          return field.name;
        }
      }
      case "GQLCollectionField":
        return `${field.name} {\n${scope(() => `${tab}details {\n${tab + "  "}__typename\n${scope(() => field.fields.map(imp).map(indent).join('\n'))}\n${tab}}`)}\n${tab}}`;
    }
  }

  const inner = scope(() => fields.map(imp).map(indent).join('\n'))

  const query = `query ${name}${p === 0 ? "" : `(${Array.from({ length: p }).map((_, i) => `$p${i}: Int`).join(',')})`} {\n${inner}\n${tab}}`;

  console.log(query);

  return {
    query,
    variables,
    variablesFlat,
  };
}

const Barrier = Object.assign(({ children, name }: Container & { name?: string }) => {
  const [loading, setLoading] = useState(true);
  const store = useStore();
  const first = useRef(false);
  const values = useMemo(() => toGQLQuery(extractQueryFields(children), name ?? "Query"), [children, name]);

  useEffect(() => {
    fetch("http://localhost:4000/graphql", {
      body: JSON.stringify(values),
      method: "POST",
      headers: [
        ["content-type", "application/json"]
      ]
    }).then(x => x.json()).then(x => {
      // setLoading(false);
      // need to set the atoms?

      // todo we can't fully normalize because of sub filters
      // I think that means we need id path instead of id 

      const trainers: AtomGroup<Trainer> = {};
      const pokemons: AtomGroup<Pokemon> = {};

      function addUnique<T extends Idable>(o: AtomGroup<T>, x: T) {
        if (x.id in o) return;
        o[x.id] = atom(Object.fromEntries(Object.entries(x).map(x => [x[0], atom(x[1])]))) as any as Atomize<T>;
      }

      function imp(x: any) {
        if (typeof x !== 'object' || x === null) return;

        if ("details" in x && Array.isArray(x.details)) {
          for (const d of x.details) switch (d.__typename) {
            case "Trainer":
              addUnique(trainers, {
                id: d.id,
                name: d.name,
                pokemons: d?.pokemons?.details?.map((x: any) => x.id),
              });
              imp(d?.pokemons);
              break;
            case "Pokemon":
              addUnique(pokemons, {
                id: d.id,
                name: d.name,
                attack: d.attack,
                defense: d.defense,
                hp: d.hp,
                specialAttack: d.specialAttack,
                specialDefense: d.specialDefense,
                speed: d.speed,
              });
              break;
          }
        }
      }

      Object.values(x.data).forEach(imp);

      if (Object.keys(pokemons).length > 0)
        store.set(PokemonAtom, pokemons);
      if (Object.keys(trainers).length > 0)
        store.set(TrainerAtom, trainers);

      setLoading(false);
    });
  }, values.variablesFlat);

  if (loading)
    return <div>Loading...</div>;

  return (
    <>
      {children}
    </>
  );
}, {
  _remote: {
    kind: "barrier",
  }
});

function Title({ children }: Container) {
  return (
    <label className="font-bold text-2xl text-black">
      {children}
    </label>
  );
}

export default function Test() {
  const [value, setValue] = useState(14);
  return (
    <>
      <input value={value} onChange={e => setValue(Number(e.target.value))} />
      <Barrier>
        <div className="m-16">
          <Trainer.All>
            <div className="flex flex-row gap-4">
              Trainer Id: {" "}
              <Trainer.Id />
              <Trainer.Name div />
            </div>
            <Trainer.Pokemons>
              <div>Pokemon <Pokemon.Name /></div>
              <Title>
                Total Stats: {" "}
                <Pokemon.TotalStats />
              </Title>
              <div className="flex flex-row justify-around m-8">
                <div>
                  <Pokemon.Hp div gt={value} />
                  <Pokemon.Attack render={({ value, setValue }) => <input value={value} onChange={e => setValue(Number(e.target.value))} />} />
                  <Pokemon.Defense div />
                </div>
                <div>
                  <Pokemon.Speed div />
                  <Pokemon.SpecialAttack div />
                  <Pokemon.SpecialDefense div />
                </div>
              </div>
            </Trainer.Pokemons>
          </Trainer.All>
        </div>
      </Barrier>
    </>
  );
}
