{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

    astal = {
      url = "github:aylur/astal";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    ags = {
      url = "github:aylur/ags";
      inputs.nixpkgs.follows = "nixpkgs";
      inputs.astal.follows = "astal";
    };
  };

  outputs =
    {
      self,
      nixpkgs,
      ags,
      astal,
    }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      hyprshell = pkgs.stdenv.mkDerivation {
        name = "hyprshell";
        pname = "hyprshell";

        src = ./.;

        nativeBuildInputs = with pkgs; [
          wrapGAppsHook
          gobject-introspection
          ags.packages.${system}.default
        ];

        buildInputs =
          let
            astalLibs = astal.packages.${system};
          in
          [
            pkgs.glib
            pkgs.gjs
            astalLibs.apps
            astalLibs.astal3
            astalLibs.auth
            astalLibs.battery
            astalLibs.bluetooth
            astalLibs.cava
            astalLibs.greet
            astalLibs.hyprland
            astalLibs.io
            astalLibs.mpris
            astalLibs.network
            astalLibs.notifd
            astalLibs.powerprofiles
            astalLibs.river
            astalLibs.tray
            astalLibs.wireplumber
          ];

        installPhase = ''
          ags bundle app.ts $out/bin/my-shell
        '';

        preFixup = ''
          gappsWrapperArgs+=(
            --prefix PATH : ${
              pkgs.lib.makeBinPath ([
              ])
            }
          )
        '';
      };
    in
    {
      packages.${system} = rec {
        inherit hyprshell;
        default = hyprshell;
        ags = ags.packages.${system}.agsFull;
      };
      overlays.default =
        final: prev:
        let
          astalLibs = astal.packages.${system};
        in
        {
          inherit hyprshell;
          inherit astalLibs;
          ags = ags.packages.${system}.agsFull;
        };
    };
}
