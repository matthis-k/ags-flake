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
      agsOut = ags.outputs;
      astalPatched = agsOut.packages.${system}.astal.overrideAttrs (old: {
        patches = (old.patches or [ ]) ++ [
          (pkgs.fetchpatch {
            url = "https://patch-diff.githubusercontent.com/raw/Aylur/astal/pull/13.patch";
            hash = "sha256-0000000000000000000000000000000000000000000000000000";
          })
        ];
      });
      agsPatched = agsOut // {
        packages = agsOut.packages.${system} // {
          astal = astalPatched;
        };
      };
      hyprshell =
        (agsPatched.lib.bundle {
          inherit pkgs;
          src = ./.;
          name = "hyprshell"; # name of executable
          entry = "app.ts";
          gtk4 = false;

          extraPackages = with pkgs; [
            gtksourceview
            webkitgtk
            accountsservice
            agsPatched.packages.docs
            agsPatched.packages.io
            agsPatched.packages.gjs
            agsPatched.packages.astal3
            agsPatched.packages.astal4
            agsPatched.packages.apps
            agsPatched.packages.auth
            agsPatched.packages.battery
            agsPatched.packages.bluetooth
            agsPatched.packages.cava
            agsPatched.packages.greet
            agsPatched.packages.hyprland
            agsPatched.packages.mpris
            agsPatched.packages.network
            agsPatched.packages.notifd
            agsPatched.packages.powerprofiles
            agsPatched.packages.river
            agsPatched.packages.tray
            agsPatched.packages.wireplumber
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
        ags = {
          ags = agsPatched.packages.agsFull;
          docs = agsPatched.packages.docs;
          io = agsPatched.packages.io;
          gjs = agsPatched.packages.gjs;
          astal3 = agsPatched.packages.astal3;
          astal4 = agsPatched.packages.astal4;
          apps = agsPatched.packages.apps;
          auth = agsPatched.packages.auth;
          battery = agsPatched.packages.battery;
          bluetooth = agsPatched.packages.bluetooth;
          cava = agsPatched.packages.cava;
          greet = agsPatched.packages.greet;
          hyprland = agsPatched.packages.hyprland;
          mpris = agsPatched.packages.mpris;
          network = agsPatched.packages.network;
          notifd = agsPatched.packages.notifd;
          powerprofiles = agsPatched.packages.powerprofiles;
          river = agsPatched.packages.river;
          tray = agsPatched.packages.tray;
          wireplumber = agsPatched.packages.wireplumber;
        };
      };

      overlays.default = final: prev: {
        hyprshell = hyprshell;
        ags = {
          ags = agsPatched.packages.agsFull;
          docs = agsPatched.packages.docs;
          io = agsPatched.packages.io;
          gjs = agsPatched.packages.gjs;
          astal3 = agsPatched.packages.astal3;
          astal4 = agsPatched.packages.astal4;
          apps = agsPatched.packages.apps;
          auth = agsPatched.packages.auth;
          battery = agsPatched.packages.battery;
          bluetooth = agsPatched.packages.bluetooth;
          cava = agsPatched.packages.cava;
          greet = agsPatched.packages.greet;
          hyprland = agsPatched.packages.hyprland;
          mpris = agsPatched.packages.mpris;
          network = agsPatched.packages.network;
          notifd = agsPatched.packages.notifd;
          powerprofiles = agsPatched.packages.powerprofiles;
          river = agsPatched.packages.river;
          tray = agsPatched.packages.tray;
          wireplumber = agsPatched.packages.wireplumber;
        };
      };
    };
}
