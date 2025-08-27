import "dotenv/config";
import { Command } from "commander";
import { mintCommand } from "./commands/mint.js";
import { withdrawCommand } from "./commands/withdraw.js";
import { createChallengeCommand } from "./commands/challenges/create.js";
import { resolveChallengeCommand } from "./commands/challenges/resolve.js";
import { findChallengeByIdCommand } from "./commands/challenges/find.js";
import { createSubmissionCommand } from "./commands/submissions/create.js";
import { getSubmissionByIdCommand } from "./commands/submissions/find.js";

const program = new Command();

program.addCommand(mintCommand);
program.addCommand(withdrawCommand);
program.addCommand(createChallengeCommand);
program.addCommand(resolveChallengeCommand);
program.addCommand(findChallengeByIdCommand);
program.addCommand(createSubmissionCommand);
program.addCommand(getSubmissionByIdCommand);

program.parse(process.argv);
