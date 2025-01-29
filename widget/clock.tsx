import { GLib, Variable, bind } from "astal"

export default function Clock() {
    const time = Variable<string>("").poll(200, () => GLib.DateTime.new_now_local().format("%H:%M:%S")!)
    return <box
        className={["clock"].join(" ")}
        onDestroy={() => time.drop()}>
        <label label={bind(time)} />
    </box>
}

