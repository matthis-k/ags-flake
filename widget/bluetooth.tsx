import { App, Astal, Gtk } from "astal/gtk3"
import { Variable, bind, timeout } from "astal"
import Bluetooth from "gi://AstalBluetooth"
import StatusIcon from "./StatusIcon"
import { Header, MainArea, Section } from "./popupMenu"

const bt = Bluetooth.get_default()


let bluetooth_menu_window: Gtk.Window | null

function BluetoothWindowToggle() {
    if (bluetooth_menu_window) {
        App.remove_window(bluetooth_menu_window)
        bluetooth_menu_window.close()
        bluetooth_menu_window = null
        return
    }

    function BluetoothDevice(props: { device: Bluetooth.Device }) {
        const dev = props.device
        const revealed = Variable(false)
        return <eventbox on_hover={() => revealed.set(true)}
            on_hover_lost={() => revealed.set(false)}>
            <Section horizontal>
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

    // TODO prettify this and add binding depth to bar
    const status_change_detector = Variable.derive([bind(bt, "devices")], devs => devs.flatMap(dev => [bind(dev, "paired"), bind(dev, "connecting"), bind(dev, "connected")]))

    const content = bind(status_change_detector).as(status_change_detector => {
        let inner = Variable.derive(status_change_detector, (_ => {
            const connected_devices = bt.devices.filter(dev => dev.connected)
            const paired_devices = bt.devices.filter(dev => !dev.connected && dev.paired)
            const other_devices = bt.devices.filter(dev => !dev.connected && !dev.paired)
            return <MainArea>
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
                {(connected_devices.length > 0) &&
                    <Section>
                        <Header title="Connected devices" />
                        {connected_devices.map(device => <BluetoothDevice device={device} />)}
                    </Section>}
                {(paired_devices.length > 0) &&
                    <Section>
                        <Header title="Paired devices" />
                        {paired_devices.map(device => (<BluetoothDevice device={device} />))}
                    </Section>}
                {(other_devices.length > 0) &&
                    <Section>
                        <Header title="Other devices" />
                        {other_devices.map(device => <BluetoothDevice device={device} />)}
                    </Section>}
            </MainArea>
        }))
        return <box> {bind(inner)} </box>
    });

    (<window
        name={"BluetoothMenu"}
        className={"BluetoothMenu"}
        application={App}
        setup={self => bluetooth_menu_window = self}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        widthRequest={400}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.RIGHT}>
        <eventbox on_hover_lost={() => {
            BluetoothWindowToggle()
        }} >
            {bind(content)}
        </eventbox>
    </window>)
}

export default function BluetoothIcon(): JSX.Element {

    const icon_name = bind(bt, "is_powered").as(powered => powered ? "bluetooth-active" : "bluetooth-disabled")

    const devices_icons = bind(bt, "devices").as(devices =>
        devices
            .filter(device => device.connected)
            .map(device => (<icon icon={device.icon} />)))

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
        on_click={BluetoothWindowToggle}
    />
}
