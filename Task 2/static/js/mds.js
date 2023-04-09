d3.json('/mds_data').then(function(data) {
    var margin = {top: 10, right: 10, bottom: 30, left: 30},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    plot_width = width/2;
    plot_height = height-50;

    console.log(data);

    var x = Object.keys(data['first']).map(key => data['first'][key]);
    var y = Object.keys(data['second']).map(key => data['second'][key]);
    var color = Object.keys(data['color']).map(key => data['color'][key]);
    
    var colors = ['red', 'blue', 'green']

    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (plot_width - 150) + "," + 50 + ")");

    var xScale = d3.scaleLinear()
        .domain([d3.min(x), d3.max(x)])
        .range([0, plot_width]);

    var yScale = d3.scaleLinear()
        .domain([d3.min(y), d3.max(y)])
        .range([plot_height, 0]);

    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);    

    svg.append("g")
        .attr("transform", "translate(0," + plot_height + ")")
        .attr("class", "x-axis")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.selectAll("circle")
        .data(x)
        .enter()
        .append("circle")
        .attr("cx", function(d, i) { return xScale(d); })
        .attr("cy", function(d, i) { return yScale(y[i]); })
        .attr("r", 3.5)
        .attr("fill", function(d, i) { return colors[color[i]]; });

    svg.append("text")
        .attr("transform", "translate(" + (plot_width/2) + " ," + (plot_height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("First Dimension");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 20)
        .attr("x",0 - (plot_height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Second Dimension");

    var legend = svg.selectAll(".legend")
        .data(colors)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", plot_width + 50)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
        .attr("x", plot_width + 130)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d, i) { return 'Cluster' + (i+1); });

    svg.append("text")
        .attr("x", (plot_width / 2))
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text("MDS Data Plot");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("background-color", "white")
        .style("opacity", 0);

    svg.selectAll("circle")
        .on("mouseover", function(d,i) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("First Dimension : " + parseFloat(i).toFixed(3) + "<br/>" + "Second Dimension : " + parseFloat(y[x.indexOf(i)]).toFixed(3))
                .style("left", d.x + 20 + "px")
                .style("top", d.y + "px");
        }
    )
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }
    );
});