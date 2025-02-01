import { Binding } from "astal";


class MainAreaProps {
    children?: Binding<Array<JSX.Element>> | Array<JSX.Element>;
    child?: Binding<JSX.Element> | JSX.Element;
}
export function MainArea({ child, children }: MainAreaProps) {
    return <box vertical className={"mainArea"}>
        {child}
        {children}
    </box>
}

class SectionProps {
    horizontal?: boolean;
    children?: Binding<Array<JSX.Element>> | Array<JSX.Element>;
    child?: Binding<JSX.Element> | JSX.Element;
}
export function Section({ child, children, horizontal }: SectionProps) {
    return <box vertical={horizontal != true} className={"section"}>
        {child}
        {children}
    </box>
}

class HeaderProps {
    title?: Binding<string> | string;
    children?: Binding<Array<JSX.Element>> | Array<JSX.Element>;
    child?: Binding<JSX.Element> | JSX.Element;
}
export function Header({ child, children, title }: HeaderProps) {
    return <box className={"header"}>
        {title && <label label={title} />}
        {child}
        {children}
    </box>
}
