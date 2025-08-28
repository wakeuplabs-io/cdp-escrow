
## Deployments

Sepolia:


## Available scripts

```bash

# deployments, both have a wipe option for redeployment
npm run deploy-erc20:base-sepolia
npm run deploy:base-sepolia

# mint tokens
tsx ./scripts/index.ts mint --network base-sepolia --to 0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0 --amount 100

# create challenge
tsx ./scripts/index.ts create-challenge --network base-sepolia --title "Names for my company" --description "We do seeds for space" --pool-size 100 --end-date '2025-08-29T23:50:00.000Z'

# get challenge by id
tsx ./scripts/index.ts find-challenge --network base-sepolia --challenge-id 0

# get paginated challenges
tsx ./scripts/index.ts find-challenges --network base-sepolia --start-index 1 --count 2

# resolve challenge
tsx ./scripts/index.ts resolve-challenge --network base-sepolia --challenge-id 0 --winners 0,1 --invalid 2,3

# create submission
tsx ./scripts/index.ts create-submission --network base-sepolia --challenge-id 1 --contact m@gmail.com --body "spaseed"  

# get submission by id
tsx ./scripts/index.ts find-submission --network base-sepolia --challenge-id 1 --submission-id 0

# get submission paginated
tsx ./scripts/index.ts find-submissions --network base-sepolia --challenge-id 1 --start-index 0 --count 2

# check balance
tsx ./scripts/index.ts balance --network base-sepolia --address 0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0

# withdraw balance
tsx ./scripts/index.ts withdraw --network base-sepolia --amount 10 --to 0x123
```
