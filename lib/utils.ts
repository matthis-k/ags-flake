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

export function name_compare(a: string, b: string, AaBbCc: boolean = true): -1 | 0 | 1 {
    const lowerA = AaBbCc ? a.toLowerCase() : null
    const lowerB = AaBbCc ? b.toLowerCase() : null
    if (a == b) { return 0 }
    else if (lowerA && lowerB && lowerA === lowerA) {
        return lowerA < lowerB ? -1 : 1;
    } else {
        return a < b ? -1 : 1;
    }
}


type MutableKeys<T> = {
    [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K, never>
}[keyof T];

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;

export type MutableProps<T> = Pick<T, MutableKeys<T>>;
