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
        ags = {
          astal = ags.inputs.astal.packages.${system}.default;
          ags = ags.packages.${system}.agsFull;
          docs = ags.packages.${system}.docs;
          io = ags.packages.${system}.io;
          gjs = ags.packages.${system}.gjs;
          astal3 = ags.packages.${system}.astal3;
          astal4 = ags.packages.${system}.astal4;
          apps = ags.packages.${system}.apps;
          auth = ags.packages.${system}.auth;
          battery = ags.packages.${system}.battery;
          bluetooth = ags.packages.${system}.bluetooth;
          cava = ags.packages.${system}.cava;
          greet = ags.packages.${system}.greet;
          hyprland = ags.packages.${system}.hyprland;
          mpris = ags.packages.${system}.mpris;
          network = ags.packages.${system}.network;
          notifd = ags.packages.${system}.notifd;
          powerprofiles = ags.packages.${system}.powerprofiles;
          river = ags.packages.${system}.river;
          tray = ags.packages.${system}.tray;
          wireplumber = ags.packages.${system}.wireplumber;
        };
      };
    };
}
