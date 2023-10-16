use hdk::prelude::*;
use holochain::sweettest::*;

use hc_zome_cancellations_integrity::*;

pub async fn sample_cancellation_1(conductor: &SweetConductor, zome: &SweetZome) -> Cancellation {
    Cancellation {
        reason: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.".to_string(),
        cancelled_hash: ::fixt::fixt!(ActionHash),
    }
}

pub async fn sample_cancellation_2(conductor: &SweetConductor, zome: &SweetZome) -> Cancellation {
    Cancellation {
        reason: "Lorem ipsum 2".to_string(),
        cancelled_hash: ::fixt::fixt!(ActionHash),
    }
}

pub async fn create_cancellation(
    conductor: &SweetConductor,
    zome: &SweetZome,
    cancellation: Cancellation,
) -> Record {
    let record: Record = conductor
        .call(zome, "create_cancellation", cancellation)
        .await;
    record
}
