//define chart area

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
    };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
.select(".chart")
.append("svg")
.attr("width", svgWidth)
.attr("height", svgHeight + 40);

var chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

var textGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

//parameters

var chosenXaxis = "poverty";
var chosenYaxis = "healthcare";

function xScale(demData, chosenXaxis) {
    var xLinearSCale = d3.scaleLinear()
        .domain([d3.min(demData , d => parseFloat(d[chosenXaxis]) * .9), d3.max(demData, d => parseFloat(d[chosenXaxis]) *1.10)])
        .range([0, width]);
    return xLinearSCale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function yScale(demData, chosenYaxis) {
    var yLinearSCale = d3.scaleLinear()
        .domain([4, d3.max(demData, d => (d[chosenYaxis]))])
        .range([height, 0]);
            
    return yLinearSCale;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

    return yAxis;
}

function renderXCircles(circlesGroup, newXScale, chosenXaxis, circlesText) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXaxis]));

    circlesText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXaxis]));
    
    return circlesGroup;
}

function renderYCircles(circlesGroup, newYScale, chosenYaxis, circlesText) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYaxis]));

    circlesText.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYaxis]));

    return circlesGroup;
}

function updateToolTip(chosenXaxis, chosenYaxis, circlesGroup) {

        if (chosenXaxis === "poverty") {
            var xLabel = "In Poverty: ";
        }
        else if (chosenXaxis === "age") {
            var xLabel = "Age (Median): ";
        } 
        else { var xLabel = "Household Income (Median): ";
        }
    
    console.log(`chosenXaxis: ${chosenXaxis}`);    

    
        if (chosenYaxis === "obesity") {
            var yLabel = "Obese: ";
        }
        else if (chosenYaxis === "smokes") {
            var yLabel = "Smokes: "
        }
        else { var yLabel = "Lacks Healthcare: "}
    
    console.log(`chosenYaxis: ${chosenYaxis}`);

    var toolTip = d3.tip()
        .offset([120, -50])
        .attr("class", 'd3-tip')
        .html(function(d) {

            if (chosenXaxis ==="age") {
                return (`${d.state} <br> ${xLabel} ${d[chosenXaxis]} <br> ${yLabel}${d[chosenYaxis]}%`);
            }

            else if (chosenXaxis === "income") {
                return (`${d.state} <br> ${xLabel}$${d[chosenXaxis]} <br> ${yLabel}${d[chosenYaxis]}%`);
        }

            else {
                return (`${d.state} <br> ${xLabel} ${d[chosenXaxis]}% <br> ${yLabel}${d[chosenYaxis]}%`);
        }
        });

    circlesGroup.call(toolTip); 

    circlesGroup
    .on('mouseover', function(d) {
        toolTip.show(d, this);
    })
    .on('mouseout', function(d) {
        toolTip.hide(d);
    });

    return circlesGroup;
};

//append graph
    
    //import data
    var demData = d3.csv("assets/data/data.csv").then(demData => {
        console.log(demData)

        demData.forEach((data) => {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes; 
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
    });

    var xLinearScale = xScale(demData, chosenXaxis);

    var yLinearScale = yScale(demData, chosenYaxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
        .data(demData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXaxis]))
        .attr("cy", d => yLinearScale(d[chosenYaxis]))
        .attr("r", "17")
        .attr("stroke-width", "1")
        .classed("stateCircle", true)
        .attr("opacity", 0.5);

    var circlesText = textGroup.selectAll("text")
        .data(demData)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXaxis]))
        .attr("y", d => yLinearScale(d[chosenYaxis]))
        .attr("text-anchor", "middle")

    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 30})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0 - margin.right +100)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("In Poverty (%)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", - margin.right +80)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Household Income (Median)");

    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");

    var yLabelsGroup = chartGroup.append("g"); 

    var healthcareLabel = yLabelsGroup.append("text") 
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare") 
        .attr("y", 0 - margin.left +35) 
        .attr("x", 0 - (height / 2)) 
        .attr("dy", "1em")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var obeseLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity") 
        .attr("y", 0 - margin.left +15) 
        .attr("x", 0 - (height / 2)) 
        .attr("dy", "1em")
        .classed("inactive", true)
        .text("Obese (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes") 
        .attr("y", 0 - margin.left -5)
        .attr("x", 0 - (height /2))
        .attr("dy", "1em") //wat??? 
        .classed("inactive", true)
        .text("Smokes (%)");

//tooltip

    var circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    xLabelsGroup.selectAll("text")
    .on("click", function() {

    var value = d3.select(this).attr("value");
        if (value !== chosenXaxis) {

        chosenXaxis = value;
        console.log(chosenXaxis);

        var xLinearScale = xScale(demData, chosenXaxis);

        xAxis = renderXAxes(xLinearScale, xAxis);

        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXaxis, circlesText);

        circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

    if (chosenXaxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
    }

    else if (chosenXaxis === "age") {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", true)
            .classed("inactive", false);
        incomeLabel
            .classed("active", false)
            .classed("inactive", true);
    }

    else {
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
    });

    yLabelsGroup.selectAll("text")
        .on("click", function() {

        var yValue = d3.select(this).attr("value");
        if (yValue !== chosenYaxis) {

        chosenYaxis = yValue;
        console.log(chosenYaxis);

        var yLinearScale = yScale(demData, chosenYaxis);

        yAxis = renderYAxes(yLinearScale, yAxis);

        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYaxis, circlesText);

        circlesGroup = updateToolTip(chosenXaxis, chosenYaxis, circlesGroup);

        if (chosenYaxis === "obesity") {
            obeseLabel
                .classed("active", true)
                .classed("inactive", false);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
        }

        else if (chosenYaxis === "smokes") {
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", true)
                .classed("inactive", false);
            healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
        }

        else {
            obeseLabel
                .classed("active", false)
                .classed("inactive", true);
            smokesLabel
                .classed("active", false)
                .classed("inactive", true);
            healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
            }
    }})
});