import Apps from "gi://AstalApps"
import { App, Astal, astalify, ConstructProps, Gdk, Gtk } from "astal/gtk3"
import { GObject, Variable } from "astal"
import { Header, MainArea, Section } from "./semanticTags"

class FlowBox extends astalify(Gtk.FlowBox) {
    static { GObject.registerClass(this) }

    constructor(props: ConstructProps<
        FlowBox,
        Gtk.FlowBox.ConstructorProps,
        { onColorSet: [] } // signals of Gtk.ColorButton have to be manually typed
    >) {
        super(props as any)
    }
}

const MAX_ITEMS = 36
const APP_BTN_WIDTH = 160
const APP_BTN_HEIGHT = 100

function hide() {
    App.get_window("launcher")!.hide()
}

function AppButton({ app }: { app: Apps.Application }) {
    const tooltipMarkup = `<b>${app.name || 'Unknown App'}</b>\n` +
        `<span size="small" >${app.description || 'No description available'}</span>\n\n` +
        `<b>Executable:</b> ${app.executable || 'Unavailable'}\n` +
        `<b>Entry:</b> ${app.entry || 'Unavailable'}\n` +
        `<b>Keywords:</b> ${(app.keywords && app.keywords.length > 0) ? app.keywords.join(", ") : 'Unavailable'}\n` +
        `<b>Categories:</b> ${(app.categories && app.categories.length > 0) ? app.categories.join(", ") : 'Unavailable'}`;

    return <Section
        hexpand={false} vexpand={false} width_request={APP_BTN_WIDTH} height_request={APP_BTN_HEIGHT}
    >
        <button
            className="AppButton"
            onClicked={() => { hide(); app.launch() }}>
            <box vertical
                tooltip_markup={tooltipMarkup}
                hexpand={false} vexpand={false}
            >
                <icon icon={app.iconName} css="font-size: 3rem;" />
                <box valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} vertical>
                    <label
                        className="name"
                        truncate
                        xalign={0}
                        label={app.name}
                        hexpand={false} vexpand={false}
                        wrap
                        max_width_chars={16}
                    />
                </box>
            </box>
        </button>
    </Section>
}

export default function Applauncher() {
    const { CENTER, START } = Gtk.Align
    const apps = new Apps.Apps()
    const width = Variable(1000)

    const text = Variable("")
    const list = text(text => apps.fuzzy_query(text).slice(0, MAX_ITEMS))
    const onEnter = () => {
        apps.fuzzy_query(text.get())?.[0].launch()
        hide()
    }

    return <window
        name="launcher"
        className="hyprshell-launcher"
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.EXCLUSIVE}
        application={App}
        marginTop={24}
        onShow={(self) => {
            text.set("")
            width.set(self.get_current_monitor().workarea.width)
        }}
        onKeyPressEvent={(self, event: Gdk.Event) => {
            if (event.get_keyval()[1] === Gdk.KEY_Escape)
                self.hide()
        }}>
        <box>
            <eventbox vexpand hexpand on_click={hide} />
            <box hexpand vexpand vertical>
                <MainArea>
                    <box width_request={width(w => w / 2)} vertical spacing={12} halign={CENTER} valign={START} >
                        <entry className="entry"
                            height_request={50} width_request={300} halign={CENTER} valign={CENTER}
                            placeholderText="Search"
                            text={text()}
                            onChanged={self => text.set(self.text)}
                            onActivate={onEnter}
                            primary_icon_name={"system-search"}
                        />
                        <FlowBox
                            column_spacing={6}
                            row_spacing={6}
                            max_children_per_line={6}
                            homogeneous
                            hexpand={false}
                            vexpand={false}
                            halign={CENTER}
                        >
                            {list.as(list => list.map(app => (
                                <AppButton app={app} />
                            )))}
                        </FlowBox>
                        <box halign={CENTER} className="not-found" vertical
                            visible={list.as(l => l.length === 0)}>
                            <icon icon="system-search-symbolic" />
                            <label label="No match found" />
                        </box>
                    </box>
                </MainArea>
                <eventbox vexpand hexpand on_click={hide} />
            </box>
            <eventbox vexpand hexpand on_click={hide} />
        </box>
    </window >
}
