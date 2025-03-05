import { bind, Variable } from "astal";
import { Connectable } from "astal/binding";

export function multi_bind<T extends Connectable, P extends keyof T>(s: T, p: P[]) {
    return Variable.derive(p.map(prop => bind(s, prop)), (props: Array<T[P]>) =>
        p.reduce((acc, key, index) => {
            acc[key] = props[index];
            return acc;
        }, {} as { [K in P]: T[K] })
    );
}
