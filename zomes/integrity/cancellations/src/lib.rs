use hdi::prelude::*;

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[hdk_entry_defs]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    Cancellation(Cancellation),
}

#[derive(Serialize, Deserialize)]
#[hdk_link_types]
pub enum LinkTypes {
    Cancellations,
}
#[hdk_entry_helper]
#[derive(Clone, PartialEq)]
pub struct Cancellation {
    pub reason: String,
    pub cancelled_hash: ActionHash,
}

#[hdk_extern]
pub fn validate(_op: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_create_cancellation(
    _action: EntryCreationAction,
    _cancellation: Cancellation,
) -> ExternResult<ValidateCallbackResult> {
    // let record = must_get_valid_record(cancellation.cancelled_hash.clone())?;
    // let _event: crate::Event = record
    //     .entry()
    //     .to_app_option()
    //     .map_err(|e| wasm_error!(e))?
    //     .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
    //         "Dependant action must be accompanied by an entry"
    //     ))))?;
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_update_cancellation(
    _action: Update,
    _cancellation: Cancellation,
    _original_action: EntryCreationAction,
    _original_cancellation: Cancellation,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_delete_cancellation(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_cancellation: Cancellation,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_create_link_cancellations(
    _action: CreateLink,
    base_address: AnyLinkableHash,
    target_address: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    // Check the entry type for the given action hash
    let action_hash = base_address
        .into_action_hash()
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "No action hash associated with link"
        ))))?;
    // let record = must_get_valid_record(action_hash)?;
    // let _event: crate::Event = record
    //     .entry()
    //     .to_app_option()
    //     .map_err(|e| wasm_error!(e))?
    //     .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
    //         "Linked action must reference an entry"
    //     ))))?;
    // Check the entry type for the given action hash
    let action_hash =
        target_address
            .into_action_hash()
            .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
                "No action hash associated with link"
            ))))?;
    let record = must_get_valid_record(action_hash)?;
    let _cancellation: crate::Cancellation = record
        .entry()
        .to_app_option()
        .map_err(|e| wasm_error!(e))?
        .ok_or(wasm_error!(WasmErrorInner::Guest(String::from(
            "Linked action must reference an entry"
        ))))?;
    // TODO: add the appropriate validation rules
    Ok(ValidateCallbackResult::Valid)
}
pub fn validate_delete_link_cancellations(
    _action: DeleteLink,
    _original_action: CreateLink,
    _base: AnyLinkableHash,
    _target: AnyLinkableHash,
    _tag: LinkTag,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(String::from(
        "cancellations links cannot be deleted",
    )))
}
