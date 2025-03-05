import { App, Astal, Gdk, Gtk } from "astal/gtk3"

import HyprlandWorkspaces from "./hyprland"
import Clock from "./clock"
import BatteryIcon from "./battery"
import NetworkIcon from "./network"
import BluetoothIcon from "./bluetooth"
import AudioIcon from "./audio"
import { SysTray } from "./tray"

export default function Bar(gdkmonitor: Gdk.Monitor): Gtk.Widget {
    return <window
        className="Bar"
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.LEFT
            | Astal.WindowAnchor.RIGHT}
        application={App}>

        <centerbox>
            <box>
                <HyprlandWorkspaces />
            </box>
            <box>
                <Clock />
            </box>
            <box halign={Gtk.Align.END} spacing={5}>
                <SysTray />
                <NetworkIcon />
                <BluetoothIcon />
                <AudioIcon />
                <BatteryIcon />
            </box>
        </centerbox>
    </window>
}
