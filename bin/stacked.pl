#!/usr/bin/perl

=pod

=encoding utf8

=head1 NAME

stacked.pl - Combine CSV files to a single file for use with D3

=head1 SYNOPSIS

stacked.pl -i INPUT_DIRECTORY -o OUTPUT_FILE

=head1 DESCRIPTION

This script lets you combine multiple CSV reports from http://www.oes-cs.dk/ to a single CSV file suitable for creating a stacked bar chart with D3.

=head2 Command-Line Options

The following invocation of the command reads files from the "./data" directory and combines them in a single CSV file.

    stacked.pl -i ./data -o stacked.csv

=over

=item -i INPUT_DIRECTORY

The absolute or relative path to the input directory. All files containing a year as part of their name will be read.

=item -o OUTPUT_FILE

The absolute or relative path to the output file. This file will be in CSV format.

=back

=cut

use strict;
use warnings;
use utf8;

use Data::Dumper;
use Getopt::Std;
use Pod::Usage;

# turn off output buffering
$|++;

# get command line options
my %opts = ();
getopts('i:o:', \%opts) or pod2usage(2);

# print usage instructions if required options are missing
if (!$opts{'i'} || !$opts{'o'}) {
  pod2usage(2);
}

# get all input files
my @files = ();
opendir INPUT, $opts{'i'} or die "cannot open input directory $opts{'i'}: $!";
while (my $filename = readdir INPUT) {
  next unless $filename =~ /\d{4}-expenses\.csv/;
  push @files, $filename;
}
closedir INPUT;

my %labels = ();
my %result = ();
my @years = ();

# get all data from the input files
foreach my $filename (@files) {
  my ($year) = $filename =~ /(\d{4})/;
  push @years, $year;

  # read all lines from the input file
  open CSV, '<', $opts{'i'} . $filename or die "cannot open input file $filename: $!";
  my @lines = <CSV>;
  close CSV;

  # get rid of the header
  my $header = shift @lines;

  foreach my $line (@lines) {
    chomp $line;

    my ($label, @amounts) = split /; /, $line;

    # trim leading and trailing spaces and quotes
    $label =~ s/^["\s]+|["\s]+$//g;

    # we are only interested in top level amounts
    next unless $label =~ /^\d{2}\s/;

    my ($id, $name) = split / /, $label, 2;
    $labels{$id} = $name;

    print "$id: $name\n";

    foreach (@amounts) {
      s/,/./;
      $_ = abs;
    }

    $result{$id}{$year} = $amounts[2];
  }
}

open OUT, '>', $opts{'o'} or die "cannot open output file $opts{'o'}: $!";

my @ids = sort keys %labels;

# header
print OUT 'Year,';
print OUT join ',', @ids;
print OUT "\n";

foreach my $year (@years) {
  print OUT $year;
  foreach my $id (@ids) {
    my $amount = $result{$id}{$year} ? $result{$id}{$year} : 0;
    print OUT ',' . $amount;
  }
  print OUT "\n";
}

close OUT;

=pod

=head1 AUTHOR

Morten Wulff, <wulff@ratatosk.net>

=head1 COPYRIGHT

Copyright (c) 2013-2015, Morten Wulff
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
