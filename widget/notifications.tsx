import { GLib } from "astal"
import { type EventBox } from "astal/gtk3/widget"
import { Astal, Gtk, Gdk } from "astal/gtk3"
import { type Subscribable } from "astal/binding"
import { Variable, bind, timeout } from "astal"
import Notifd from "gi://AstalNotifd"
import { Header, MainArea, Section } from "./semanticTags"

const TIMEOUT_DELAY = 5000

class NotifiationMap implements Subscribable {
    private map: Map<number, Gtk.Widget> = new Map()
    private var: Variable<Array<Gtk.Widget>> = Variable([])
    private notifiy() {
        this.var.set([...this.map.values()].reverse())
    }

    constructor() {
        const notifd = Notifd.get_default()

        notifd.connect("notified", (_, id) => {
            this.set(id, Notification({
                notification: notifd.get_notification(id)!,
                onHoverLost: () => this.delete(id),
                setup: () => timeout(TIMEOUT_DELAY, () => {
                })
            }))
        })
        notifd.connect("resolved", (_, id) => {
            this.delete(id)
        })
    }

    private set(key: number, value: Gtk.Widget) {
        this.map.get(key)?.destroy()
        this.map.set(key, value)
        this.notifiy()
    }

    private delete(key: number) {
        this.map.get(key)?.destroy()
        this.map.delete(key)
        this.notifiy()
    }

    get() {
        return this.var.get()
    }

    subscribe(callback: (list: Array<Gtk.Widget>) => void) {
        return this.var.subscribe(callback)
    }
}

export function NotificationPopups(gdkmonitor: Gdk.Monitor) {
    const { TOP, RIGHT } = Astal.WindowAnchor
    const notifs = new NotifiationMap()

    return <window
        className="notifications"
        width_request={400}
        gdkmonitor={gdkmonitor}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        anchor={TOP | RIGHT}>
        <box vertical>
            {bind(notifs)}
        </box>
    </window>
}

const isIcon = (icon: string) =>
    !!Astal.Icon.lookup_icon(icon)

const fileExists = (path: string) =>
    GLib.file_test(path, GLib.FileTest.EXISTS)

const time = (time: number, format = "%H:%M") => GLib.DateTime
    .new_from_unix_local(time)
    .format(format)!

const urgency = (n: Notifd.Notification) => {
    const { LOW, NORMAL, CRITICAL } = Notifd.Urgency
    return {
        [LOW]: "low",
        [CRITICAL]: "critical",
        [NORMAL]: "normal"
    }[n.urgency ?? NORMAL]
}

type Props = {
    setup(self: EventBox): void
    onHoverLost(self: EventBox): void
    notification: Notifd.Notification
}

export function Notification(props: Props) {
    const { notification: n, onHoverLost, setup } = props
    const { START, CENTER, END } = Gtk.Align

    return <eventbox
        setup={setup}
        onHoverLost={onHoverLost}>
        <MainArea className={`${urgency(n)}`}>
            <Header>
                {(n.appIcon || n.desktopEntry) && <icon
                    className="app-icon"
                    visible={Boolean(n.appIcon || n.desktopEntry)}
                    icon={n.appIcon || n.desktopEntry}
                />}
                <label
                    className="app-name"
                    halign={START}
                    truncate
                    label={n.appName || "Unknown"}
                />
                <label
                    className="time"
                    hexpand
                    halign={END}
                    label={time(n.time)}
                />
                <button className="close" onClicked={() => n.dismiss()}>
                    <icon icon="window-close-symbolic" />
                </button>
            </Header>
            <Gtk.Separator visible />
            <Section className={"content"}>
                {n.image && fileExists(n.image) && <box
                    valign={START}
                    className="image"
                    css={`background-image: url('${n.image}')`}
                />}
                {n.image && isIcon(n.image) && <box
                    expand={false}
                    valign={START}
                    className="icon-image">
                    <icon icon={n.image} expand halign={CENTER} valign={CENTER} />
                </box>}
                <box vertical>
                    <label
                        className="summary"
                        halign={START}
                        xalign={0}
                        label={n.summary}
                        truncate
                    />
                    {n.body && <label
                        className="body"
                        wrap
                        useMarkup
                        halign={START}
                        xalign={0}
                        justifyFill
                        label={n.body}
                    />}
                </box>
            </Section>
            {n.get_actions().length > 0 && <Section vertical spacing={5} homogeneous className={"actions"}>
                {n.get_actions().map(({ label, id }) => (
                    <button
                        hexpand
                        onClicked={() => n.invoke(id)}>
                        <label label={label} halign={CENTER} hexpand />
                    </button>
                ))}
            </Section>
            }
        </MainArea>
    </eventbox>
}
