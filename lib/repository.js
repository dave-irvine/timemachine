/*jslint node: true */
"use strict";

var clu = require("./clu"),
	Commit = require("./commit"),
	Git = require("./git"),
	Repository,
	Q = require("q");

Repository = function Repository(path, bare) {
	this.git = new Git(path, bare);
	this.commits = [];
};

Repository.prototype.loadLog = function () {
	var deferred = Q.defer(),
		git = this.git,
		repository = this;

	git.exec("log", {
		pretty: 'format:"%H%x09%an%x09%ad"'
	}).then(
		function (stdout) {
			clu.outputIter(stdout, function (line) {
				var commit,
					commitLine = line.split("\t");
				
				commit = new Commit(commitLine[0], commitLine[1], commitLine[2]);
				repository.commits.push(commit);
			});

			deferred.resolve(repository.commits);
		},
		function (stderr) {
			deferred.reject(new Error("TimeMachine :: Could not load log for repository (" + git.gitPath + "). " + stderr));
		}
	);

	return deferred.promise;
};

module.exports = Repository;
