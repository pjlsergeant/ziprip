#!perl

use strict;
use warnings;
use Template;
use File::Find::Rule;
use File::Slurp qw/read_file/;
use JSON::XS;
use File::Temp qw/ tempfile /;
use File::Copy;

# Get the version number from package.json
my $package_data = decode_json read_file 'package.json';
my $version = $package_data->{'version'};

# Load all the various library files
my @libraries = map {
    my $path = $_;
    my $contents = read_file $path;
    my ($name) = $path =~ m/([\w\d]+)\.js$/;

    {
        path => $path,
        contents => $contents,
        name => $name
    }
} sort File::Find::Rule
    ->file()
    ->name( '*.js' )
    ->in( './src/' );

# Generate ziprip.js
my $template = join '', (<DATA>);
my ($fh, $filename) = tempfile( undef, SUFFIX => '.js' );
Template->new->process(
    \$template,
    { libraries => \@libraries, version => $version },
    $fh
);

print "Created in $filename\n";

# Run the node tests
my $run_tests = sub {
    my @args = ('node', 'test/090_runNodeTests.js', @_);
    system(@args) == 0 or die "Tests failed for: @args -- $?"
};
$run_tests->( $filename );

# Try an ugly version...
my $ugly_filename = $filename;
$ugly_filename =~ s/\.js$/_ugly.js/;
my @uglify = ('uglifyjs', '-o', $ugly_filename, $filename);
system( @uglify ) == 0 or die "Uglify failed for: @uglify -- $?";
print "Uglified version in $ugly_filename\n";
$run_tests->( $ugly_filename );

# Add both to dist
print "Removing contents of dist\n";
`rm dist/*`;
print "Moving over new files\n";

my $output_filename = sprintf('dist/ziprip.%s.js', $version);
move( $filename, $output_filename ) || die $!;
move( $ugly_filename, sprintf('dist/ziprip.%s.min.js', $version) ) || die $!;

# Link ziprip.js to the versioned one
`cp $output_filename ./dist/ziprip-latest.js`;

print "OK, all worked!\n";
print `ls dist`;



__DATA__
// ziprip.js - version [% version %] - docs: http://zipripjs.com/
// Copyright Peter Sergeant pete@clueball.com - MIT License
// This file is automatically generated, don't edit directly.

// Synopsis:
//     var addresses = ziprip.extract( dom, urlString )
//
// Full documentation at http://zipripjs.com/

(function () {

var libraries = {};

var require = function (name) {
    return libraries[name]();
}

[% FOREACH library = libraries %]
// Imported from: [% library.path %]
libraries['[% library.name %]'] = function () {
    var exports = {};
// File contents begin
[% library.contents %]
// File contents end
    return exports;
}

[% END %]

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = require('ziprip');
    }
    exports.ziprip = require('ziprip');
} else {
    this['ziprip'] = require('ziprip');
}

}).call(this);