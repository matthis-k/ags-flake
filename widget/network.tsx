import { Variable, bind } from "astal"
import Network from "gi://AstalNetwork"


export default function NetworkIcon() {
    const network = Network.get_default()

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
                return "Connected to LAN"
            default:
                return "No connection"
        }
    })

    // TODO add clicking stuff (connect/disconnect)
    return <box>
        <icon icon={bind(icon)} tooltipMarkup={bind(tooltip)} />
    </box>
}


