import { exec } from "child_process";
import { mongoDockerConfig } from "./tests-config";

export default () => {
  console.log("starting mongo");
  exec(
    `docker run --rm -d --name ${mongoDockerConfig.dockerName} -p ${mongoDockerConfig.port}:27017 mongo`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        throw "Could not start mongo";
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
};
