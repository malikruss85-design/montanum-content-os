# Engine Storage Requirements

## Asset categories

| Category | Durability | Suggested storage treatment |
| --- | --- | --- |
| Original Bundle Media references | Existing system remains source of record | Read through approved storage URLs; do not duplicate unless processing requires it. |
| Narration/subtitle assets | Durable for approved Reel version | Object storage with content metadata and versioning. |
| Intermediate scene renders | Temporary/rebuildable | Engine volume or object storage with short retention. |
| Final Reel / publication asset | Durable and immutable after approval | Object storage with versioning, checksum, access policy, and lifecycle retention. |
| Production run records/logs | Durable operational metadata | Database/persistent volume with backup and retention. |

## Minimum provider-neutral storage contract

The future storage adapter must support durable object key, upload/download, checksum verification, temporary preview URL, content type, size/dimension/duration metadata, version reference, retention/deletion marker, and access-control classification.

## Capacity and operations

- Budget for source copy, intermediate render, and final output during each active run; cleanup must not delete approved final assets.
- Monitor volume and object-storage capacity before accepting concurrent renders.
- Store source assets and final assets separately from logs and run metadata.
- Never use temporary signed URLs as the only stored asset identity.

No storage vendor is selected in this phase.
