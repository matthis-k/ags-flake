{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    ags.url = "github:aylur/ags";
  };

  outputs =
    {
      self,
      nixpkgs,
      ags,
    }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      hyprshell =
        (ags.lib.bundle {
          inherit pkgs;
          src = ./.;
          name = "hyprshell"; # name of executable
          entry = "app.ts";
          gtk4 = false;

          extraPackages = with pkgs; [
            gtksourceview
            webkitgtk
            accountsservice
            ags.packages.${system}.docs
            ags.packages.${system}.io
            ags.packages.${system}.gjs
            ags.packages.${system}.astal3
            ags.packages.${system}.astal4
            ags.packages.${system}.apps
            ags.packages.${system}.auth
            ags.packages.${system}.battery
            ags.packages.${system}.bluetooth
            ags.packages.${system}.cava
            ags.packages.${system}.greet
            ags.packages.${system}.hyprland
            ags.packages.${system}.mpris
            ags.packages.${system}.network
            ags.packages.${system}.notifd
            ags.packages.${system}.powerprofiles
            ags.packages.${system}.river
            ags.packages.${system}.tray
            ags.packages.${system}.wireplumber
          ];
        }).overrideAttrs
          (old: {
            propagatedBuildInputs = (old.propagatedBuildInputs or [ ]) ++ [
            ];
          });
    in
    rec {
      packages.${system} = {
        default = hyprshell;
        hyprshell = hyprshell;
      };

      overlays.default = final: prev: {
        hyprshell = hyprshell;
      };
    };
}
