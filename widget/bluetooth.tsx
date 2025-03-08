import { Gtk } from "astal/gtk3"
import { Variable, bind, timeout } from "astal"
import Bluetooth from "gi://AstalBluetooth"
import StatusIcon from "./StatusIcon"
import { Header, MainArea, Section } from "./semanticTags"
import { name_compare } from "../lib/utils"
import { dashboard_toggle_content } from "./dashboard"

const bt = Bluetooth.get_default()

function BluetoothDevice(props: { device: Bluetooth.Device }) {
    const dev = props.device
    const revealed = Variable(false)
    return <eventbox on_hover={() => revealed.set(true)}
        on_hover_lost={() => revealed.set(false)}>
        <Section vertical={false} hexpand>
            <box>
                <icon icon={bind(dev, "icon")} className="device-icon" />
                <label label={bind(Variable.derive([bind(dev, "name"), bind(dev, "address")], (name, adr) => name.length > 0 ? name : adr))} />
            </box>
            <box visible={bind(revealed)}>
                <box hexpand />
                {bind(dev, "connecting").as(connecting => {
                    // TODO: impl this
                    if (connecting && false) {
                        return <Gtk.Spinner />
                    } else {
                        return <switch className="switch" active={bind(dev, "connected")} on_state_set={(self, state) => {
                            if (state == (dev.connected || dev.connecting)) { return }
                            if (state) {
                                if (!bt.isPowered) {
                                    bt.toggle()
                                }
                                timeout(1000, () => {
                                    dev.connect_device((dev) => { if (dev) { self.active = dev.connected } })
                                })
                            } else {
                                timeout(1000, () => {
                                    dev.disconnect_device((dev) => { if (dev) { self.active = dev.connected } })
                                })
                            }
                        }} />
                    }
                })}
            </box>
        </Section>
    </eventbox >
}

function dashboard_toggle_bt() {
    dashboard_toggle_content("bluetooth", <MainArea widthRequest={400}>
        <Header title="Bluetooth">
            <box hexpand />
            <switch
                vexpand={false}
                className="switch"
                active={bind(bt, "is_powered")}
                on_state_set={(_, active) => {
                    if (active != bt.is_powered) {
                        bt.toggle()
                        if (bt.is_powered) {
                            bt.get_adapters().forEach(adapter => adapter.start_discovery())
                        }
                    }
                }} />
        </Header>
        {bind(bt, "devices").as(devs => {
            const sorted_devices = devs.sort((a, b) => {
                if (a.connected !== b.connected) {
                    return a.connected ? -1 : 1;
                }
                if (a.paired !== b.paired) {
                    return a.paired ? -1 : 1;
                }
                return name_compare(a.name.length > 0 ? a.name : a.address,
                    b.name.length > 0 ? b.name : b.address);
            });

            return <Section>
                {sorted_devices.map(dev => (
                    <box hexpand>
                        <BluetoothDevice device={dev} />
                    </box>
                ))}
            </Section>
        })}
    </MainArea>)
}

export default function BluetoothIcon(): JSX.Element {
    const icon_name = bind(bt, "is_powered").as(powered => powered ? "bluetooth-active" : "bluetooth-disabled")

    const tooltip = Variable.derive([bind(bt, "is_powered"), bind(bt, "devices")], (is_powered, devices) => {
        let connected_devices = devices.filter(device => device.connected)
        if (connected_devices.length == 0) {
            return is_powered ? "No connected bluetooth devices" : "Bluetooth is disabled"
        }
        return "Connected devices:\n" + connected_devices.map(device => `${device.name}`).join("\n")
    })

    // TODO add clicking stuff (connect/disconnect)
    return <StatusIcon
        icon_name={icon_name}
        tooltip={bind(tooltip)}
        on_click={dashboard_toggle_bt}
    />
}
