#!/usr/bin/perl

=pod

=encoding utf8

=head1 NAME

sunburst.pl - Convert CSV files to JSON files for use with D3

=head1 SYNOPSIS

sunburst.pl -i INPUT_FILE -o OUTPUT_FILE [-l LEVELS] [-e EXCLUDE]

=head1 DESCRIPTION

This script lets you convert a CSV report from http://www.oes-cs.dk/ to a hierarchical data structure in JSON format for use with libraries like D3.

=head2 Command-Line Options

The following invocation of the command reads the file "2014.csv" and exports the first 3 levels of the hierarchy to "2014.json", ignoring the accounts 42, 420, and 421.

    sunburst.pl -i 2014.csv -o 2014.json -l 3 -e 42,420,421

=over

=item -i INPUT_FILE

The absolute or relative path to the input file. This file should contain the raw output which you downloaded from the report generator on http://www.oes-cs.dk/.

=item -o OUTPUT_FILE

The absolute or relative path to the output file. This file will be in JSON format.

=item -l LEVELS

The number of level to include in the output file. If you have made a full report, setting the level to 2 will only output the levels "Paragraf" and "Hovedområde". This argument is optional.

=item -e EXCLUDE

A comma-separated list of account numbers to exclude from the generated file. This argument is optional.

=back

=head2 Data Structures

The @amounts array contains the following values (when looking at data for 2014):

   * R 2012 (report)
   * B 2013 (budget)
   * F 2014 (appropriation)
   * BO 2015
   * BO 2016
   * BO 2017

See the help section on http://www.oes-cs.dk/olapdatabase/finanslov/index.cgi for more information on the available data.

=cut

use strict;
use warnings;
use utf8;

use Getopt::Std;
use Pod::Usage;
use JSON;

# turn off output buffering
$|++;

# get command line options
my %opts = ();
getopts('i:o:l:e:', \%opts) or pod2usage(2);

# print usage instructions if required options are missing
if (!$opts{'i'} || !$opts{'o'}) {
  pod2usage(2);
}

my $max_level = $opts{'l'} || 42;
my %exclude = $opts{'e'} ? map { $_ => 1 } split /,/, $opts{'e'} : ();

# prepare the input and output files
open(my $input, '<', $opts{'i'}) or die "cannot open input file $opts{'i'}: $!";
open(my $output, '>:utf8', $opts{'o'}) or die "cannot open output file $opts{'o'}: $!";

# read all lines from the input file
my @lines = <$input>;
close($input);

# tell the user how much work we have to do
my $count = @lines;
print "Processing $count lines...";

# get rid of the header
my $header = shift @lines;

# initialize counters
my ($total_report, $total_budget, $total_appropriation) = (0) x 3;
my $workspace = {};

# process the file in the order last line -> first line
while (@lines) {
  my $line = pop @lines;
  chomp $line;

  my ($label, @amounts) = split /; /, $line;

  # trim leading and trailing spaces and quotes
  $label =~ s/^["\s]+|["\s]+$//g;

  # use the account number to determine the level in the hierarchy
  my $level = 0;
  SWITCH: {
    $label =~ /^\d{2}\s/ && do { $level = 1; last SWITCH; };
    $label =~ /^\d{3}\s/ && do { $level = 2; last SWITCH; };
    $label =~ /^\d{4}\s/ && do { $level = 3; last SWITCH; };
    $label =~ /^\d{6}\s/ && do { $level = 4; last SWITCH; };
    $label =~ /^\d{8}\s/ && do { $level = 5; last SWITCH; };
    die "Unknown account number format in label: $label";
  }

  # skip this line if we have dug too deep
  next if $level > $max_level;

  # create an entry for this line
  my $item = create_item($label, \@amounts);

  # if the previous line are lower in the hierarchy, add them as children of
  # the current element
  my $sub_level = $level + 1;
  if (exists $workspace->{$sub_level} and $level < 5) {
    $item->{'children'} = $workspace->{$sub_level};
  }

  delete $workspace->{$sub_level};

  # add the finished item
  if (!$exclude{$item->{'account'}}) {
    push @{$workspace->{$level}}, $item;

    if ($level == 1) {
      $total_report += $item->{'report'};
      $total_budget += $item->{'budget'};
      $total_appropriation += $item->{'appropriation'};
    }
  }
}

print " Done!\n";

# create the root node of the hierarchy
my $result = {
  'label' => 'ROOT',
  'account' => 0,
  'name' => 'Alle udgifter',
  'report' => $total_report,
  'budget' => $total_budget,
  'appropriation' => $total_appropriation,
  'children' => $workspace->{1},
};

# pretty print the final data structure in JSON format
my $json = JSON->new;
print $output $json->pretty->encode($result);

close($output);

sub create_item {
  my $label = shift;
  my $amounts = shift;

  # clean up budget amounts and make sure they create sensible graphs
  foreach (@$amounts) {
    s/,/./;
    $_ = abs;
  }

  # grab the account number and name from the line label
  my ($account) = $label =~ /^(\d+)\s/;
  my ($name) = $label =~ /\s(.*)$/;

  my $item = {
    'label' => $label,
    'account' => $account,
    'name' => $name,
    'report' => $amounts->[0],
    'budget' => $amounts->[1],
    'appropriation' => $amounts->[2],
  };

  return $item;
}

=pod

=head1 AUTHOR

Morten Wulff, <wulff@ratatosk.net>

=head1 COPYRIGHT

Copyright (c) 2013, Morten Wulff
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL MICHAEL BOSTOCK BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

=cut
