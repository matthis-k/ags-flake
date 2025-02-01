import Wp from "gi://AstalWp"
import { App, Astal, Gtk } from "astal/gtk3"
import { Variable, bind } from "astal"
import StatusIcon from "./StatusIcon"
import { Header, MainArea, Section } from "./popupMenu"
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

let audio_menu_window: Gtk.Window | null

function AudioWindowToggle() {
    if (audio_menu_window) {
        App.remove_window(audio_menu_window)
        audio_menu_window.close()
        audio_menu_window = null
        return
    }

    let content = Variable(<box><label label={"No audio detected"} /></box>)

    if (wp) {
        const speakers = bind(wp.audio, "speakers");
        const microphones = bind(wp.audio, "microphones");
        const streams = bind(wp.audio, "streams");

        function Endpoint(props: { endpoint: Wp.Endpoint, overamp?: boolean, show_name?: boolean }) {
            const ep = props.endpoint
            const inner = Variable.derive([bind(ep, "name"), bind(ep, "description"), bind(ep, "volume"), bind(ep, "mute"), bind(ep, "volume_icon")],
                (name, desc, volume, mute, volume_icon) =>
                    <box className={[mute ? "muted" : "", "subsubsection"].join(" ")}>
                        <button onClick={() => ep.set_mute(!ep.get_mute())}>
                            <icon className="device-icon" css={"font-size: 2rem"} icon={volume_icon} />
                        </button>
                        <eventbox onScroll={on_scroll(ep)}>
                            <box vertical hexpand >
                                <label label={props.show_name ? name : desc} truncate />
                                <slider
                                    className="slider"
                                    drawValue={false}
                                    min={0}
                                    max={1}
                                    value={volume}
                                    onDragged={({ value }) => {
                                        ep?.set_volume(value);
                                        ep?.set_mute(false);
                                    }} />
                            </box>
                        </eventbox>
                    </box>
            )
            return <box> {bind(inner)} </box>
        }

        let speakers_content = Variable.derive([speakers], speakers => {
            return <Section>
                <Header title="Speakers" />
                {speakers.length <= 0
                    ? <label label={"No speakers found"} />
                    : speakers.map(speaker => <Endpoint endpoint={speaker} />)}
            </Section >
        })

        let microphones_content = Variable.derive([microphones], microphones => {
            return <Section>
                <Header title="Microphones" />
                {microphones.length <= 0
                    ? <label label={"No microphones found"} />
                    : microphones.map(mic => <Endpoint endpoint={mic} />)}
            </Section>
        })

        let streams_content = Variable.derive([streams], streams => {
            <Section>
                <Header title="Streams" />
                {streams.length <= 0
                    ? <label label={"No active audio streams"} />
                    : streams.map(stream => <Endpoint endpoint={stream} show_name={true} />)}
            </Section >
        })

        content = Variable.derive([speakers_content, microphones_content, streams_content],
            (speakers_content, microphones_content, streams_content) => {
                return <MainArea>
                    {speakers_content}
                    {microphones_content}
                    {streams_content}
                </MainArea >
            })
    }




    (<window
        name={"AudioMenu"}
        className={"AudioMenu"}
        application={App}
        setup={self => audio_menu_window = self}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
        widthRequest={400}
        anchor={Astal.WindowAnchor.TOP
            | Astal.WindowAnchor.RIGHT}>
        <eventbox on_hover_lost={() => {
            AudioWindowToggle()
        }} >
            {bind(content)}
        </eventbox>
    </window>)
}


export default function AudioIcon() {
    if (wp == null || wp.audio == undefined) {
        return <box><icon icon="audio-volume-muted" /></box>
    }

    const tooltip = bind(wp.audio.default_speaker, "volume").as(volume => `Volume at ${Math.floor(volume * 100)}%`)
    const icon = bind(wp.audio.default_speaker, "volume_icon")
    const classes = bind(wp.audio.default_speaker, "mute").as(muted => [`${muted ? "muted" : ""}`, "audio-icon"].join(" "))

    return <StatusIcon
        tooltip={tooltip}
        on_click={AudioWindowToggle}
        on_scroll={on_scroll(wp?.audio?.get_default_speaker())}
        icon_name={bind(icon)}
    />
}
