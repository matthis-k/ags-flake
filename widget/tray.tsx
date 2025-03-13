import { bind } from "astal"
import Tray from "gi://AstalTray"
const tray = Tray.get_default()

export function SysTray() {
    return <box className="sys-tray" spacing={5}>
        {bind(tray, "items").as(items => items.map(item => (
            <menubutton
                tooltip_markup={bind(item, "tooltipMarkup")}
                use_popover={false}
                actionGroup={bind(item, "actionGroup").as(ag => ["dbusmenu", ag])}
                menu_model={bind(item, "menuModel")}>
                <icon gicon={bind(item, "gicon")} />
            </menubutton>
        )))}
    </box>
}
