import { App, Astal, Gtk } from "astal/gtk3";
import { Variable } from "astal";
import { MutableProps } from "../lib/utils";

type DashboardState = {
    content: Variable<Gtk.Widget | null>;
    content_name: Variable<string>;
    win_opts: WinProps;
}
type WinProps = Partial<MutableProps<Astal.Window>>;

export function dashboard_toggle_content(name: string, content: Gtk.Widget, win_opts: WinProps = {}) {
    App.get_window(dashboard.win_opts.name || "")?.hide()
    const new_content = dashboard.content_name.get() == name ? null : content
    dashboard.content.get()?.destroy()
    dashboard.content.set(new_content)

    let key: keyof typeof win_opts;
    for (key in win_opts) {
        let value = win_opts[key];
        set_win_opt(key, value)
    }

    App.get_window(dashboard.win_opts.name || "")?.show()
}

function set_win_opt<K extends keyof WinProps>(key: K, value: WinProps[K]) {
    if (value == undefined) {
        return
    }
    dashboard.win_opts[key] = value
}

export const dashboard: DashboardState = {
    content: Variable(null),
    content_name: Variable(""),
    win_opts: { name: "dashboard" },
}

export function DASHBOARD_WIN() {
    return <window
        className={"dashboard"}
        {...dashboard.win_opts}
        application={App}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.RIGHT}>
        <eventbox on_hover_lost={() => {
            dashboard.content.set(null)
            dashboard.content_name.set("")
        }} >
            {dashboard.content(c => c || <box />)}
        </eventbox>
    </window>
}
