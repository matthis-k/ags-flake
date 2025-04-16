import { bind } from "astal"
import Tray from "gi://AstalTray"
import { multi_bind } from "../lib/utils"
const tray = Tray.get_default()

export function SysTray() {
    return <box className="sys-tray" spacing={5}>
        {bind(tray, "items").as(items => items.map(item => {
            return <box>
                {bind(item, "is_menu").as(is_menu => {
                    const tt = multi_bind(item, ["tooltip_markup", "tooltip", "title"])(({ title, tooltip_markup, tooltip }) => {
                        let markup = (title ? `<b>${title}</b>` : "") +
                            `${tooltip_markup ? `\n${tooltip_markup}` : tooltip ? `\n<span>${tooltip}</span>` : ""}`;
                        return markup;
                    });
                    return is_menu
                        ? <menubutton
                            tooltip_markup={bind(item, "tooltipMarkup")}
                            use_popover={false}
                            actionGroup={bind(item, "actionGroup").as(ap => ["dbusmenu", ap])}
                            menu_model={bind(item, "menuModel")}>
                            <icon gicon={bind(item, "gicon")} />
                        </menubutton>
                        :
                        <button tooltip_markup={tt}>
                            <icon gicon={bind(item, "gicon")} />
                        </button>
                })}

            </box>
        }))}
    </box>
}
