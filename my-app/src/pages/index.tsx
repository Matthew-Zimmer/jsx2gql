import { Atom, atom, useAtom, useAtomValue, useSetAtom, useStore } from "jotai";
import { Context, FC, Fragment, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Title } from "./test";

type Container = { children: ReactNode };
type Id = { id: string };

type GQLField =
  | GQLPrimitiveField
  | GQLObjectField

type GQLPrimitiveField = {
  kind: "GQLPrimitiveField",
  type: string,
  name: string,
}

type GQLObjectField = {
  kind: "GQLObjectField",
  type: string,
  name: string,
  fields: GQLField[],
}

function hasNameInFields(x: GQLObjectField, y: GQLField): boolean {
  return x.fields.some(x => x.name === y.name);
}

class RemoteTree {
  private tree: GQLObjectField = { kind: "GQLObjectField", fields: [], name: "", type: "Root" };
  private pointer: GQLObjectField = this.tree;
  private stack: GQLObjectField[] = [];


  get view() {
    return this.tree;
  }

  add(value: GQLField) {
    if (hasNameInFields(this.pointer, value)) return;
    this.pointer.fields.push(value);
  }

  open(value: GQLObjectField) {
    if (this.stack.length > 0 && hasNameInFields(this.last(), value)) return;
    this.pointer.fields.push(value);
    this.stack.push(this.pointer);
    this.pointer = value;
    // always add the id field
    // as its required for normalization
    this.add({ kind: "GQLPrimitiveField", name: "id", type: "Id" });
  }

  close() {
    if (this.stack.length === 0) return;
    this.pointer = this.stack.pop()!;
  }

  private last() {
    return this.stack[this.stack.length - 1];
  }

  reset() {
    this.stack = [];
    this.tree = { kind: "GQLObjectField", fields: [], name: "", type: "Root" };
    this.pointer = this.tree;
  }
}

const tree = new RemoteTree();

const cacheAtom = atom({
  relations: atom({}),
});

const LOADING = Symbol('LOADING');

function useCacheAtom(domain: string, id: string | undefined, field: string) {
  return useMemo(() => atom(get => {
    if (id === undefined) return LOADING;
    const da = (get(cacheAtom) as any)[domain];
    const ra = (get(da) as any)[id];
    const fa = (get(ra) as any)[field];
    return get(fa);
  }), [domain, id, field]);
}

function useCacheRelationAtom(path: (string | undefined)[]) {
  return useMemo(() => atom(get => {
    let a: any = get(get(cacheAtom).relations);
    for (const p of path) {
      if (p === undefined || !(p in a)) return LOADING;
      a = get(a[p]);
    }
    return a as string[];
  }), path);
}

function Hidden({ children }: { children?: ReactNode }) {
  return <div className="hidden" >{children}</div>
}

function toGQL(x: GQLField): string {
  let tab = '';
  let first = true;

  function scope(f: () => string): string {
    tab += '  ';
    const value = f();
    tab = tab.slice(0, -2);
    return value;
  }

  function imp(x: GQLField): string {
    switch (x.kind) {
      case "GQLPrimitiveField":
        return x.name;
      case "GQLObjectField":
        if (first) {
          first = false;
          return `${x.name} {\n${scope(() => x.fields.map(x => `${tab}${imp(x)}\n`).join(''))}${tab}}`;
        }
        return `${x.name} {\n${scope(() => `${tab}details {\n${scope(() => x.fields.map(x => `${tab}${imp(x)}\n`).join(''))}${tab}}\n`)}${tab}}`;
    }
  }

  return `query NAME ${imp(x)}`;
}

function merge<T>(u?: T, v?: T): Partial<T> {
  return { ...u, ...v };
}

function insert(obj: object, path: string[], value: any) {
  let o: any = obj;
  for (const p of path.slice(0, -1)) {
    if (!(p in o))
      o[p] = {};
    o = o[p];
  }
  o[path[path.length - 1]] = value;
}

function atomize(x: any): any {
  if (typeof x === "object" && x !== null && !Array.isArray(x))
    return atom(Object.fromEntries(Object.entries(x).map(([k, v]) => [k, atomize(v)])));
  return atom(x);
}

function Barrier({ children }: { children: ReactNode }) {
  const store = useStore();

  useEffect(() => {
    if (tree.view.fields.length === 0) return;
    const view = tree.view;
    const query = toGQL(view);
    console.log(query);
    fetch("http://localhost:4000/graphql", {
      body: JSON.stringify({
        query
      }),
      method: "POST",
      headers: [
        ["content-type", "application/json"]
      ]
    }).then(x => x.status === 200 ? x.json() : (() => { throw x; })()).then(x => {
      // need to populate the atoms
      const data = x.data;

      const tables: any = {};

      const relations: any = {};

      function exploreEntity(collection: any, x: any, tr: GQLObjectField, path: string[]) {
        const id = x.id;
        const value: any = {};
        for (const field of tr.fields) {
          switch (field.kind) {
            case "GQLObjectField": {
              const next = [...path, "values", id, field.name];
              explore(x[field.name], field, next);
              insert(relations, [...next, "ids"], x[field.name]?.details?.map((x: any) => x.id) ?? []);
              break;
            }
            case "GQLPrimitiveField":
              value[field.name] = x[field.name];
              break;
          }
        }
        collection[id] = merge(collection[id], value);
      }

      function explore(x: any, tr: any, path: string[]): void {
        if (!(tr.type in tables))
          tables[tr.type] = {};
        if (tr.type === "Root") {
          Object.entries(x).forEach(([k, v]) => {
            const res = tr.fields.find((x: any) => x.name === k);
            explore(v, res, [res.type]);
          });
          return;
        }
        if ("details" in x) {
          for (const dt of x.details) {
            exploreEntity(tables[tr.type], dt, tr, path);
          }
        }
      }

      explore(data, view, []);

      for (const [table, value] of Object.entries(tables))
        insert(relations, [table, "ids"], Object.keys(value as object));

      store.set(cacheAtom, Object.fromEntries(
        Object.entries({ ...tables, relations }).map(([k, v]) => [k, atomize(v)])
      ) as any);
    });
    tree.reset();
  }, []);

  return <>{children}</>;
}

function capitalize<S extends string>(str: S): Capitalize<S> {
  return (str.length === 0 ? "" : str[0].toUpperCase() + str.slice(1)) as Capitalize<S>;
}

type RemoteProvider = FC<Container & RemoteContextState> & { typeName: string };

type RemoteResourceBuilders<T extends Id> = {
  field: <K extends keyof T & string>(name: K) => FC & Record<`use${Capitalize<K>}`, () => [T[K]]> & Record<`use${Capitalize<K>}Value`, () => T[K]>,
  collection: (name: string) => FC<Container>,
  subCollection: <K extends keyof T & string>(name: K, provider: RemoteProvider) => FC<Container>,
}

type RemoteContextState = {
  id: string | undefined,
  path: (string | undefined)[],
}

type RemoteResources<U> = {
  Component: RemoteProvider & U,
  Context: Context<RemoteContextState>,
}

function RemoteResource<T extends Id>(typeName: string) {
  return <U extends object>(f: (x: RemoteResourceBuilders<T>) => U): RemoteResources<U> => {
    const Context = createContext<RemoteContextState>({ id: undefined, path: [] });

    const Provider: FC<Container & RemoteContextState> = ({ children, id, path }) => (
      <Context.Provider value={{ id, path }}>
        {children}
      </Context.Provider>
    );

    const field = <K extends keyof T & string>(name: K) => {
      const properName = capitalize(name);
      const useFieldAtom = () => {
        tree.add({ kind: "GQLPrimitiveField", name, type: "Int" });
        const { id } = useContext(Context);
        return useCacheAtom(typeName, id, name);
      }

      return Object.assign(() => {
        const value = useAtomValue(useFieldAtom());
        if (value === LOADING) return <Fragment />;
        return <>{value}</>;
      }, {
        [`use${properName}`]: () => useAtom(useFieldAtom()),
        [`use${properName}Value`]: () => useAtomValue(useFieldAtom()),
        //[`use${properName}`]: () => useSetAtom(useFieldAtom()),
      });
    };

    const collection = (name: string) => {
      const properName = capitalize(name);
      const useAllIdsAtom = () => {
        tree.open({ kind: "GQLObjectField", name, fields: [], type: typeName });

        useEffect(() => {
          tree.close();
        });

        return useCacheRelationAtom([typeName, 'ids']);
      }

      return Object.assign(({ children }: Container) => {
        const atom = useAllIdsAtom();
        const ids = useAtomValue(atom);
        const mock = <Hidden>{children}</Hidden>;

        if (ids === LOADING) return mock;

        return (
          <>
            {mock}
            {ids.map(id => (
              <Provider id={id} path={[typeName]} key={id}>
                {children}
              </Provider>
            ))}
          </>
        );
      }, {
        //[`use${properName}`]: () => useAtom(useFieldAtom()),
        //[`use${properName}Value`]: () => useAtomValue(useFieldAtom()),
        //[`use${properName}`]: () => useSetAtom(useFieldAtom()),
      });
    };

    const subCollection = <K extends keyof T & string>(name: K, Provider: RemoteProvider) => {
      const properName = capitalize(name);
      const useNestedIdsAtom = () => {
        tree.open({ kind: "GQLObjectField", name, fields: [], type: Provider.typeName });

        useEffect(() => {
          tree.close();
        });

        const { id, path } = useContext(Context);
        const nextPath = [...path, "values", id, name];
        return [useCacheRelationAtom([...nextPath, 'ids']), nextPath] as const;
      }

      return Object.assign(({ children }: Container) => {
        const [atom, path] = useNestedIdsAtom();
        const ids = useAtomValue(atom);
        const mock = <Hidden>{children}</Hidden>;

        if (ids === LOADING) return mock;

        return (
          <>
            {mock}
            {ids.map(id => (
              <Provider id={id} path={path} key={id}>
                {children}
              </Provider>
            ))}
          </>
        );
      }, {
        // [`use${properName}`]: () => useAtom(useFieldAtom()),
        // [`use${properName}Value`]: () => useAtomValue(useFieldAtom()),
        //[`use${properName}`]: () => useSetAtom(useFieldAtom()),
      });
    };

    return {
      Component: Object.assign(Provider, {
        typeName,
        ...f({
          field: field as any,
          collection: collection as any,
          subCollection: subCollection as any,
        })
      }),
      Context,
    };
  };
}

type Trainer = {
  id: string,
  name: string,
  pokemons: string[],
}

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

const { Component: Pokemon } = RemoteResource<Pokemon>("Pokemon")(({ field }) => ({
  Id: field('id'),
  Name: field('name'),
  Hp: field('hp'),
  Attack: field('attack'),
  Defense: field('defense'),
  SpecialAttack: field('specialAttack'),
  SpecialDefense: field('specialDefense'),
  Speed: field('speed'),
}));

const { Component: Trainer } = RemoteResource<Trainer>("Trainer")(({ field, collection, subCollection }) => ({
  Id: field('id'),
  Name: field('name'),
  All: collection("trainers"),
  Pokemons: subCollection("pokemons", Pokemon),
}));

export default function Page() {
  return (
    <Barrier>
      <div className="flex flex-col gap-3 m-4">
        <Trainer.All>
          <div className="border" >
            <Title>
              <Trainer.Name />
            </Title>
            <TrainerPokemons />
          </div>
        </Trainer.All>
      </div>
    </Barrier>
  );
}

function TrainerPokemons() {
  return (
    <Trainer.Pokemons>
      <div className="flex flex-col gap-2 border m-4">
        <Pokemon.Name />
        <div className="flex flex-row justify-around">
          <div className="flex flex-col gap-4  my-2">
            <label>HP: <Pokemon.Hp /></label>
            <label>Attack: <Pokemon.Attack /></label>
            <label>Defense: <Pokemon.Defense /></label>
          </div>
          <div className="flex flex-col gap-4 my-2">
            <label>Speed: <Pokemon.Speed /></label>
            <label>Special Attack: <Pokemon.SpecialAttack /></label>
            <label>Special Defense: <Pokemon.SpecialDefense /></label>
          </div>
        </div>
      </div>
    </Trainer.Pokemons>
  );
}
