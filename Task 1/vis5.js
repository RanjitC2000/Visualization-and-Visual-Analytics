var feature = document.getElementById("feature").value;
var axis = d3.select("input[name='axis']:checked").property("value");

var margin = {top: 40, right: 20, bottom: 30, left: 40},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

var x = d3.scaleLinear().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([height, 0]);

var svg = d3.select("body").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("pokemon.csv", function(error, data) {
        if (error) throw error;

        data.forEach(function(d) {
            d[x_feature] = +d[x_feature];
            d[y_feature] = +d[y_feature];
        });
        
        x.domain([d3.min(data,function(d){return d[x_feature]}), d3.max(data, function(d) { return d[x_feature]; })]).nice();
        y.domain([d3.min(data,function(d){return d[y_feature]}), d3.max(data, function(d) { return d[y_feature]; })]).nice();

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("g")
            .call(d3.axisLeft(y));
            
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", function(d) { return x(d[x_feature]); })
            .attr("cy", function(d) { return y(d[y_feature]); })
            .style("fill", "darkblue");

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
            
        svg.selectAll("circle")
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("Pokemon name : " + d.name + "<br/>" + x_feature + " : " + d[x_feature] + "<br/>" + y_feature + " : " + d[y_feature])
                    .style("left", (d3.event.pageX + 30) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            }
        );

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(y_feature);

        svg.append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," +
                -20 + ")")
            .style("text-anchor", "middle")
            .text(x_feature + " vs " + y_feature);

        svg.append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," +
                (height + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text(x_feature);

    });
