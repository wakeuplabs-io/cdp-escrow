
## Deployments

Sepolia:


## Available scripts

```bash
# mint tokens
tsx ./scripts/index.ts mint --network base-sepolia --to 0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0 --amount 100

# create challenge
tsx ./scripts/index.ts create-challenge --network base-sepolia --title "Names for my company" --description "We do seeds for space" --pool-size 100 --end-date '2025-08-27T23:50:00.000Z'

# get challenge by id
tsx ./scripts/index.ts find-challenge --network base-sepolia --challenge-id 0

# resolve challenge
tsx ./scripts/index.ts resolve-challenge --network base-sepolia --challenge-id 0 --winners 0z123,0x234 --invalid 0x321,0x432

# create submission
tsx ./scripts/index.ts create-submission --network base-sepolia --challenge-id 0 --contact m@gmail.com --body "spaseed"  

# get submission by id
tsx ./scripts/index.ts find-submission --network base-sepolia --challenge-id 0 --submission-id 0

# withdraw balance
tsx ./scripts/index.ts withdraw --network base-sepolia --amount 10 --to 0x123
```
