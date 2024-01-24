import { Command } from "commander";
import { developmentServer } from "./server.js";

const projectDir = process.cwd();

const program = new Command();

program
  .command("hello")
  .description("hello world")
  .action(() => {
    console.log("hello world");
  });

program
  .command("dev")
  .description("Development server")
  .action(() => {
    developmentServer(projectDir, process.env);
  });

program.parse();
