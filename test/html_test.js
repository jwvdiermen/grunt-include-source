var fs = require('fs');

exports.compareOutput = function (test) {
	test.expect(2);

	var input = fs.readFileSync('tmp/index.html', { encoding: 'utf8' });
	var expected = fs.readFileSync('test/expected/index.html', { encoding: 'utf8' });

	test.equal(input, expected, "Output doesn't match expected output.");
	
	// Test overwriting files
	input = fs.readFileSync('tmp/overwrite.html', { encoding: 'utf8' });
	expected = fs.readFileSync('test/expected/overwrite.html', { encoding: 'utf8' });
	
	test.equal(input, expected, "Output doesn't match expected output.");
	
	test.done();
};