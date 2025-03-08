import { App, Astal, Gtk } from "astal/gtk3";
import { bind, Variable } from "astal";
import Gdk from "gi://Gdk?version=3.0";

type DashboardState = {
    content: Variable<Gtk.Widget | null>;
    content_name: Variable<string>;
    monitor: Variable<Gdk.Monitor>;
    WIN_NAME: string;
}

export function dashboard_toggle_content(name: string, content: Gtk.Widget, monitor?: Gdk.Monitor) {
    App.get_window(dashboard.WIN_NAME)?.hide()
    const new_content = dashboard.content_name.get() == name ? null : content
    dashboard.content.get()?.destroy()
    dashboard.content.set(new_content)
    if (monitor) { dashboard.monitor.set(monitor) }
    App.get_window(dashboard.WIN_NAME)?.show()
}

export const dashboard: DashboardState = {
    content: Variable(null),
    content_name: Variable(""),
    monitor: Variable(App.get_monitors()[0]),
    WIN_NAME: "dashboard",
}

export function DASHBOARD_WIN() {
    return <window
        name={dashboard.WIN_NAME}
        className={"dashboard"}
        gdkmonitor={bind(dashboard.monitor)}
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
