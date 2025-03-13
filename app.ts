import { App } from "astal/gtk3"
import style from "./style.scss"
import Bar from "./widget/Bar"
import Wallpaper from "./widget/Wallpaper"
import Applauncher from "./widget/appLauncher"
import { DASHBOARD_WIN } from "./widget/dashboard"

App.start({
    instanceName: "hyprshell",
    css: style,
    main() {
        App.get_monitors().map(Bar)
        DASHBOARD_WIN()
    },
    requestHandler(request: string, res: (response: any) => void) {
        if (request == "launcher") {
            Applauncher()
        }
    },
})
