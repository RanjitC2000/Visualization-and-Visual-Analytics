d3.json('/screeplot').then(function(data) {
    d3.select('#tool_tip').text("Dimensionality Index - select an Index")
            .style("text-align", "center")
            .style("opacity", 1);
    var margin = {top: 10, right: 10, bottom: 30, left: 30},
    width = 1050 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    console.log(data);

    plot_width = width/2;
    plot_height = height-50;

    var x = d3.scaleLinear()
        .domain([0, data[0].length])
        .range([0, plot_width]);

    var y = d3.scaleLinear()
        .domain([0, 1])
        .range([plot_height, 0]);

    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + plot_width + "," + 50 + ")");
        

    svg.selectAll("rect")
        .data(data[0])
        .enter()
        .append("rect")
        .attr("x", function(d, i) { return x(i); })
        .attr("y", function(d) { return y(d); })
        .attr("width", 40)
        .attr("height", function(d) { return plot_height - y(d); })
        .attr("fill", "steelblue");

    svg.append("g")
        .attr("transform", "translate(0," + plot_height + ")")
        .attr("class", "x-axis")
        .call(d3.axisBottom(x).tickFormat(function(d, i) { return "PC" + (i + 1); }));

    svg.append("g")
        .call(d3.axisLeft(y));

    var line = d3.line()
        .x(function(d, i) { return x(i+0.4); })
        .y(function(d) { return y(d); });

    svg.append("path")
        .datum(data[1])
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "red")
        .attr("stroke-width", 2)
        .attr("d", line);
        
    svg.selectAll("dot")
        .data(data[1])
        .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d, i) { return x(i+0.4); })
        .attr("cy", function(d) { return y(d); })
        .attr("fill", "red")
        .on("mouseover", function(d) {
            d3.select(this)
                .attr("r", 8)
                .attr("fill", "purple")
                .append("text")
                .attr("class", "value")
                .attr("x", function(d) { return x(d+0.3); })
                .attr("y", function(d) { return y(d) - 15; })
                .text(d3.format(".2f")(d));
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("r", 5)
                .attr("fill", "red")
                .select(".value")
                .remove();
        })
        .on("click", function(d, i) {
            d3.select('#tool_tip').text("Dimensionality Index " + (data[1].indexOf(i)+1))
            .style(
                "text-align", "center"
            );
            $.ajax({
                type: "POST",
                url: "/screeplot",
                data: JSON.stringify({'key': data[1].indexOf(i)}),
                contentType : "application/json",
                dataType: "json",
              });
        });
                

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - 50)
        .attr("x", 0 - (plot_height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Explained Variance");

    svg.append("text")
        .attr("transform", "translate(" + (plot_width/ 2) + " ," + (plot_height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text("Principal Component");

    svg.append("text")
        .attr("x", (plot_width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")
        .style("font-weight", "bold")
        .text("Scree Plot");
});