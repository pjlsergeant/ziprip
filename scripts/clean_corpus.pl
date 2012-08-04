#!perl

# Clean up an HTML corpus

use strict;
use warnings;
use File::Slurp qw/read_file/;
use HTML::TokeParser::Simple;

my $corpus = read_file $ARGV[0];
$corpus =~ s/^(.+---DIVIDER---\n)//s;
my $header = $1 || die "No divider matched";

# No addresses that we can (should?) get at in <script>

# We want outgoing links only... Anything that might auto-load an external
# resource is history...
my %url_attributes = (
	audio   => [qw/src/],
	applet  => [qw/codebase/],
	body    => [qw/background/],
	button  => [qw/formaction/],
	command => [qw/icon/],
	embed   => [qw/url/],
	frame   => [qw/src longdesc/],
	head    => [qw/profile/],
	html    => [qw/manifest/],
	iframe  => [qw/src longdesc/],
	img     => [qw/longdesc src usemap/],
	input   => [qw/src usemap/],
	link    => [qw/href/],
	object  => [qw/classid codebase data usemap/],
	script  => [qw/src/],
	source  => [qw/src/],
	video   => [qw/poster src/]
);

# Event attributes
my @event_attributes = (qw/
	onload onunload onblur onchange onfocus onreset onselect onsubmit onabort
	onkeydown onkeypress onkeyup onclick ondblclick onmousedown onmousemove
	onmouseout onmouseover onmouseup
/);

my $parser = HTML::TokeParser::Simple->new(\$corpus);

print $header;

while ( my $token = $parser->get_token ) {
	if ($token->is_start_tag()) {
		my $tag_name = $token->get_tag();

		# Remove URL attributes
		$token->delete_attr($_) for @{ $url_attributes{ $tag_name } || [] };
		# Remove events
		$token->delete_attr($_) for @event_attributes;

		if ( $tag_name eq 'base' ) {
			$token->set_attr( href => 'http://www.example.com' );
		}

		if ( $tag_name eq 'script' ) {
			print "<script>/* stripped in corpus */</script>";
			next;
		}
    }
    print $token->as_is unless
    	$token->is_tag && $token->get_tag eq 'script';
}
