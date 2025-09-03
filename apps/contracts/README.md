
## Deployments

Sepolia:


## Available scripts

```bash

# deployments, both have a wipe option for redeployment
npm run deploy-erc20:base-sepolia # npm run wipe:base-sepolia
npm run deploy:base-sepolia # npm run wipe:base-sepolia

# mint tokens
tsx ./scripts/index.ts mint --network base-sepolia --to 0x40B67a5469feC774003dF3BcA8F59155F1932993 --amount 1000

# set profile 
tsx ./scripts/index.ts set-profile --network base-sepolia --name "Acme" --description "We do stuff" --website "https://acme.com" --logoURI "https://acme.com/logo.png"

# get profile
tsx ./scripts/index.ts find-profile --network base-sepolia --address 0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0

# create challenge
tsx ./scripts/index.ts create-challenge --network base-sepolia --title "Names for my company" --description "We do seeds for space" --pool-size 100 --end-date '2025-08-30T23:50:00.000Z'

# resolve challenge
tsx ./scripts/index.ts resolve-challenge --network base-sepolia --challenge-id 0 --winners 0,1 --invalid 2,3

# get challenges
tsx ./scripts/index.ts find-challenges --network base-sepolia --start-index 0 --count 2

# create submission
tsx ./scripts/index.ts create-submission --network base-sepolia --challenge-id 1 --contact m@gmail.com --body "spaseed"  

# get submissions
tsx ./scripts/index.ts find-submissions --network base-sepolia --challenge-id 0 --start-index 0 --count 2

# get claimable balance
tsx ./scripts/index.ts get-claimable --network base-sepolia --challenge-id 0 --address 0xA1D3ba06878B6B7EC54781A5BaCBF5068BCaa1d0

# withdraw balance
tsx ./scripts/index.ts claim --network base-sepolia --challenge-id 0
```
