d3.json('/elbowplot').then(function(data) {
    d3.select('#tool_tip').style('opacity', 0);
    var margin = {top: 10, right: 10, bottom: 30, left: 30},
    width = 1050 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    plot_width = width/2;
    plot_height = height-50;

    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + plot_width + "," + 50 + ")");

    var x_axis = d3.scaleLinear()
        .domain([0, data.length])
        .range([0, plot_width]);
    
    svg.append("g")
        .attr("transform", "translate(0," + plot_height + ")")
        .attr("class", "x-axis")
        .call(d3.axisBottom(x_axis))
        .call(g => g.append("text")
        .style('font-size', '15px')
        .attr("x", plot_width/2 - 60)
        .attr("y", 35)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .text("Number of Clusters"));

    var y_axis = d3.scaleLinear()
        .domain([0, d3.max(data, function(d,i) { return d; })])
        .range([plot_height, 0]);
        
    svg.append("g")
        .call(d3.axisLeft(y_axis))
        .call(g => g.append("text")
        .style('font-size', '15px')
        .attr("x", -plot_height/2)
        .attr("y", -30)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .attr("transform", "rotate(-90)")
        .text("Inertia"));

    var line = d3.line()
        .x(function(d,i) { return x_axis(i+1); })
        .y(function(d,i) { return y_axis(d); });

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2);

    svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d,i) { return x_axis(i+1); } )
        .attr("cy", function (d,i) { return y_axis(d); } )
        .attr("r", 5)
        .style("fill", "#69b3a2");

    svg.append("line")
        .attr("x1", x_axis(1))
        .attr("y1", y_axis(data[0]))
        .attr("x2", x_axis(data.length))
        .attr("y2", y_axis(data[data.length-1]))
        .attr("stroke-width", 2)
        .attr("stroke", "red");

    svg.append("circle")
        .attr("cx", x_axis(3))
        .attr("cy", y_axis(data[2]))
        .attr("r", 8)
        .style("fill", "red");

    svg.append("text")
        .attr("x", plot_width/2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text("Elbow Plot");
});