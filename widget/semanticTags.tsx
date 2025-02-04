import { Binding } from "astal";
import { Astal, Gtk } from "astal/gtk3";

function concatClassName(className: string | Binding<string | undefined> | undefined, append: string) {
    if (typeof className === "string") {
        return className + " " + append;
    } else if (className instanceof Binding) {
        return className.as(cls => (cls ? cls + " " + append : append));
    } else {
        return append;
    }
}

type ClassName = { className: string | Binding<string | undefined> | undefined }


type MainAreaProps = Partial<Astal.Box & ClassName>

export function MainArea(props: MainAreaProps) {
    props.vertical = props.vertical !== false
    props.className = concatClassName(props.className, "mainArea")
    return <box {...props} >
        {props.child}{props.children}
    </box>
}

type SectionProps = Partial<Astal.Box & ClassName>
export function Section(props: SectionProps) {
    props.vertical = props.vertical !== false
    props.className = concatClassName(props.className, "section")
    return <box {...props} >
        {props.child}{props.children}
    </box >
}

type HeaderProps = Partial<Astal.Box & ClassName & {
    title: Binding<string> | string;
}>
export function Header(props: HeaderProps) {
    const title = props.title
    props.title = undefined
    props.className = concatClassName(props.className, "header")
    return <box  {...props} >
        {title && <label label={title} />}
        {props.child}{props.children}
    </box>
}
