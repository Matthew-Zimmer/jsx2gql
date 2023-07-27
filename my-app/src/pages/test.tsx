import { ReactNode } from "react";

export function Title({ children }: { children: ReactNode }) {
  return (
    <div className="text-4xl font-bold" >
      {children}
    </div>
  );
}

export default function Test() {
  return (
    <Title>
      <div>Hello world!</div>
    </Title>
  )
}
