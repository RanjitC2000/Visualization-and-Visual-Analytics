d3.json('/mds_pcp').then(function(data) {
    var margin = {top: 10, right: 10, bottom: 30, left: 30},
    width = 860 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

    plot_height = height - 20;
    plot_width = width-150;
    
    data = JSON.parse(data);

    var color = ['red','blue','green']
    dimensions = Object.keys(data['data'][0]).filter(function(d){ return d != 'color' })

    var y = {}
    for (i in dimensions){
        var name = dimensions[i]
            y[name] = d3.scaleLinear()
                .domain( d3.extent(data['data'], function(d) { return +d[name]; } ) ).nice()
                .range([plot_height, 0])
    }

    var x = d3.scalePoint()
        .range([0,plot_width])
        .padding(1)
        .domain(dimensions);

    var highlight = function(d,i){
        selected = color[i.color]
        d3.selectAll(".line")
            .transition().duration(200)
            .style("stroke", "lightgrey")
            .style("opacity", "0.2")

        d3.selectAll("." + selected)
            .transition().duration(200)
            .style("stroke", selected)
            .style("opacity", "1")   
        
        d3.selectAll(".linenumber" + data.data.indexOf(i))
            .transition().duration(200)
            .style("stroke-width", "10px")
        
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html("Pokemon Name: " + data['name'][data.data.indexOf(i)] + "<br/>" + "<br/>" + "Dimensions: " + "<br/>" + dimensions.map(function(p) { return p + ": " + i[p]; }).join("<br/>"))
            .style("left", 1375 + "px")
            .style("top", 300 + "px");
    }

    var doNotHighlight = function(event,d){
        d3.selectAll(".line")
            .transition().duration(200).delay(300)
            .style("stroke", function(d){ return( color[d.color] ) })
            .style("stroke-width", "0.5px")
            .style("opacity", "1")
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }
        
    var svg = d3.select("#plotpcp").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 50 + ")");
    
    svg.selectAll("myPath")
        .data(data['data'])
        .join("path")
        .attr("class", function (d,i) { return "line " + color[d.color] + " linenumber"+ i} )
        .attr("d",  path)
        .style("fill", "none" )
        .style("stroke", function(d){ return( color[d.color] ) })
        .style("opacity", 0.5)
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)

    svg.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")

    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", -20 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text("Parallel Coordinates Plot");

    var legend = svg.selectAll(".legend")
        .data(color)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", plot_width)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return color[i]; });

    legend.append("text")
        .attr("x", plot_width+20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d, i) {
            switch (i) {
                case 0: return "Cluster 1";
                case 1: return "Cluster 2";
                case 2: return "Cluster 3";
            }
        }
    );

    var tooltip = d3.select("#plotpcp").append("div")
        .attr("class", "tooltip")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("opacity", 0);
});