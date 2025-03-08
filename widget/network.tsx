import { Variable, bind, timeout } from "astal"
import Network from "gi://AstalNetwork"
import StatusIcon from "./StatusIcon"
import { App, Astal, Gtk } from "astal/gtk3"
import { Header, MainArea, Section } from "./semanticTags"
import { multi_bind } from "../lib/utils"
import { dashboard, dashboard_toggle_content } from "./dashboard"

const network = Network.get_default()

function AccessPoint(props: { ap: Network.AccessPoint, section?: boolean }) {
    const ap = props.ap
    const reveal = Variable(false)
    const show_password = Variable(false)
    const password = Variable("")
    const has_pw = ap.flags != 0
    if (!ap) { return <box /> }
    return <eventbox on_click={(_, ev: Astal.ClickEvent) => { if (ev.button == Astal.MouseButton.PRIMARY) { reveal.set(true) } }}
        on_hover_lost={() => reveal.set(false)}>
        <box vertical className={props.section ? "section" : ""}>
            <box spacing={8} >
                <label label={bind(ap, "ssid")} />
                <label visible={false} label={bind(ap, "frequency").as(f => "(" + (f > 5000 ? "5G" : "2.4G") + ")")} />
                <box hexpand />
                <icon visible={has_pw} icon_name={"dialog-password"} />
                <icon icon={bind(ap, "icon_name")} className="accesspoint-icon" />
            </box>
            <revealer reveal_child={bind(reveal)} >
                <box>
                    <entry
                        className="entry"
                        css="border:1px solid #ff0000;"
                        input_purpose={Gtk.InputPurpose.PASSWORD}
                        placeholderText="Password"
                        hexpand
                        visibility={bind(show_password)}
                        halign={Gtk.Align.START} valign={Gtk.Align.CENTER}
                        onChanged={(self) => password.set(self.text)}
                    />
                    <button label="Connect" onClick={() => { }} />
                </box>
            </revealer>
        </box>
    </eventbox >
};

function dashboard_toggle_network() {
    const state = multi_bind(network, ["primary", "wifi", "wired", "state"]);
    const search_text = Variable("");
    const ap_list = Variable.derive([bind(network.wifi, "access_points"), search_text], (access_points, search_text) => ({ access_points, search_text }));

    dashboard_toggle_content("network", <MainArea widthRequest={400}>
        <Header title="Networking">
            <box hexpand />
            <switch
                vexpand={false}
                className="switch"
                active={bind(network.wifi, "enabled")}
                onNotifyActive={self => { network.wifi.set_enabled(self.active) }}
            />
        </Header>
        <Section >
            <Header title={state(s => "Connected to" + (s.primary == Network.Primary.WIRED ? " LAN" : ""))} />
            {bind(network.wifi, "active_access_point").as(ap => <AccessPoint ap={ap} />)}
        </Section>
        <Section >
            <box vertical>
                <box css="padding-right: 1rem;">
                    <Header title="Available networks" />
                    <entry
                        placeholderText="Search by SSID"
                        text={search_text()}
                        hexpand
                        onChanged={(self) => search_text.set(self.text)}
                        primary_icon_name="system-search"
                    />
                </box>
            </box>
            <box vertical>
                {ap_list(({ access_points, search_text }) => {
                    let grouped = access_points.sort((a, b) => {
                        const ssidA = a.ssid?.trim() || "";
                        const ssidB = b.ssid?.trim() || "";
                        if (ssidA === ssidB) {
                            return b.strength - a.strength;
                        } else {
                            return ssidA < ssidB ? -1 : 1;
                        }
                    });
                    let best = [];
                    for (let i = 0; i < grouped.length; i++) {
                        if (grouped[i].ssid !== grouped[i - 1]?.ssid) {
                            best.push(grouped[i]);
                        }
                    }
                    best = best.sort((a, b) => b.strength - a.strength).slice(0, 10);

                    return best.map(ap => {
                        const isVisible = search_text.length == 0 || (ap.ssid.toLowerCase().includes(search_text.toLowerCase()));
                        return (
                            <box visible={isVisible}>
                                <AccessPoint ap={ap} section />
                            </box>
                        );
                    });
                })}
            </box>
        </Section>
    </MainArea>)
}

export default function NetworkIcon() {

    const icon = Variable.derive([bind(network, "primary"), bind(network, "wired"), bind(network, "wifi")], (primary, wired, wifi) => {
        switch (primary) {
            case Network.Primary.WIFI:
                return wifi.icon_name
            case Network.Primary.WIRED:
                return wired.icon_name
            default:
                return "network-disconnected"
        }
    })

    const tooltip = Variable.derive([bind(network, "primary"), bind(network, "wired"), bind(network, "wifi")], (primary, wired, wifi) => {
        switch (primary) {
            case Network.Primary.WIFI:
                return `Connected to "${wifi.ssid}"`
            case Network.Primary.WIRED:
                return `Connected to LAN (${wired.device})`
            default:
                return "No connection"
        }
    })

    // TODO add clicking stuff (connect/disconnect)
    return <StatusIcon
        icon_name={bind(icon)}
        tooltip={bind(tooltip)}
        on_click={dashboard_toggle_network}
    />
}


