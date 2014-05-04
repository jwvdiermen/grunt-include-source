var fs = require('fs');

exports.compareOutput = function (test) {
	test.expect(1);

	var input = fs.readFileSync('tmp/index.jade', { encoding: 'utf8' });
	var expected = fs.readFileSync('test/expected/index.jade', { encoding: 'utf8' });

	test.equal(input, expected, "Output doesn't match expected output.");
	test.done();
};