d3.json('/biplot').then(function(data) {
    d3.select('#tool_tip').style('opacity', 0);
    var margin = {top: 10, right: 10, bottom: 30, left: 30},
    width = 1050 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    data = JSON.parse(data);
    console.log(data);

    plot_width = width/2;
    plot_height = height-50;

    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + plot_width + "," + 50 + ")");
    
    svg.append("defs")
        .append("marker")
        .attr("id", "triangle")
        .attr("refX", 6)
        .attr("refY", 6)
        .attr("markerWidth", 15)
        .attr("markerHeight", 15)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0 0 12 6 0 12 3 6")
        .style("fill", "black");

    let a = data['eigen']['PC1'];
    let max = d3.max(Object.keys(a), function(d,i) { return 1; });
    var x_axis = d3.scaleLinear()
        .domain([-max, d3.max(Object.keys(a), function(d,i) { return 1; })])
        .range([0, plot_width]);

    svg.append("g")
        .attr("transform", "translate(0," + plot_height + ")")
        .attr("class", "x-axis")
        .call(d3.axisBottom(x_axis))
        .call(g => g.append("text")
        .style('font-size', '15px')
        .attr("x", plot_width/2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .text("PC1"));

    a = data['eigen']['PC2'];
    max = d3.max(Object.keys(a), function(d,i) { return 1; });
    var y_axis = d3.scaleLinear()
        .domain([-max,max])
        .range([plot_height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y_axis))
        .call(g => g.append("text")
        .style('font-size', '15px')
        .attr("x", -plot_height/2)
        .attr("y", -50)
        .attr("fill", "black")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .text("PC2"));

    let p_C1 = data['eigen']['PC1'];
    let p_C2 = data['eigen']['PC2'];

    var colors = ['red', 'blue', 'green'];
    

    svg.append("g")
        .selectAll("dot")
        .data(Object.keys(p_C1))
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x_axis(p_C1[d]); } )
        .attr("cy", function (d) { return y_axis(p_C2[d]); } )
        .attr("r", 3)
        .style("fill", function(d) { return colors[data['kmeans_color'][d]]; });

    let origin = 0.4;
    let bi_plot_graph = svg.append("g");

    p_C1 = data['load']['PC1'];
    p_C2 = data['load']['PC2'];

    bi_plot_graph.selectAll(".line")
        .data(Object.keys(data['load']['PC1']))
        .enter()
        .append("line")
        .style("stroke", "black")
        .style("stroke-width", 1)
        .attr("x1", function(d) {return x_axis(-origin)})
        .attr("y1", function(d) { return y_axis((p_C2[d]/p_C1[d])*(-origin))})
        .attr("x2", function(d) {return x_axis(origin)})
        .attr("y2", function(d) { return y_axis((p_C2[d]/p_C1[d])*origin); })
        .attr("marker-end", "url(#triangle)");

    bi_plot_graph.selectAll('text')
        .data(Object.keys(data['load']['PC1']))
        .enter()
        .append('text')
        .attr('x', function(d) { return x_axis(origin); })
        .attr('y', function(d) { return y_axis((p_C2[d]/p_C1[d])*origin); })
        .attr('dy', ".35em")
        .style("font-size", "13px")
        .text(function(d) { return d; });

    svg.append("text")
        .attr("x", (plot_width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text("Biplot");

    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(colors)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", plot_width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", function(d) { return d; });

    legend.append("text")
        .attr("x", plot_width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d, i) { return "Cluster " + (i+1)});

});

