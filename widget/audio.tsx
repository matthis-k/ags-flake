import Wp from "gi://AstalWp"
import { Gtk } from "astal/gtk3"
import { Variable, bind } from "astal"
import StatusIcon from "./StatusIcon"
import { Header, MainArea, Section } from "./semanticTags"
import { dashboard_toggle_content } from "./dashboard"
const wp = Wp.get_default()

function on_scroll(endpoint: Wp.Endpoint | null) {
    if (!endpoint) { return () => undefined }
    return (_: any, { delta_y }: { delta_y: number }) => {
        if (delta_y < 0) {
            endpoint?.set_volume(Math.max(0, endpoint.volume - 0.05));
            endpoint?.set_mute(false);
        } else {
            endpoint?.set_volume(Math.min(1.0, endpoint.volume + 0.05));
            endpoint?.set_mute(false);
        }
    }
}

function Endpoint(props: { endpoint: Wp.Endpoint, overamp?: boolean, show_name?: boolean }) {
    const ep = props.endpoint
    const state = Variable.derive([
        bind(ep, "name"),
        bind(ep, "description"),
        bind(ep, "volume"),
        bind(ep, "mute"),
        bind(ep, "volume_icon")
    ], (name, desc, vol, mute, icon) => ({
        vol,
        name,
        desc,
        mute,
        icon,
    }))

    return <box className={state(s => [s.mute ? "muted" : "", "subsubsection"].join(" "))}>
        <button onClick={() => ep.set_mute(!ep.get_mute())}>
            <icon className="device-icon" css={"font-size: 2rem"} icon={state(s => s.icon)} />
        </button>
        <eventbox onScroll={on_scroll(ep)}>
            <box vertical hexpand >
                <label label={state(s => props.show_name ? s.name : s.desc)} truncate />
                <slider
                    className="slider"
                    drawValue={false}
                    value={state(s => s.vol)}
                    min={0}
                    max={1}
                    onDragged={({ value }) => {
                        ep?.set_volume(value)
                    }}
                />
            </box>
        </eventbox>
    </box>
}

function dashboard_toggle_audio() {
    let content: Gtk.Widget
    if (!wp)
        content = <box><label label={"No audio detected"} /></box>
    else {
        content = <MainArea widthRequest={400}>
            <Section>
                <Header title="Speakers" />
                {bind(wp.audio, "speakers").as(speakers => speakers.length <= 0
                    ? <label label={"No speakers found"} />
                    : speakers.map(speaker => <Endpoint endpoint={speaker} />))}
            </Section >
            <Section>
                <Header title="Microphones" />
                {bind(wp.audio, "microphones").as(mics => mics.length <= 0
                    ? <label label={"No microphones found"} />
                    : mics.map(mic => <Endpoint endpoint={mic} />))}
            </Section >
            <Section>
                <Header title="Streams" />
                {bind(wp.audio, "streams").as(streams => streams.length <= 0
                    ? <label label={"No audio playing"} />
                    : streams.map(stream => <Endpoint endpoint={stream} show_name />))}
            </Section >
        </MainArea>
    }
    dashboard_toggle_content("audio", content)
}


export default function AudioIcon() {
    if (wp == null || wp.audio == undefined) {
        return <box><icon icon="audio-volume-muted" /></box>
    }

    const tooltip = bind(wp.audio.default_speaker, "volume").as(volume => `Volume at ${Math.floor(volume * 100)}%`)
    const icon = bind(wp.audio.default_speaker, "volume_icon")
    const classes = bind(wp.audio.default_speaker, "mute").as(muted => [`${muted ? "muted" : ""}`, "audio-icon"].join(" "))

    return <StatusIcon
        className={classes}
        tooltip={tooltip}
        on_click={dashboard_toggle_audio}
        on_scroll={on_scroll(wp?.audio?.get_default_speaker())}
        icon_name={bind(icon)}
    />
}
