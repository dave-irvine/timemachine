/*jslint node: true */
"use strict";

var chai = require("chai"),
	sinonChai = require("sinon-chai"),
	clu = require("../lib/clu"),
	expect = chai.expect,
	sinon = require("sinon"),
	Q = require("q");

chai.use(sinonChai);

describe("CLU", function () {
	describe("convertOptionsToArgv()", function () {
		it("should return an empty string if not passed any options", function () {
			var ret = clu.convertOptionsToArgv();
			expect(ret).to.equal("");
		});

		it("should return an empty string if options is empty", function () {
			var ret = clu.convertOptionsToArgv({});
			expect(ret).to.equal("");
		});

		it("should correctly convert 1-character keys", function () {
			var ret = clu.convertOptionsToArgv({
				"a": true
			});

			expect(ret).to.equal("-a");
		});

		it("should correctly convert 1-character keys with a value other than true", function () {
			var ret = clu.convertOptionsToArgv({
				"a": "b"
			});

			expect(ret).to.equal("-a b");
		});

		it("should ignore 1-character keys with a value of false", function () {
			var ret = clu.convertOptionsToArgv({
				"a": false
			});

			expect(ret).to.equal("");
		});

		it("should correctly convert multi-character keys", function () {
			var ret = clu.convertOptionsToArgv({
				"ab": true
			});

			expect(ret).to.equal("--ab");
		});

		it("should correctly convert multi-character key value pairs", function () {
			var ret = clu.convertOptionsToArgv({
				"ab": "cd"
			});

			expect(ret).to.equal("--ab=cd");
		});

		it("should ignore multi-character keys with a value of false", function () {
			var ret = clu.convertOptionsToArgv({
				"ab": false
			});

			expect(ret).to.equal("");
		});
	});

	describe("convertArgvToOptionsAndParams()", function () {
		it("should ignore empty argv", function () {
			var options = {},
				params = [],
				argv;

			argv = [];
			clu.convertArgvToOptionsAndParams(argv, options, params);

			expect(options).to.deep.equal({});
			expect(params).to.deep.equal([]);
		});

		it("should convert 1-character argv back to key", function () {
			var options = {},
				params = [],
				argv;

			argv = ["-a"];
			clu.convertArgvToOptionsAndParams(argv, options, params);

			expect(options).to.deep.equal({
				"a": true
			});

			expect(params).to.deep.equal([]);
		});

		it("should convert 1-character argv with a value other than true back to key value pair", function () {
			var options = {},
				params = [],
				argv;

			argv = ["-a b"];
			clu.convertArgvToOptionsAndParams(argv, options, params);

			expect(options).to.deep.equal({
				"a": "b"
			});

			expect(params).to.deep.equal([]);
		});

		it("should throw an error when given an option not specified in options", function () {
			var options = {},
				params = [],
				argv;

			argv = ["--ab=cd"];
			expect(function () {
				clu.convertArgvToOptionsAndParams(argv, options, params);
			}).to.throws();
		});

		it("should convert multi-character argv back to key value pair", function () {
			var options = {
					"ab": "ef"
				},
				params = [],
				argv;

			argv = ["--ab=cd"];
			
			clu.convertArgvToOptionsAndParams(argv, options, params);
			
			expect(options).to.deep.equal({
				"ab": "cd"
			});

			expect(params).to.deep.equal([]);
		});

		it("should throw an error when given an option without a value", function () {
			var options = {
					"ab": "ef"
				},
				params = [],
				argv;

			argv = ["--ab="];
			
			expect(function () {
				clu.convertArgvToOptionsAndParams(argv, options, params);
			}).to.throws();
		});

		it("should convert argvs without - or -- to params", function () {
			var options = {},
				params = [],
				argv;

			argv = ["ab"];
			
			clu.convertArgvToOptionsAndParams(argv, options, params);
			
			expect(options).to.deep.equal({});

			expect(params).to.deep.equal(["ab"]);
		});
	});

	describe("outputIter()", function () {
		var spy, output;

		it("should call callback once per line", function () {
			spy = sinon.spy();
			output = "A\nB";

			clu.outputIter(output, spy);

			expect(spy).to.have.been.calledTwice;
		});

		it("should call callback with the line relevant to the iteration", function () {
			spy = sinon.spy();
			output = "A";

			clu.outputIter(output, spy);

			expect(spy).to.have.been.calledWithExactly("A");
		});

		it("should not call callback for an empty line", function () {
			spy = sinon.spy();
			output = "";

			clu.outputIter(output, spy);

			expect(spy).to.not.have.been.called;
		});
	});

	describe("exec()", function () {
		var promise;

		afterEach(function () {
			promise.catch(function () {});
		});

		it("should return a Promise", function () {
			promise = clu.exec();

			expect(promise).to.be.an.instanceOf(Q.makePromise);
		});

		it("should reject its Promise if not passed a workdir", function () {
			promise = clu.exec("", "ls", []);

			expect(promise.isRejected()).to.be.true;
		});

		it("should reject its Promise if not passed a binary name", function () {
			promise = clu.exec(".", "", []);

			expect(promise.isRejected()).to.be.true;
		});

		it("should reject its Promise if not valid args", function () {
			promise = clu.exec(".", "ls", null);

			expect(promise.isRejected()).to.be.true;
		});

		it("should not reject its Promise if passed valid options", function (done) {
			promise = clu.exec(".", "ls", []);

			promise.then(function () {
				expect(promise.isFulfilled()).to.be.true;
				done();
			});
		});
	});
});
