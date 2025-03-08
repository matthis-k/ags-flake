import { App, Astal, Gdk, Gtk } from "astal/gtk3";
import { MainArea, Section } from "./semanticTags";
import StatusIcon from "./StatusIcon";
import { exec } from "astal";
import { dashboard_toggle_content } from "./dashboard";

function dashboard_toggle_power_menu() {
    dashboard_toggle_content("powermenu",
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
        </MainArea>)
}

export default function PowerIcon() {
    return <StatusIcon
        className="power"
        icon_name={"system-shutdown-symbolic"}
        on_click={dashboard_toggle_power_menu}
    />
}

