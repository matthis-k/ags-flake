import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { MainArea, Section } from "./semanticTags";
import StatusIcon from "./StatusIcon";
import { exec } from "astal";

let power_menu_window: Gtk.Window | null

function PowerWindowToggle() {
    if (power_menu_window) {
        App.remove_window(power_menu_window)
        power_menu_window.close()
        power_menu_window = null
        return
    }

    return <window
        name="PowerMenu"
        className="PowerMenu"
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        application={App}
        setup={self => power_menu_window = self}
    >
        <eventbox on_hover_lost={() => {
            PowerWindowToggle()
        }} >
            <MainArea>
                <box vertical>
                    <Section>
                        <button onClicked={() => exec("systemctl poweroff")} tooltipText={"Shut down"}>
                            <icon icon={"system-shutdown-symbolic"} css="font-size: 2rem;" />
                        </button>
                    </Section>
                    <Section>
                        <button onClicked={() => exec("systemctl reboot")} tooltipText={"Reboot"}>
                            <icon icon={"system-reboot-symbolic"} css="font-size: 2rem;" />
                        </button>
                    </Section>
                    <Section>
                        <button onClicked={() => exec("hyprctl dispatch exit")} tooltipText={"Log out"}>
                            <icon icon={"system-log-out-symbolic"} css="font-size: 2rem;" />
                        </button>
                    </Section>
                </box>
            </MainArea>
        </eventbox>
    </window >
}

export default function PowerIcon() {
    return <StatusIcon
        className="power"
        icon_name={"system-shutdown-symbolic"}
        on_click={PowerWindowToggle}
    />
}

