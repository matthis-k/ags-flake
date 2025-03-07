import { Variable, bind } from "astal"
import Apps from "gi://AstalApps"
import Hyprland from "gi://AstalHyprland"
const hyprland = Hyprland.get_default()
const apps = new Apps.Apps({
    name_multiplier: 2,
    entry_multiplier: 1,
    executable_multiplier: 0,
    description_multiplier: 0,
    keywords_multiplier: 0,
    categories_multiplier: 0,
})

type HyprlandState = {
    workspaces: Hyprland.Workspace[];
    focused_workspace: Hyprland.Workspace;
    clients: Hyprland.Client[];
    focused_client: Hyprland.Client;
    monitors: Hyprland.Monitor[];
    focused_monitor: Hyprland.Monitor;
    cursor_pos: Hyprland.Position;
    binds: Hyprland.Bind[];
}

export default function HyprlandWorkspaces(): JSX.Element {
    let hyprland_state: Variable<HyprlandState> = Variable.derive([
        bind(hyprland, "workspaces"), bind(hyprland, "focused_workspace"),
        bind(hyprland, "clients"), bind(hyprland, "focused_client"),
        bind(hyprland, "monitors"), bind(hyprland, "focused_monitor"),
        bind(hyprland, "cursor_position"), bind(hyprland, "binds")
    ], (workspaces, focused_workspace,
        clients, focused_client,
        monitors, focused_monitor,
        cursor_pos, binds) => {
        return {
            workspaces: workspaces, focused_workspace: focused_workspace,
            clients: clients, focused_client: focused_client,
            monitors: monitors, focused_monitor: focused_monitor,
            cursor_pos: cursor_pos, binds: binds
        }
    })

    function HyprlandWorkspace(props: { workspace: Hyprland.Workspace, state: HyprlandState }): JSX.Element {
        const ws = props.workspace
        const state = props.state

        let clients = state.clients.filter(client => ws.id == client.workspace.id).sort((a, b) => a.class > b.class ? 1 : -1)

        return <box className={["workspace", state.focused_workspace === ws ? "focused-workspace" : "", clients.length == 0 ? "empty" : ""].join(" ")}>
            <button className="workspace-button" label={ws.id.toString()} onClicked={() => ws.focus()} />
            {clients.map(client => (
                <button className={["client", state.focused_client === client ? "focused-client" : ""].join(" ")}
                    onClicked={() => client.focus()} >
                    <icon icon={bind(client, "initialClass").as((init_class) => apps.exact_query(init_class)[0]?.icon_name || init_class)} />
                </button>
            ))}
        </box>

    }

    return <box className={"workspaces"} spacing={10} >
        {bind(hyprland_state).as(state => state.workspaces
            .sort((a, b) => a.id - b.id)
            .map(ws => (<HyprlandWorkspace workspace={ws} state={hyprland_state.get()} />))
        )}
    </box >
}
