import { App } from "astal/gtk3"
import style from "./style.scss"
import launcherStyle from "./launcherStyle.scss"
import Bar from "./widget/Bar"
import Wallpaper from "./widget/Wallpaper"
import Applauncher from "./widget/appLauncher"

App.start({
    instanceName: "hyprshell",
    css: style,
    main() {
        App.get_monitors().map(Bar)
        // App.get_monitors().map(Wallpaper)
    },
    requestHandler(request: string, res: (response: any) => void) {
        if (request == "launcher") {
            Applauncher()
        }
    },
})
