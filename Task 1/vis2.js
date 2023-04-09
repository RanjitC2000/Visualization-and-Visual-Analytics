var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1300 - margin.left - margin.right,
    height = 525 - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, 500]).padding(0.1);
var y = d3.scaleLinear().rangeRound([500, 0]);
d3.select("#toggle-button").classed("toggle-button-active", true);
var svg = d3.select("body").append("svg")
    .attr("width", 1300 + margin.left + margin.right)
    .attr("height", 500 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + 425 + "," + 25 + ")");

d3.csv("pokemon.csv", function(error,data) {
    if (error) throw error;

    var feature = document.getElementById("feature").value;

    data.forEach(function(d) {
        d[feature] = +d[feature];
    });

    var x = d3.scaleLinear()
        .domain([d3.min(data,function(d){return d[feature]}), d3.max(data, function(d) { return d[feature]; })]).nice()
        .range([0, 475]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    var histogram = d3.histogram()
        .value(function(d) { return d[feature]; })
        .domain(x.domain())
        .thresholds(x.ticks(20));

    var bins = histogram(data);

    var y = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(bins, function(d) { return d.length; })]).nice();

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    // color bins
    var color = d3.scaleLinear()
        .domain([0, d3.max(bins, function(d) { return d.length; })])
        .range(["black", "steelblue"]);

    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", function(d) { return color(d.length); });

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var mouseover = function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Count: " + d.length)
            .style("left", (d3.event.pageX + 50) + "px")
            .style("top", (d3.event.pageY - 50) + "px");
    }

    var mouseout = function(d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    svg.selectAll("rect")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    svg.append("text")
        .attr("x", 237)
        .attr("y", -5)
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("Histogram of " + feature);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("class", "ylabel")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");

    svg.append("text")
        .attr("transform",
            "translate(" + 237 + " ," +
            (height + margin.bottom) + ")")
        .attr("class", "xlabel")
        .style("text-anchor", "middle")
        .text(feature);

    var isVertical = true;

d3.select("#toggle-button").on("click", function() {
  isVertical = !isVertical;
  if (isVertical) {
    x.range([0, 475])
    y.range([475, 0]);
    svg.selectAll("rect")
      .transition()
      .duration(1000)
      .attr("x", 1)
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
      .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
      .attr("height", function(d) { return height - y(d.length); });
    svg.select(".x.axis")
      .transition()
      .duration(1000)
      .attr("transform", "translate(0," + 475 + ")")
      .call(d3.axisBottom(x));
    svg.select(".y.axis")
      .transition()
      .duration(1000)
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(y));
    svg.select(".xlabel")
        .text(feature);
    svg.select(".ylabel")
        .text("Count");
  } else {
    x.range([0, 475]);
    y.range([0, 475]);
    svg.selectAll("rect")
      .transition()
      .duration(1000)
      .attr("transform", function(d) { return "translate(0," + x(d.x0) + ")"; })
      .attr("width", function(d) { return y(d.length); })
      .attr("height", function(d) { return (x(d.x1) - x(d.x0) -1) ; });
    svg.select(".y.axis")
      .transition()
      .duration(1000)
      .attr("transform", "translate(0," + 475 + ")")
      .call(d3.axisBottom(y));
    svg.select(".x.axis")
      .transition()
      .duration(1000)
      .attr("transform", "translate(0,0)")
      .call(d3.axisLeft(x));
    svg.select(".xlabel")
        .text("Count");
    svg.select(".ylabel")
        .text(feature);
  }
});

});