d3.json('/scatterplot').then(function(data) {
    d3.select('#tool_tip').style('opacity', 0.0);
    data = JSON.parse(data);
    console.log(data);

    var margin = {top: 10, right: 10, bottom: 30, left: 30},
    width = 1500 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom;

    var size = 350;
    var padding = 20;

    var size_plot = 300;

    var x = d3.scaleLinear().range([padding/2, size_plot - padding/2]);
    var y = d3.scaleLinear().range([size_plot - padding/2, padding/2]);

    var table = d3.select("#table").append("table")
        .attr("class", "table table-striped table-bordered table-hover table-sm")
        .attr("width", width)
        .attr("height", 100 + margin.top + margin.bottom)
        .style("margin-left", 15 + "px")

    var columns = Object.keys(data['table_data']);

    columns.unshift('feature');

    table.append("thead").append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function(column) { return column; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("background-color", "lightgray")
        .style("font-weight", "bold")
        .style("text-align", "center")
        .style("text-transform", "uppercase");

    var feature1_values = Object.values(data['table_data_sup'][data['features'][0]]);
    var feature2_values = Object.values(data['table_data_sup'][data['features'][1]]);
    var feature3_values = Object.values(data['table_data_sup'][data['features'][2]]);
    var feature4_values = Object.values(data['table_data_sup'][data['features'][3]]);

    feature1_values.unshift(data['features'][0]);
    feature2_values.unshift(data['features'][1]);
    feature3_values.unshift(data['features'][2]);
    feature4_values.unshift(data['features'][3]);

    var rows = table.append("tbody").selectAll("tr")
        .data([feature1_values, feature2_values, feature3_values, feature4_values])
        .enter()
        .append("tr")
        .selectAll("td")
        .data(function(d) { return d; })
        .enter()
        .append("td")
        .text(function(d) { return (typeof d === 'number') ? Number(d).toFixed(4) : d; })
        .style("border", "1px black solid")
        .style("padding", "5px")
        .style("text-align", "center")
        .style("background-color", function(d, i) {return "white";})
        .on("mouseover", function(d, i) { d3.select(this).style("background-color", "lightblue"); })
        .on("mouseout", function(d, i) { d3.select(this).style("background-color", "white"); });

    var svg = d3.select("#plot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    

    const colors = ['red', 'blue', 'green'];

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var g = svg.append("g")
                .attr("transform", "translate(" + (i * (size + padding) + padding) + "," + (j * (size + padding) + padding) + ")");

            if (i != j){

                x.domain([data['domainRange'][data['features'][i]]['mn'], data['domainRange'][data['features'][i]]['mx']])
                 .range([padding+20, size_plot - padding]);
                y.domain([data['domainRange'][data['features'][j]]['mn'], data['domainRange'][data['features'][j]]['mx']])
                    .range([size_plot - padding, padding]);
                g.append("g")
                    .attr("class", "x_axis")
                    .attr("transform", "translate(-1.5," + (size_plot - padding+2) + ")")
                    .call(d3.axisBottom(x));
                    
                g.append("g")
                    .attr("class", "y_axis")
                    .attr("transform", "translate(" + (padding +16.5) + ",2)")
                    .call(d3.axisLeft(y));

                g.selectAll(".dot")
                    .data(data['data'])
                    .enter().append("circle")
                    .attr("class", "dot")
                    .attr("r", 3.5)
                    .attr("cx", function(d) { return x(d[data['features'][i]]); })
                    .attr("cy", function(d) { return y(d[data['features'][j]]); })
                    .style("fill", function(d) { return colors[d['kmeans_color']]; });

                var legend = g.selectAll(".legend")
                    .data(colors)
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

                legend.append("rect")
                    .attr("x", size_plot - 18)
                    .attr("width", 18)
                    .attr("height", 18)
                    .style("fill", function(d, i) { return colors.slice().reverse()[i]; });

                legend.append("text")
                    .attr("x", size_plot - 24)
                    .attr("y", 9)
                    .attr("dy", ".35em")
                    .style("text-anchor", "end")
                    .text(function(d, i) { return "Cluster " + (i+1); });
            }
            else {
                g.append("text")
                    .attr("class", "label")
                    .attr("x", size_plot / 2)
                    .attr("y", size_plot / 2)
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .style("font-size", "40px")
                    .style("font-weight", "bold")
                    .style("text-decoration", "underline")
                    .text(data['features'][i]);
            }

            g.append("rect")
                .attr("class", "plot")
                .attr("width", size - padding)
                .attr("height", size - padding)
                .style("fill", "none")
                .style("stroke", "black");
        }
    }
    svg.append("text")
        .attr("class", "title")
        .attr("x", (width / 2))
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-decoration", "underline")

        .style("font-weight", "bold")
        .text("Scatter Plot Matrix");
});