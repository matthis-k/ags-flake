import { App, Astal, Gtk } from "astal/gtk3"
import { Variable, bind, timeout } from "astal"
import Bluetooth from "gi://AstalBluetooth"

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
            <box className="subsubsection">
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
            </box>
        </eventbox >
    }

    // TODO prettify this and add binding depth to bar
    const status_change_detector = Variable.derive([bind(bt, "devices")], devs => devs.flatMap(dev => [bind(dev, "paired"), bind(dev, "connecting"), bind(dev, "connected")]))

    const content = bind(status_change_detector).as(status_change_detector => {
        let inner = Variable.derive(status_change_detector, (_ => {
            const connected_devices = bt.devices.filter(dev => dev.connected)
            const paired_devices = bt.devices.filter(dev => !dev.connected && dev.paired)
            const other_devices = bt.devices.filter(dev => !dev.connected && !dev.paired)
            return <box vertical className="menu-main-body" >
                <box className="header">
                    <label label="Bluetooth" className="header" />
                    <box hexpand />
                    <switch vexpand={false} className="switch" active={bind(bt, "is_powered")} on_state_set={(_, active) => {
                        if (active != bt.is_powered) {
                            bt.toggle()
                            if (bt.is_powered) {
                                bt.get_adapters().forEach(adapter => adapter.start_discovery())
                            }
                        }
                    }} />
                </box>
                {(connected_devices.length > 0) && <box vertical className="subsection">
                    <label label="Connected devices" className="subheader" />
                    {connected_devices.map(device => <BluetoothDevice device={device} />)}
                </box>}
                {(paired_devices.length > 0) && <box vertical className="subsection">
                    <label label="Paired devices" className="subheader" />
                    {paired_devices.map(device => (<BluetoothDevice device={device} />))}
                </box>}
                {(other_devices.length > 0) && <box vertical className="subsection">
                    <label label="Other devices" className="subheader" />
                    {other_devices.map(device => <BluetoothDevice device={device} />)}
                </box>}
            </box>
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

    const icon = bind(bt, "is_powered").as(powered =>
        (<icon icon={powered ? "bluetooth-active" : "bluetooth-disabled"} />))

    const devices_icons = bind(bt, "devices").as(devices =>
        devices
            .filter(device => device.connected)
            .map(device => (<icon icon={device.icon} />)))

    const shown_icons = Variable.derive([icon, devices_icons], (icon, devices_icons) =>
        devices_icons.length > 0 ? devices_icons : [icon])

    const tooltip = Variable.derive([bind(bt, "is_powered"), bind(bt, "devices")], (is_powered, devices) => {
        let connected_devices = devices.filter(device => device.connected)
        if (connected_devices.length == 0) {
            return is_powered ? "No connected bluetooth devices" : "Bluetooth is disabled"
        }
        return "Connected devices:\n" + connected_devices.map(device => `${device.name}`).join("\n")
    })

    // TODO add clicking stuff (connect/disconnect)
    return <button onClicked={BluetoothWindowToggle} >
        <box tooltipMarkup={bind(tooltip)} >
            {bind(shown_icons)}
        </box>
    </button>
}
