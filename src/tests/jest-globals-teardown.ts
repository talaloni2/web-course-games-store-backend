import { exec } from "child_process";
import { mongoDockerConfig } from "./tests-config";

export default () => {
  console.log("killing mongo");
  exec(
    `docker kill ${mongoDockerConfig.dockerName}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        throw "Could not stop mongo";
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
};
