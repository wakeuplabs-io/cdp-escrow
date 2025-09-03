export const escrowAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AdminCannotSubmit",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadySubmitted",
    type: "error",
  },
  {
    inputs: [],
    name: "ChallengeAlreadyClosed",
    type: "error",
  },
  {
    inputs: [],
    name: "ChallengeAlreadyResolved",
    type: "error",
  },
  {
    inputs: [],
    name: "ChallengeNotActive",
    type: "error",
  },
  {
    inputs: [],
    name: "ChallengeNotClosed",
    type: "error",
  },
  {
    inputs: [],
    name: "ChallengeNotPending",
    type: "error",
  },
  {
    inputs: [],
    name: "ChallengeNotRefunded",
    type: "error",
  },
  {
    inputs: [],
    name: "ChallengeNotValidating",
    type: "error",
  },
  {
    inputs: [],
    name: "ChallengerNotRegistered",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidSubmissionCount",
    type: "error",
  },
  {
    inputs: [],
    name: "OnlyAdmin",
    type: "error",
  },
  {
    inputs: [],
    name: "SubmissionNotFound",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "metadataURI",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "poolSize",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "ChallengeCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "awardedSubmissions",
        type: "uint256[]",
      },
      {
        indexed: false,
        internalType: "uint256[]",
        name: "ineligibleSubmissions",
        type: "uint256[]",
      },
    ],
    name: "ChallengeResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Claimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "submissionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "submitter",
        type: "address",
      },
    ],
    name: "SubmissionCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "metadataURI",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "poolSize",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "createChallenge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "contact",
        type: "string",
      },
      {
        internalType: "string",
        name: "submissionURI",
        type: "string",
      },
    ],
    name: "createSubmission",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
    ],
    name: "getChallenge",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "metadataUri",
            type: "string",
          },
          {
            internalType: "address",
            name: "admin",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "poolSize",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "endsAt",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
          {
            internalType: "enum IEscrowStructs.ChallengeStatus",
            name: "status",
            type: "uint8",
          },
        ],
        internalType: "struct IEscrowStructs.Challenge",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "challenger",
        type: "address",
      },
    ],
    name: "getChallengerChallenges",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getChallengesCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getClaimable",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getProfile",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "description",
            type: "string",
          },
          {
            internalType: "string",
            name: "website",
            type: "string",
          },
          {
            internalType: "string",
            name: "logoURI",
            type: "string",
          },
          {
            internalType: "bool",
            name: "verified",
            type: "bool",
          },
        ],
        internalType: "struct IEscrowStructs.ChallengerProfile",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "submissionId",
        type: "uint256",
      },
    ],
    name: "getSubmission",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "metadataUri",
            type: "string",
          },
          {
            internalType: "address",
            name: "creator",
            type: "address",
          },
          {
            internalType: "string",
            name: "creatorContact",
            type: "string",
          },
          {
            internalType: "enum IEscrowStructs.SubmissionStatus",
            name: "status",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "createdAt",
            type: "uint256",
          },
        ],
        internalType: "struct IEscrowStructs.Submission",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
    ],
    name: "getSubmissionsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserSubmissions",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "challengeId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "submissionId",
            type: "uint256",
          },
        ],
        internalType: "struct IEscrowStructs.UserSubmission[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "challengeId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "awardedSubmissions",
        type: "uint256[]",
      },
      {
        internalType: "uint256[]",
        name: "ineligibleSubmissions",
        type: "uint256[]",
      },
    ],
    name: "resolveChallenge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "website",
        type: "string",
      },
      {
        internalType: "string",
        name: "logoURI",
        type: "string",
      },
    ],
    name: "setProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
