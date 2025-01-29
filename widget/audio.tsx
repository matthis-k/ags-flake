import Wp from "gi://AstalWp"
import { App, Astal, Gtk } from "astal/gtk3"
import { Variable, bind } from "astal"
const wp = Wp.get_default()

function on_scroll(endpoint: Wp.Endpoint | null) {
    if (!endpoint) { return () => undefined }
    return (_: any, { delta_y }: { delta_y: number }) => {
        if (delta_y < 0) {
            endpoint?.set_volume(endpoint.volume - 0.05);
            endpoint?.set_mute(false);
        } else {
            endpoint?.set_volume(endpoint.volume + 0.05);
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
                                    max={props.overamp ? 1.5 : 1}
                                    value={volume}
                                    onDragged={({ value, dragging }) => {
                                        if (dragging) {
                                            ep?.set_volume(value);
                                            ep?.set_mute(false);
                                        }
                                    }} />
                            </box>
                        </eventbox>
                    </box>
            )
            return <box> {bind(inner)} </box>
        }

        let speakers_content = Variable.derive([speakers], speakers => {
            return <box vertical className={"subsection"}>
                <box><label label={"Speakers"} className={"header"} /></box>
                {speakers.length <= 0
                    ? <label label={"No speakers found"} />
                    : speakers.map(speaker => <Endpoint endpoint={speaker} overamp />)}
            </box >
        })

        let microphones_content = Variable.derive([microphones], microphones => {
            return <box vertical className={"subsection"}>
                <box><label label={"Microphones"} className={"header"} /></box>
                {microphones.length <= 0
                    ? <label label={"No microphones found"} />
                    : microphones.map(mic => <Endpoint endpoint={mic} />)}
            </box>
        })

        let streams_content = Variable.derive([streams], streams => {
            <box vertical className={"subsection"} >
                <box><label label={"Streams"} className={"header"} /></box>
                {streams.length <= 0
                    ? <label label={"No active audio streams"} />
                    : streams.map(stream => <Endpoint endpoint={stream} show_name={true} />)}
            </box >
        })

        content = Variable.derive([speakers_content, microphones_content, streams_content],
            (speakers_content, microphones_content, streams_content) => {
                return <box vertical>
                    {speakers_content}
                    {microphones_content}
                    {streams_content}
                </box>
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
            <box className="menu-main-body" vertical>
                {bind(content)}
            </box>
        </eventbox>
    </window>)
}


export default function AudioIcon() {
    if (wp == null || wp.audio == undefined) {
        return <box><icon icon="audio-volume-muted" /></box>
    }

    const tooltip = bind(wp.audio.default_speaker, "volume").as(volume => `Volume at ${Math.floor(volume * 100)}%`)
    const icon = bind(wp.audio.default_speaker, "volume_icon").as(icon => (<icon
        className={bind(wp.audio.default_speaker, "mute").as(muted => [`${muted ? "muted" : ""}`, "audio-icon"].join(" "))}
        icon={icon}
        tooltipMarkup={tooltip}
    />))

    return <button onClicked={AudioWindowToggle} onScroll={on_scroll(wp?.audio?.get_default_speaker())}>
        {icon}
    </button>
}
