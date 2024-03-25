{ inputs, rootPath, ... }:

{
  perSystem =
    { inputs'
    , config
    , pkgs
    , system
    , lib
    , options
    , ...
    }: {
      packages.cancellations_integrity = inputs.hcInfra.outputs.lib.rustZome {
        workspacePath = rootPath;
        holochain = inputs'.holochain;
        crateCargoToml = ./Cargo.toml;
      };
  	};
}


