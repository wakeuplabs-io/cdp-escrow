import { Command } from "commander";
import "dotenv/config";
import { getClaimableCommand } from "./commands/challenges/claim";
import { createChallengeCommand } from "./commands/challenges/create";
import { findChallengesCommand } from "./commands/challenges/find";
import { resolveChallengeCommand } from "./commands/challenges/resolve";
import { mintCommand } from "./commands/mint";
import { findProfileCommand } from "./commands/profile/find";
import { setProfileCommand } from "./commands/profile/set";
import { createSubmissionCommand } from "./commands/submissions/create";
import { getSubmissionsPaginatedCommand } from "./commands/submissions/find";

const program = new Command();

program.addCommand(mintCommand);
program.addCommand(createChallengeCommand);
program.addCommand(resolveChallengeCommand);
program.addCommand(findChallengesCommand);
program.addCommand(createSubmissionCommand);
program.addCommand(getSubmissionsPaginatedCommand);
program.addCommand(getClaimableCommand);
program.addCommand(setProfileCommand);
program.addCommand(findProfileCommand);


program.parse(process.argv);
