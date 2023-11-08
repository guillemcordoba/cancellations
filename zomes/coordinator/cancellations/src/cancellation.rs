use hc_zome_cancellations_integrity::*;
use hdk::prelude::*;

#[hdk_extern]
pub fn create_cancellation(cancellation: Cancellation) -> ExternResult<Record> {
    let cancellation_hash = create_entry(&EntryTypes::Cancellation(cancellation.clone()))?;
    create_link(
        cancellation.cancelled_hash.clone(),
        cancellation_hash.clone(),
        LinkTypes::Cancellations,
        (),
    )?;
    let record = get(cancellation_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest(String::from(
            "Could not find the newly created Cancellation"
        ))
    ))?;

    Ok(record)
}

#[hdk_extern]
pub fn get_cancellation_deletions(
    cancellation_hash: ActionHash,
) -> ExternResult<Vec<SignedActionHashed>> {
    let details = get_details(cancellation_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("NOT_FOUND".into())))?;
    let record_details = match details {
        Details::Entry(_) => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed details".into()
        ))),
        Details::Record(record_details) => Ok(record_details),
    }?;
    Ok(record_details.deletes)
}

#[hdk_extern]
fn get_latest_cancellation(cancellation_hash: ActionHash) -> ExternResult<Record> {
    let details = get_details(cancellation_hash, GetOptions::default())?
        .ok_or(wasm_error!(WasmErrorInner::Guest("NOT_FOUND".into())))?;
    let record_details = match details {
        Details::Entry(_) => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed details".into()
        ))),
        Details::Record(record_details) => Ok(record_details),
    }?;
    match record_details.updates.last() {
        Some(update) => get_latest_cancellation(update.action_address().clone()),
        None => Ok(record_details.record),
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateCancellationInput {
    pub previous_cancellation_hash: ActionHash,
    pub updated_reason: String,
}
#[hdk_extern]
pub fn update_cancellation(input: UpdateCancellationInput) -> ExternResult<Record> {
    let record = get_latest_cancellation(input.previous_cancellation_hash.clone())?;

    let Some(entry) = record.entry.as_option() else {
        return Err(wasm_error!(WasmErrorInner::Guest("Cancellation not found".to_string())));
    };
    let cancellation = Cancellation::try_from(entry)?;

    let updated_cancellation_hash = update_entry(
        input.previous_cancellation_hash,
        &Cancellation {
            reason: input.updated_reason,
            ..cancellation
        },
    )?;
    let record = get(updated_cancellation_hash.clone(), GetOptions::default())?.ok_or(
        wasm_error!(WasmErrorInner::Guest(String::from(
            "Could not find the newly updated Cancellation"
        ))),
    )?;
    Ok(record)
}

#[hdk_extern]
pub fn undo_cancellation(original_cancellation_hash: ActionHash) -> ExternResult<()> {
    let record = get_latest_cancellation(original_cancellation_hash.clone())?;

    let Some(entry) = record.entry.as_option() else {
        return Err(wasm_error!(WasmErrorInner::Guest("Cancellation not found".to_string())));
    };

    let cancellation = Cancellation::try_from(entry)?;

    let links = get_links(cancellation.cancelled_hash, LinkTypes::Cancellations, None)?;

    for link in links {
        if let Some(action_hash) = link.target.into_action_hash() {
            if action_hash.eq(&original_cancellation_hash) {
                delete_link(link.create_link_hash)?;
            }
        }
    }

    delete_entry(original_cancellation_hash)?;

    Ok(())
}

#[hdk_extern]
pub fn get_cancellations_for(action_hash: ActionHash) -> ExternResult<Vec<ActionHash>> {
    let links = get_links(action_hash, LinkTypes::Cancellations, None)?;
    let action_hashes: Vec<ActionHash> = links
        .into_iter()
        .filter_map(|link| link.target.into_action_hash())
        .collect();
    Ok(action_hashes)
}

#[hdk_extern]
pub fn get_undone_cancellations_for(
    action_hash: ActionHash,
) -> ExternResult<Vec<(CreateLink, Vec<SignedHashed<Action>>)>> {
    let details = get_link_details(action_hash, LinkTypes::Cancellations, None)?;
    Ok(details
        .into_inner()
        .into_iter()
        .filter(|(_link, deletes)| deletes.len() > 0)
        .filter_map(|(link, deletes)| match link.hashed.content {
            Action::CreateLink(cl) => Some((cl, deletes)),
            _ => None,
        })
        .collect())
}
