import Battery from "gi://AstalBattery"
import PowerProfiles from "gi://AstalPowerProfiles"
import { App, Astal, Gtk } from "astal/gtk3"
import { Variable, bind } from "astal"
import { LevelBar } from "astal/gtk3/widget"
import StatusIcon from "./StatusIcon"
import { Header, MainArea, Section } from "./popupMenu"

const battery = Battery.get_default()
const power_profiles = PowerProfiles.get_default()

let battery_menu_window: Gtk.Window | null

function BatteryWindowToggle() {
    if (battery_menu_window) {
        App.remove_window(battery_menu_window)
        battery_menu_window.close()
        battery_menu_window = null
        return
    }

    function cycleProfiles() {
        const cur = power_profiles.active_profile
        const profiles = power_profiles.get_profiles().map(p => p.profile)
        let cur_profile_idx = profiles.indexOf(cur)
        if (!cur_profile_idx) { cur_profile_idx = 0 }
        power_profiles.set_active_profile(profiles[(cur_profile_idx + 1) % profiles.length])
    }

    const status_subsection = Variable.derive([
        bind(battery, "percentage"),
        bind(battery, "charging"),
        bind(battery, "time_to_full"),
        bind(battery, "time_to_empty"),
    ], (percentage, charging, time_to_full, time_to_empty) => {
        let charging_text = charging ? "Charging" : "Discharging"
        let percentage_int = Math.floor(percentage * 100)
        let eta = charging ? time_to_full : time_to_empty
        let hours = Math.floor(eta / 60 / 60)
        let minutes = (Math.floor((eta / 60) % 60))

        return (<Section>
            <Header title="Status" />
            <label label={`${charging_text} at ${percentage_int}%`} />
            <LevelBar className="levelbar" max_value={1} min_value={0} value={percentage} />
            <label label={`${charging ? "Full" : "Empty"} in ~${hours}h${minutes} m`} />
        </Section>)
    })

    return <window
        name={"BatteryMenu"}
        className={"BatteryMenu"}
        application={App}
        setup={self => battery_menu_window = self}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.RIGHT}>
        <eventbox on_hover_lost={() => {
            BatteryWindowToggle()
        }} >
            <MainArea>
                <Header title="Battery" />
                {bind(status_subsection)}
                <Section>
                    <button onClicked={cycleProfiles}
                        className={bind(power_profiles, "active_profile")}>
                        <box>
                            <icon
                                icon={bind(power_profiles, "icon_name")} 
                                css={"font-size: 3rem;"}
                                className={bind(power_profiles, "active_profile").as(active_profile =>
                                    ["power-profiles-icon", active_profile].join(" "))} />
                            <box vertical valign={Gtk.Align.CENTER}>
                                <Header title={"Power profile"} />
                                <label label={bind(power_profiles, "activeProfile")} />
                            </box>
                        </box>
                    </button>
                </Section>
            </MainArea>
        </eventbox>
    </window>
}

export default function BatteryIcon(): JSX.Element {
    const tooltip = Variable.derive([
        bind(battery, "percentage"),
        bind(battery, "charging"),
        bind(battery, "time_to_full"),
        bind(battery, "time_to_empty"),
    ], (percentage, charging, time_to_full, time_to_empty) => {
        let charging_text = charging ? "Charging" : "Discharging"
        let percentage_int = Math.floor(percentage * 100)
        let eta = charging ? time_to_full : time_to_empty
        let hours = Math.floor(eta / 60 / 60)
        let minutes = (Math.floor((eta / 60) % 60))

        return `<span font_weight="bold" font_size="larger">${charging_text} at ${percentage_int}%</span>\n` +
            `${charging ? "Full" : "Empty"} in ~${hours}h${minutes}m`
    })

    const thresholds = [
        { v: 0.1, c: "critical" },
        { v: 0.2, c: "low" },
        { v: 0.9, c: "" },
        { v: 100, c: "high" }
    ]

    const classes = Variable.derive([
        bind(battery, "percentage"),
        bind(battery, "charging")
    ], (percentage, charging) => [
        "battery",
        charging ? "charging" : "discharging",
        (thresholds.find((threshold) => threshold.v >= percentage) || { c: "" }).c
    ].join(" "))

    const icon = Variable.derive([
        bind(battery, "percentage"),
        bind(battery, "charging")
    ], (percentage, charging) => {
        let percentage_int = Math.floor((percentage * 100) / 10) * 10
        return `battery-${percentage_int == 100 ? "full" : `level-${percentage_int}`
            }-${percentage_int < 100 && charging ? "charging-" : ""}symbolic`
    })


    return <StatusIcon
        className={bind(classes)}
        icon_name={bind(icon)}
        tooltip={bind(tooltip)}
        on_click={BatteryWindowToggle}
    />
}

