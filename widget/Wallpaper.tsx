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
        <box hexpand expand css="background: #ff0000;">
            <label label="asdfasdfasdfaskdfjaösdkfjaösdfkj" />
            {wallpaper(path =>
                <Gtk.Image hexpand vexpand file={path} />
            )}
        </box>
    </window>
}
