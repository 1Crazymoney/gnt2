# Operational testing

- `GNT` and `GNTB` are already deployed and used so are considered already tested in isolation.

## GNTMigrationAgent isolation

- You shouldn't be able to `migrateFrom` using a random address
- You shouldn't be able to `migrateFrom` using the `owner`
- You should be able to `migrateFrom` using the old token address
    - Only if target is set
- You shouldn't be able to `setTarget` using a random address
- You shouldn't be able to `setTarget` using the old token address
- You should be able to `setTarget` using the `owner`
    - You should be able to do that more than once

## NGNT isolation

- The original functionality of `ERC20Mintable` can be considered safe
- `transferFrom` should be tested with the original `approve` method
    - not approved, approved not enough, approved more than enough, approved and then approval spent in more than 1 transaction, ...
- `transferFrom` should be tested with the new `permit` method
    - not permitted, permitted, permitted twice
- Combination of `approve` and `permit` should be tested
    - permitted and then un-approved by setting allowance to 0
    - permitted and then approved a small amount
    - approved a small amount and then permitted
- It is not be possible to remove the migration agent as a minter

## Integration

- You shouln't be able to migrate from `GNTB`
- You shouln't be able to migrate from `GNTB` using `transferAndCall`
- Migration should be possible to stop
   - `migrateFrom` using the old token fails
- Migration should be possible to re-start after being stopped
  - `migrateFrom` using the old token works
- It should be possible to set a different target
  - This case is used in [emergency recovery](./deployment.md)

## Sidecar testing

This should be possible to attach functionality by attaching a "sidecar" contract utilizing the `permit` functionality.

- Batching sidecar - it should be possible to deploy a Batching contract, permit usage of `NGNT` token and use the batching functionality.

## Re-entrancy cases

If the `transferAndCall` from `GNTB` is ruled out (it almost definitely is), then there is no re-entrancy to be worried about, as far as I know - there is no ether transfers in circulation so no way to re-enter.

## Implementation suggestions/ideas

- In `GNTMigrationAgent`, in the `Migrated` event, it might be useful to index the `target` parameter

## Questions

- What is `GNTDeposit` used for? Should I take it under consideration when thinking about the migration and the new token?
    - UI should make it clear that you cannot migrate tokens in the deposit (or wrapped)