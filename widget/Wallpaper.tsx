import { App, Astal, Gdk, Gtk } from "astal/gtk3"
import { Variable, bind } from "astal"

export default function Wallpaper(gdkmonitor: Gdk.Monitor): Gtk.Widget {
    const wallpaper = Variable("/home/matthisk/.config/wallpaper.png")
    return <window
        className="Wallpaper"
        gdkmonitor={gdkmonitor}
        layer={Astal.Layer.BOTTOM}
        exclusivity={Astal.Exclusivity.IGNORE}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.LEFT
            | Astal.WindowAnchor.BOTTOM
            | Astal.WindowAnchor.RIGHT}
        application={App}>
        <box hexpand vexpand css={bind(wallpaper).as(wallpaper => `background-image: url("${wallpaper}");  background-size: cover; background-repeat: no-repeat; background-position: center;`)} />
    </window>
}
