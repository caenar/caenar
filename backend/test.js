const { readdirSync } = require("fs");

let req = 'aegis';

const apiUrl = 'http://localhost:5000'
const directoryPath = `assets/projects/casestudies/${req}`;

const directories = readdirSync(directoryPath);
console.log(directories);
console.log();
for(const files of directories){
  console.log(`${apiUrl}/${directoryPath}/${files}`);
}