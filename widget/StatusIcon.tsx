import { bind, Binding } from "astal"
import Astal from "gi://Astal?version=3.0"

type StatusIconProps = {
    icon_name: Binding<string> | string;
    tooltip?: Binding<string> | string;
    className?: Binding<string> | string;
    on_click?: any;
    on_scroll?: any;
};

export default function StatusIcon(props: StatusIconProps) {
    let classes;
    if (typeof (props.className) == "string") {
        classes = "StatusIcon " + props.className
    } else if (props.className) {
        classes = props.className.as(c => "StatusIcon " + c)
    }

    return <button
        tooltip_markup={props.tooltip}
        onClick={props.on_click}
        onScroll={props.on_scroll}
        className={classes}
    >
        <icon icon={props.icon_name} />
    </button>
}
