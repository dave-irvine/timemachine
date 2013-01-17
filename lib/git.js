var fs = require('fs'),
	exec = require('child_process').exec,
	Q = require("q"),
	clu = require("./clu"),
	Commit = require("./commit"),
	git_bin = "git";

var git_cmd = function (dir, command, options, args) {
	var bash,
		optsArray = [],
		deferred = Q.defer();

	if (options === undefined) {
		options = {};
	}

	clu.convertOptionsToArgv(options, optsArray);
	options = optsArray.join(" ");

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

var Git = function (git_dir, is_bare) {
	this.git_dir = git_dir;
	this.work_dir = git_dir;
	this.bare = is_bare;
	this.git_dir += (is_bare) ? "" : "/.git";

	if (!fs.existsSync(this.git_dir) || !fs.existsSync(this.git_dir + "/HEAD")) {
		throw new Error("Git :: Specified path is not a git repository : " + this.git_dir);
	}
};

Git.Commit = Commit;

Git.prototype.exec = function (command, options, args) {
	return git_cmd((this.bare) ? this.git_dir : this.work_dir, command, options, args);
};

module.exports = Git;
