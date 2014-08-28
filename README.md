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

Notes
-----

To test locally, you can use the following command to [run a static HTTP server](https://gist.github.com/willurd/5720255) on your local machine:

    python -m SimpleHTTPServer 8000

Based on the [Zoomable Sunburst](http://bl.ocks.org/mbostock/4348373) and [Normalized Stacked Bar Chart](http://bl.ocks.org/mbostock/3886394) diagrams by Mike Bostock.
