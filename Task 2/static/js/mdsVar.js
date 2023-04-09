d3.json('/mds_var').then(function(data) {
    var margin = {top: 10, right: 10, bottom: 30, left: 30},
    width = 675 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

    plot_width = 550;
    plot_height = height-100;

    data = JSON.parse(data);
    console.log(data);

    var x = Object.keys(data['data']['first']).map(key => data['data']['first'][key]);
    var y = Object.keys(data['data']['second']).map(key => data['data']['second'][key]);
    var name = Object.keys(data['data']['name']).map(key => data['data']['name'][key]);

    var key_array_for_pcp = [];

    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 100 + "," + 50 + ")");

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
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("click", function(d,i) {
            if (d3.select(this).attr("fill") == "steelblue") {
                d3.select(this).attr("fill", "red")
                    .transition()
                    .duration(500)
                    .attr("r", 10)
                key_array_for_pcp.push(name[x.indexOf(i)])
            }
            else {
                d3.select(this).attr("fill", "steelblue")
                    .transition()
                    .duration(500)
                    .attr("r", 5)
                key_array_for_pcp.splice(key_array_for_pcp.indexOf(name[x.indexOf(i)]), 1)
            }
            $.ajax({
                type: "POST",
                url: "/mds_var",
                data: JSON.stringify({'key': key_array_for_pcp}),
                contentType : "application/json",
                dataType: "json",
              })
            if (key_array_for_pcp.length > 1) {
                d3.select("#plotpcp").selectAll("*").remove();
                d3.select("#plotpcp").append("script").attr("src", "static/js/mdsPcp.js");
            }
            else {
                d3.select("#plotpcp").selectAll("*").remove();
            }
        });

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -20 - margin.left)
        .attr("x",0 - (plot_height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Second Dimension");

    svg.append("text")
        .attr("transform", "translate(" + (plot_width/2) + " ," + (plot_height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("First Dimension");

    svg.append("text")
        .attr("transform", "translate(" + (plot_width/2) + " ," + (plot_height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .text("Click on atleast two points to plot parallel coordinates");

    svg.append("text")
        .attr("transform", "translate(" + (plot_width/2) + " ," + (plot_height + margin.top + 60) + ")")
        .style("text-anchor", "middle")
        .text("Click on a point again to deselect it");
    
        svg.append("text")
        .attr("x", (plot_width / 2))
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text("MDS Variable Plot");
        
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
            tooltip.html("Feature : " + name[x.indexOf(i)] + "<br/>" + "First Dimension : " + parseFloat(i).toFixed(3) + "<br/>" + "Second Dimension : " + parseFloat(y[x.indexOf(i)]).toFixed(3))
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