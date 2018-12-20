// @TODO: YOUR CODE HERE!

// Define SVG area dimensions
var svgWidth = 800;
var svgHeight = 600;

// Define the chart's margins as an object
var chartMargin = {
  top: 30,
  right: 30,
  bottom: 60,
  left: 50
};

// Define dimensions of the chart area
var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
  .select("body")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);


var chosenXAxis = "income";
var chosenYAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(csv_Data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(csv_Data, d => d[chosenXAxis]) * 0.8,
      d3.max(csv_Data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, chartWidth]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "income") {
    var label = "Income:";
  }
  else {
    var label = "No Health Insurance:";
  }

	var y_label = "Smokers:";

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.abbr}<br>${label} ${d[chosenXAxis]}<br>${y_label} ${d[chosenYAxis]}`
      	);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

const state_data = [];
var myData = null;
const income = [];
const noHealthInsurance = [];
const poverty = [];
const obesity = [];
const smokes = [];
const state = [];
const abbr = [];

const reshaped = [];
const reshaped_2 = [];
const reshaped_3 = [];




d3.csv("data.csv").then(function(csv_Data){
	  //if (error) throw error;
console.log(csv_Data)

	  // parse data
 csv_Data.forEach(function(data) {
   data.poverty = +data.poverty;
   data.povertyMoe = +data.povertyMoe;
   data.age = +data.age;
   data.ageMoe = +data.ageMoe;
   data.income = +data.income;
   data.incomeMoe = +data.incomeMoe;
   data.noHealthInsurance = +data.noHealthInsurance;
   data.obesity = +data.obesity;
   data.smokes = +data.smokes;
 })
	//data_push(csv_Data);

  // xLinearScale function above csv import
  var xLinearScale = xScale(csv_Data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([7, d3.max(csv_Data, d => d.smokes)])
    .range([chartHeight, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  var circlesGroup = chartGroup.selectAll("circle")
    .data(csv_Data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.smokes))
    .attr("r", 20)
    .attr("fill", "green")
    .attr("opacity", ".7");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var income_label = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "income") // value to grab for event listener
    .classed("active", true)
    .classed("axis-text", true)
    .text("Income");

  var insurance_Label = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "noHealthInsurance") // value to grab for event listener
    .classed("inactive", true)
    .classed("axis-text", true)
    .text("No Health Insurance Metric");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - chartMargin.left)
    .attr("x", 0 - (chartHeight / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Smoker Metric");


  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(csv_Data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "smokes") {
          insurance_Label
            .classed("active", true)
            .classed("inactive", false);
          income_label
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          insurance_Label
            .classed("active", false)
            .classed("inactive", true);
          income_label
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

});

function data_push(data){
	//push each object to array. array is const instead of var so it doesn't get overwritten

	for(i=0; i <data.length; i++)
	{income.push(data[i].income);
	 noHealthInsurance.push(data[i].noHealthInsurance);
	 poverty.push(data[i].poverty);
	 obesity.push(data[i].obesity);
	 smokes.push(data[i].smokes);
	 state.push(data[i].state);
	 abbr.push(data[i].abbr);
	}

	reshaped.push(
		{"Abbr": abbr,
		"Income": income,
		"noHealthInsurance": noHealthInsurance,
		"Poverty": poverty,
		"Obesity": obesity,
		"Smokes": smokes,
		"State": state
	})
	console.log(reshaped)
	console.log(reshaped[0].Income)
	console.log(reshaped[0].Income[0])

	for(i=0; i <data.length; i++){
		reshaped_3.push(
			abbr[i],
			income[i],
			noHealthInsurance[i],
			poverty[i],
			obesity[i],
			smokes[i],
			state[i]
			)
	}

var att_per_state = 7;

var state_arrays = [];

    for (i = 0; i < reshaped_3.length; i += att_per_state) {
        myChunk = reshaped_3.slice(i, i+att_per_state);
        // Do something if you want with the group
        state_arrays.push(myChunk);
    }

console.log(state_arrays);
console.log(state_arrays[0]);
console.log(state_arrays[0][0]);

};

