import "dotenv/config";
import { Command } from "commander";
import { mintCommand } from "./commands/mint";
import { withdrawCommand } from "./commands/withdraw";
import { createChallengeCommand } from "./commands/challenges/create";
import { resolveChallengeCommand } from "./commands/challenges/resolve";
import { findChallengeByIdCommand } from "./commands/challenges/find";
import { findChallengesCommand } from "./commands/challenges/find-paginated";
import { createSubmissionCommand } from "./commands/submissions/create";
import { getSubmissionByIdCommand } from "./commands/submissions/find";
import { getSubmissionsPaginatedCommand } from "./commands/submissions/find-paginated";

const program = new Command();

program.addCommand(mintCommand);
program.addCommand(withdrawCommand);
program.addCommand(createChallengeCommand);
program.addCommand(resolveChallengeCommand);
program.addCommand(findChallengeByIdCommand);
program.addCommand(findChallengesCommand);
program.addCommand(createSubmissionCommand);
program.addCommand(getSubmissionByIdCommand);
program.addCommand(getSubmissionsPaginatedCommand);

program.parse(process.argv);
