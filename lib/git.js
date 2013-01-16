var fs = require('fs');
var exec = require('child_process').exec;
var Q = require("q");
var git_bin = "git";

var git_cmd = function (dir, command, options, args) {
	var bash,
		deferred = Q.defer();

	if (options === undefined) {
		options = {};
	}

	options = options_to_argv(options).join(" ");

	if (args === undefined) {
		args = [];
	} else if (typeof args == "string") {
		args = [args];
	}

	args = args.join(" ");
	bash = "" + git_bin + " " + command + " " + options + " " + args;

	exec(bash, {
		cwd: dir,
		maxBuffer: 500*1024
	}, function (error, stdout, stderr) {
		if (error) {
			deferred.reject(error);
		} else {
			deferred.resolve(stdout);
		}
	});

	return deferred.promise;
};

var options_to_argv = function (options) {
	var argv, key, val;
	argv = [];
	for (key in options) {
		val = options[key];
		if (key.length === 1) {
			if (val === true) {
				argv.push("-" + key);
			} else if (val === false) {} else {
				argv.push("-" + key);
				argv.push(val);
			}
		} else {
			if (val === true) {
				argv.push("--" + key);
			} else if (val === false) {} else {
				argv.push("--" + key + "=" + val);
			}
		}
	}
	return argv;
};

var Git = function (git_dir, is_bare) {
	this.git_dir = git_dir;
	this.work_dir = git_dir;
	this.bare = is_bare;
	this.git_dir += (is_bare) ? "" : "/.git";

	if (!fs.existsSync(this.git_dir) || !fs.existsSync(this.git_dir + "/HEAD")) {
		throw new Error("Git :: Specified path is not a git repository : " + this.git_dir);
	}
};

Git.prototype.exec = function (command, options, args) {
	return git_cmd((this.bare) ? this.git_dir : this.work_dir, command, options, args);
};

module.exports = Git;
