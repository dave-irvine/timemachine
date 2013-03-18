/*jslint node: true */
"use strict";

var clu = require("./clu"),
	Commit = require("./commit"),
	filterCommitsWithHashes,
	filterCommitsWithAuthor,
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

Repository.prototype.applyCommitFilter = function (filter) {
	var repository = this;

	if (filter.onlyCommit) {
		repository.commits = filterCommitsWithHashes(repository.commits, [filter.onlyCommit]).slice(0);
		if (repository.commits.length < 1) {
			throw new Error("TimeMachine :: Repo does not contain commit with specified hash: " + filter.onlyCommit);
		}
	}

	if (filter.withHashes) {
		repository.commits = filterCommitsWithHashes(repository.commits, filter.withHashes).slice(0);
		if (repository.commits.length < 1) {
			throw new Error("TimeMachine :: Repo does not contain commit with specified hashes: " + filter.withHashes);
		}
	}

	if (filter.onlyForAuthor) {
		repository.commits = filterCommitsWithAuthor(repository.commits, filter.onlyForAuthor).slice(0);
		if (repository.commits.length < 1) {
			throw new Error("TimeMachine :: Repo does not contain any commits by specified author: " + filter.onlyForAuthor);
		}
	}
};

filterCommitsWithHashes = function (commits, hashes) {
	var repository = this,
		commitsWithHashes;

	commitsWithHashes = commits.filter(function (commit) {
		return (hashes.indexOf(commit.hash) > -1);
	});

	return commitsWithHashes;
};

filterCommitsWithAuthor = function (commits, author) {
	var repository = this,
		commitsWithAuthor;

	commitsWithAuthor = commits.filter(function (commit) {
		return (commit.author === author);
	});

	return commitsWithAuthor;
};

module.exports = Repository;
