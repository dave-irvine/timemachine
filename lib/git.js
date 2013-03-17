/*jslint node: true */
"use strict";

var clu = require("./clu"),
	Commit = require("./commit"),
	exec = require('child_process').exec,
	fs = require('fs'),
	git_bin = "git",
	Q = require("q");

var git_cmd = function (dir, command, options, args) {
	var bash,
		optsArray = [],
		deferred = Q.defer();

	if (options === undefined) {
		options = {};
	}

	options = clu.convertOptionsToArgv(options, optsArray);

	if (args === undefined) {
		args = [];
	} else if (typeof args === "string") {
		args = [args];
	}

	args = args.join(" ");
	bash = git_bin + " " + command + " " + options + " " + args;

	exec(bash, {
		cwd: dir,
		maxBuffer: 500 * 1024
	}, function (error, stdout, stderr) {
		if (error) {
			deferred.reject(error);
		} else {
			deferred.resolve(stdout);
		}
	});

	return deferred.promise;
};

var Git = function (path, bare) {
	this.gitPath = path;
	this.workDir = path;

	if (bare === undefined) {
		bare = false;
	}

	this.bare = bare;
	this.gitPath += (bare) ? "" : "/.git";

	if (!fs.existsSync(this.gitPath) || !fs.existsSync(this.gitPath + "/HEAD")) {
		throw new Error("Git :: Specified path is not a git repository : " + this.gitPath);
	}
};

Git.Commit = Commit;

Git.prototype.exec = function (command, options, args) {
	return git_cmd((this.bare) ? this.git_dir : this.work_dir, command, options, args);
};

module.exports = Git;
