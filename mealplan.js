<script src="http://d3js.org/d3.v3.min.js"></script>
<script src="http://labratrevenge.com/d3-tip/javascripts/d3.tip.v0.6.3.js"></script>



var margin = {top: 40, right: 20, bottom: 150, left: 40},
    width = 700 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

//var formatPercent = d3.format(".0%");

var freshmen = false;
var upperclassmen = false;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);
    //.rangeBands([0, 100]]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    //.tickFormat(formatPercent);

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Cost/Meal:</strong> <span style='color:red'>" + "$" + d.cost + "</span>";
  })

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.call(tip);

// default draw, without button clicks
d3.tsv("data.tsv", type, function(error, data) {
  y.domain([0, d3.max(data, function(d) { return d.cost; })]);
  draw(data);
});

function type(d) {
  d.cost = +d.cost;
  return d;
}

function draw(data) {
  x.domain(data.map(function(d) { return d.plan; }));
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")  
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) { return "rotate(-65)"; });

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Cost ($/meal)");

  svg.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", function(d) { return d.plan.split(" ", 1)[0] === "Barnard" ? "barnard-bar" : "columbia-bar"; })
      .attr("x", function(d) { return x(d.plan); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.cost); })
      .attr("height", function(d) { return height - y(d.cost); })
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
}

function update(data) {
  // get bars from data
  var bars = svg.selectAll("rect")
    .data(data);

  x.domain(data.map(function(d) { return d.plan; }));
  //Update x-axis
  svg.select(".x.axis")
      .transition()
      .duration(500)
      .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) { return "rotate(-65)"; });

      
  //Exit (removing bars)…
  bars.exit()
    .transition()
    .duration(500)
    .attr("height", 0)
    .attr("y", height)
    .remove(); 
    
  //Update (updating existing bars)…
  bars
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)
      .attr("class", function(d) { return d.plan.split(" ", 1)[0] === "Barnard" ? "barnard-bar" : "columbia-bar"; })
      .transition()
      .duration(500)
      .attr("x", function(d) { return x(d.plan); })
      .attr("y", function(d) { return y(d.cost); })
      .attr("width", x.rangeBand())
      .attr("height", function(d) { return height - y(d.cost); });
    
  svg.selectAll("rect") //Selects all rects (as yet nonexistent)
    .data(data)     //Binds data to selection, returns update selection
    .enter()           //Extracts the enter selection, i.e., 20 placeholder elements
    .append("rect");    //Creates a 'rect' inside each of the placeholder elements
  
  //Enter (new bars)…
  bars.enter()
    .append("rect")
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .attr("class", function(d) { return d.plan.split(" ", 1)[0] === "Barnard" ? "barnard-bar" : "columbia-bar"; })
    .attr("x", function(d) { return x(d.plan); })
    .attr("width", x.rangeBand())
    .attr("height", 0)
    .attr("y", height)
    .transition()
    .duration(500)
    .attr("y", function(d) { return y(d.cost); })
    .attr("height", function(d) { return height - y(d.cost); });
}


// Potential better way to do colors: .style("fill", function(d) { return d.plan.split(" ", 1)[0] === "Barnard" ? d3.rgb("#005596") : d3.rgb("#C4D8E2"); });

//  drawing with freshmen limited data section, called by click
function freshmenData() {
    if (!freshmen) {
      freshmen = true;
      upperclassmen = false;
      //svg.selectAll("*").remove();
      // Get limited data
      d3.tsv("freshmen.tsv", function(error, data) {
        update(data);
      });
    }
}

//  drawing just upperclassmen limited data section, called by click
function upperclassmenData() {
    if (!upperclassmen) {
      freshmen = false;
      upperclassmen = true;
      //svg.selectAll("*").remove();
      // Get limited data
      d3.tsv("upperclassmen.tsv", function(error, data) {
        update(data);
      });
    }
}

function allData() {
  if (freshmen || upperclassmen)
  {
    freshmen = false;
    upperclassmen = false;
    //svg.selectAll("*").remove();
    // Get the data again
    d3.tsv("data.tsv", function(error, data) {
      update(data);
    });
  }
}
