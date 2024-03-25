{ inputs, ... }:

{
  perSystem =
    { inputs'
    , self'
    , lib
    , ...
    }: {
  	  packages = rec {
        cancellations_test_dna = inputs.hcInfra.outputs.lib.dna {
          dnaManifest = ./dna.yaml;
          holochain = inputs'.holochain;
          zomes = {
            cancellations_integrity = self'.packages.cancellations_integrity;
            cancellations = self'.packages.cancellations;

            # Dependencies
            profiles_integrity = inputs'.profiles.packages.profiles_integrity;
            profiles = inputs'.profiles.packages.profiles;
          };
        };

    	  cancellations_test_happ = inputs.hcInfra.outputs.lib.happ {
          holochain = inputs'.holochain;
          happManifest = ./happ.yaml;
          dnas = {
            # Override specific dnas here, e.g.:
            cancellations_test = cancellations_test_dna;
          };
        };
      };
  	};
}


