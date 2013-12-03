The National Budget
===================

This data visualization is the result of a [data sprint](http://www.information.dk/databloggen/480268) held at Dagbladet Information on November 27th, 2013. This code can be used to create your own zoomable sunburst diagrams based on available budget figures.

Manifest
--------

* **bin/budget.pl** A utility which converts CSV files from Finanslovsdatabasen to hierarchical JSON files for use with D3.js. Run `perldoc budget.pl` to read the documentation.
* **data/budget.csv** A small example data set. You can use [Finanslovsdatabasen](http://www.oes-cs.dk/olapdatabase/finanslov/index.cgi) to create your own reports.
* **html/budget.css** Styles for the chart and the sidebar.
* **html/budget.html** The page containing the chart.
* **html/budget.js** The code which renders the chart and enables interactivity.
* **html/budget.json** The example data generated from `budget.csv`.

Notes
-----

To test locally, you can use the following command to [run a static HTTP server](https://gist.github.com/willurd/5720255) on your local machine:

    python -m SimpleHTTPServer 8000
