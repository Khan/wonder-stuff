const {execSync} = require("child_process");

// This is done so that we can override execSync in the tests
module.exports = {
    execSync,
};
