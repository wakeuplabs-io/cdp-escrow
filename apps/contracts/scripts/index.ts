    import { Command } from "commander";
import "dotenv/config";
import { createChallengeCommand } from "./commands/challenges/create";
import { findChallengeByIdCommand } from "./commands/challenges/find";
import { findChallengesCommand } from "./commands/challenges/find-paginated";
import { resolveChallengeCommand } from "./commands/challenges/resolve";
import { getClaimableCommand } from "./commands/get-claimable";
import { mintCommand } from "./commands/mint";
import { createSubmissionCommand } from "./commands/submissions/create";
import { getSubmissionByIdCommand } from "./commands/submissions/find";
import { getSubmissionsPaginatedCommand } from "./commands/submissions/find-paginated";

const program = new Command();

program.addCommand(mintCommand);
program.addCommand(createChallengeCommand);
program.addCommand(resolveChallengeCommand);
program.addCommand(findChallengeByIdCommand);
program.addCommand(findChallengesCommand);
program.addCommand(createSubmissionCommand);
program.addCommand(getSubmissionByIdCommand);
program.addCommand(getSubmissionsPaginatedCommand);
program.addCommand(getClaimableCommand);

program.parse(process.argv);
