The National Budget
===================

This data visualization is the result of a [data sprint](http://www.information.dk/databloggen/480268) held at Dagbladet Information on November 27th, 2013. This code can be used to create your own zoomable sunburst diagrams based on available budget figures.


Sunburst
--------

This interactive graph lets you explore the national budget from 2003 to 2015 using a zoomable sunburst diagram.

![National Budget - Sunburst](https://raw.githubusercontent.com/informeren/dataviz-budget/master/doc/sunburst.png)


Stacked bars
------------

This interactive graph lets you explore the national budget from 2003 to 2015 using a stacked bar chart.

![National Budget - Stacked Bars](https://raw.githubusercontent.com/informeren/dataviz-budget/master/doc/stacked.png)


Getting the data
----------------

All data is available from [Finansministeriets Finanslovsdatabase](http://www.oes-cs.dk/olapdatabase/finanslov/index.cgi).

To get data at a reasonable detail level, you will have to modify the report structure and add a couple of filters. First, let's modify the report structure:

![National Budget - Report structure](https://raw.githubusercontent.com/informeren/dataviz-budget/master/doc/structure.png)

1. Click _Vælg struktur_ to open the structure popup
2. Under _Kontoplan_ click _Standardkonto_ to remove it from the report
3. Under _I rapporten vises_ select _Alle niveauer på én gang_ to disable the drill-down mechanism
4. Click _OK_ to apply the new structure

Then, add a couple of filters:

![National Budget - Report filters](https://raw.githubusercontent.com/informeren/dataviz-budget/master/doc/filters.png)

1. Click _Vælg filter_ to open the filter popup
2. Under _Variabel_ select _Finansår_ and then select the year(s) you're interested in from the select list on the right
3. Under _Variabel_ select _Udgifts-/indtægtsbudget_ and select _Indtægtsbudget, indtægt_ if you're interested in revenues or _Udgiftsbudget, udgift_ if you're interested in exepenses
4. Click _OK_ to apply the filters

When you're happy with the structure and filtering of the data you can click the _Download_ button to get a copy of the report in CSV format.

The files in the _revenues_ folder have been created using the following filters:

    Finansår=20xx
    Udgifts-/indtægtsbudget=Indtægtsbudget, indtægt

The files in the _expenses_ folder have been created using the following filters:

    Finansår=20xx
    Paragraf=[01-29]
    Udgifts-/indtægtsbudget=Udgiftsbudget, udgift

The expense data files named `*-all.csv` omit the _Paragraf_ filter.


Notes
-----

To test locally, you can use the following command to [run a static HTTP server](https://gist.github.com/willurd/5720255) on your local machine:

    python -m SimpleHTTPServer 8000

Based on the [Zoomable Sunburst](http://bl.ocks.org/mbostock/4348373) and [Normalized Stacked Bar Chart](http://bl.ocks.org/mbostock/3886394) diagrams by Mike Bostock.
