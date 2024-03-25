{
  description = "Template for Holochain app development";
  
  inputs = {
    nixpkgs.follows = "holochain/nixpkgs";

    versions.url = "github:holochain/holochain?dir=versions/weekly";

    holochain = {
      url = "github:holochain/holochain";
      inputs.versions.follows = "versions";
    };

    scaffolding.url = "github:holochain-open-dev/templates";
    hcInfra.url = "github:holochain-open-dev/infrastructure";

    # Holochain dependencies (zomes, DNAs and hApps)
    profiles.url = "github:holochain-open-dev/profiles/nixify";
  };

  nixConfig = {
    extra-substituters = [
      "https://holochain-open-dev.cachix.org"
    ];	
  	extra-trusted-public-keys = [
  	  "holochain-open-dev.cachix.org-1:3Tr+9in6uo44Ga7qiuRIfOTFXog+2+YbyhwI/Z6Cp4U="
    ];
  };

  outputs = inputs @ { ... }:
    inputs.holochain.inputs.flake-parts.lib.mkFlake
      {
        inherit inputs;
        specialArgs.rootPath = ./.;
      }
      {
        imports = [
          ./zomes/coordinator/cancellations/zome.nix
          ./zomes/integrity/cancellations/zome.nix
          ./workdir/happ.nix
        ];
      
        systems = builtins.attrNames inputs.holochain.devShells;
        perSystem =
          { inputs'
          , config
          , pkgs
          , system
          , lib
          , ...
          }: {
            devShells.default = pkgs.mkShell {
              inputsFrom = [ inputs'.holochain.devShells.holonix ];

              packages = with pkgs; [
                nodejs_20
              ] ++ [
                # inputs'.scaffolding.packages.hc-scaffold-app-template
                inputs'.hcInfra.packages.pnpm
                inputs'.hcInfra.packages.sync-npm-git-dependencies-with-nix
              ];
              
              shellHook = ''
                sync-npm-git-dependencies-with-nix
              '';
            };
          };
      };
}
