/*jslint node: true */
"use strict";

var clu = require("./clu"),
	Commit = require("./commit"),
	exec = require('child_process').exec,
	fs = require('fs'),
	git_bin = "git",
	Q = require("q");

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
	var git = this,
		execArgs = (args) ? args.splice(0) : [];

	execArgs.unshift(clu.convertOptionsToArgv(options));

	return clu.exec(git.workDir, git_bin + " " + command, execArgs);
};

module.exports = Git;
