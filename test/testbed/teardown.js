var exec = require('child_process').exec;

var cmd;

cmd = "rm -rf test/testbed/fixtures";

exec(cmd, function (error, stdout, stderr) {
	console.log(stdout);
});