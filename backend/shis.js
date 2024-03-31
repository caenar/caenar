const { readdirSync } = require('fs');
const path  = require('path');

const dirPath = './assets/projects/casestudies';

let projects = [];
const dirs = readdirSync(dirPath);

for(const dir of dirs){
  const newPath = path.join(dirPath, dir);
  const dirFiles = readdirSync(newPath);
  const project = {name: dir, files: dirFiles};
  projects.push(project);
}
