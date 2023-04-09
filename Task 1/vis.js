var feature = document.getElementById("feature").value;
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1300 - margin.left - margin.right,
    height = 525 - margin.top - margin.bottom;

d3.select("#toggle-button").classed("toggle-button-active", true);

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
var y = d3.scaleLinear().rangeRound([height, 0]);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", 500 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + 425 + "," + 25 + ")");
    
d3.csv("pokemon.csv", function(error,data) {
    if (error) throw error;
    
    var countObj = {};
    data.forEach(function(d) {
        var feature = document.getElementById("feature").value;
        if(countObj[d[feature]] == undefined) {
            countObj[d[feature]] = 1;
        } else {
            countObj[d[feature]]++;
        }
    });
    var color = d3.scaleOrdinal(d3.schemeCategory10);

    x.domain(Object.keys(countObj)).rangeRound([0, 475]);
    y.domain([0, d3.max(Object.values(countObj))]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("font-size", "7px")
        .style("fill", "#333333");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y))
        .style("font-size", "14px")
        .style("fill", "#333333");

    svg.selectAll(".bar")
        .data(Object.keys(countObj))
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d); })
        .attr("width", x.bandwidth())
        .attr("y", function(d) { return y(countObj[d]); })
        .attr("height", function(d) { return height - y(countObj[d]); })
        .style("fill", function(d) { return color(d); })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Count: " + countObj[d])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }
        )
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        }
        );

        svg.append("text")
            .attr("x", 237)
            .attr("y", -5)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("text-decoration", "underline")
            .text("Count of " + feature);

        svg.append("text")
            .attr("class","xlabel")
            .attr("x", 237)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(feature);

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("class","ylabel")
            .attr("y", 0 - 75)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text("Count");

        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var horizontal = false;

        d3.select("#toggle-button").on("click", function() {
            horizontal = !horizontal;
            if(horizontal) {
                y.rangeRound([0, 475]);
                x.rangeRound([0, 475]); 
                svg.selectAll(".bar")
                    .transition()
                    .duration(1000)
                    .attr("x", 0.9)
                    .attr("height", function(d) { return x.bandwidth(); })
                    .attr("y", function(d) { return x(d);})
                    .attr("width", function(d) { return y(countObj[d]); });
        
                svg.select(".y.axis")
                    .transition()
                    .duration(1000)
                    .call(d3.axisLeft(x));
                
                svg.select(".x.axis")
                    .transition()
                    .duration(1000)
                    .call(d3.axisBottom(y));

                svg.select(".xlabel")
                    .text("Count");

                svg.select(".ylabel")
                    .text(feature);
        
            } else {
                y.rangeRound([475,0]);
                x.rangeRound([0, 475]);
                svg.selectAll(".bar")
                    .transition()
                    .duration(1000)
                    .attr("x", function(d) { return x(d); })
                    .attr("width", x.bandwidth())
                    .attr("y", function(d) { return y(countObj[d]); })
                    .attr("height", function(d) { return height - y(countObj[d]);})
        
                svg.select(".y.axis")
                    .transition()
                    .duration(1000)
                    .call(d3.axisLeft(y));
        
                svg.select(".x.axis")
                    .transition()
                    .duration(1000)
                    .call(d3.axisBottom(x));

                svg.select(".xlabel")
                    .text(feature);

                svg.select(".ylabel")
                    .text("Count");
            }
        });
    });
