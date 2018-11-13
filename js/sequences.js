/*---------------------------------------------------------------------------------------------------------------------------------*/

/* -------------------Global Variables------------------------------------------------------------------------------------*/

// Dimensions of sunburst.
var width = 750;
var height = 400;

//Sunburst Radius
var radius = Math.min(width, height) / 3;

// Trail dimensions: width, height, spacing, width of tip/tail.
var b = {
  w: 113, h: 30, s: 10, t: 5
};

//Designations split
var designationlist = ['General Staff','Manager Director and GTS', 'AC and Above'];

//Months
var monthID = {
  'Jan' : 1,'Feb' : 2,'Mar' : 3,'Apr' : 4,
  'May' : 5,'Jun' : 6,'Jul' : 7,'Aug' : 8,
  'Sep' : 9,'Oct' : 10,'Nov' : 11,'Dec' : 12
};

// Total size of all segments; we set this later, after loading the data.
var totalSize = 0;


var linkage = [];
var vis = "";

//Color palettes to define fixed color formats
var color_palettes = [
['#4abdac', '#fc4a1a', '#f7b733'],
['#f03b20', '#feb24c', '#ffeda0'],
['#007849', '#0375b4', '#ffce00'],
['#373737', '#dcd0c0', '#c0b283'],
['#e37222', '#07889b', '#eeaa7b'],
['#062f4f', '#813772', '#b82601'],
['#565656', '#76323f', '#c09f80']];

//Define the partition
var partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

//X, Y scaling
x = d3.scaleLinear().range([0, 2 * Math.PI]);
y = d3.scaleSqrt().range([0, radius]);

//Arcs
var arc = d3.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

//Set colors to scale
var color = d3.scaleLinear().domain([0, 0.5, 1]).range(color_palettes[~~(Math.random() * 6)]);

partition = d3.partition();
var colors = {};

var first_build = true;
var first = true;
var queue = d3.queue();

function runbaby(data){
  var endgoals = [];
  var pathObjects = {};
  var logsbyname = d3.nest()
    .key(function(d) { return d.username; })
    .key(function(d) { return d.date; })
    .key(function(d) { return d.session; })
    .rollup(function(v) {
      var path = v.reduce(function(path, d,i) {
      endgoals.push(d.url);
      },"");
    }).object(data);
    endgoals = d3.set(endgoals).values().sort();
    var temp =[];
    for(i=0;i<endgoals.length;i++){
      var x = [endgoals[i]];
      if (isNaN(x)){
        temp.push(x);
      }
    }

  d3.selectAll("input[name='stack']").on("change", function(){
    if(!first){
      d3.select("#e1").remove();
      d3.select(".selection").remove();
      d3.select(".select2").remove();
      d3.select("#histogram").remove();
      d3.select("#piechart").remove();
      d3.select("#table").remove();
      d3.select("#container").remove();

    }
    var first = false;
    var division = this.value;

    if(division ==="ALL"){
      var result = data;
    }else if(division ==="Unclassified"){
      var result = data.filter(function(d){
        if(d.Division === ""){
          return d;
        }
      });
    }else{
      var result = data.filter(function(d){
        if(division === d.Division){
          return d;
        }
      });
    }

    //populate table

    var select = d3.select('.endtable')
        .append('select')
        .attr('single','')
        .attr('class','selection')
        .attr('id', 'e1')
        .on('change',onchange);

      var options = select
        .selectAll('option')
        .data(temp).enter()
        .append('option')
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; });

    //get path analysis
    function onchange() {
      var pathobjects = {};
      var before = [];
      var after = [];
      var searched=[];

      selectValue = d3.select('.selection').property('value');
      var pathswithendgoal =[];
      var logs = d3.nest()
        .key(function(d) { return d.username; })
        .key(function(d) { return d.date; })
        .key(function(d) { return d.session; })
        .rollup(function(v) {
          v.filter(function(d){
            if(d.url.includes(selectValue)){
              pathswithendgoal.push(v);
            }
          });
        }).object(result);


      for(i in pathswithendgoal){
        endgoalindex = pathswithendgoal[i].findIndex(findendgoal);
        indexafter1 = pathswithendgoal[i][endgoalindex+1];
        indexafter2 = pathswithendgoal[i][endgoalindex+2];
        indexafter3 = pathswithendgoal[i][endgoalindex+3];

        indexbefore1 = pathswithendgoal[i][endgoalindex-1];
        indexbefore2 = pathswithendgoal[i][endgoalindex-2];
        indexbefore3 = pathswithendgoal[i][endgoalindex-3];

        
        var path ="";
        if(endgoalindex === 0){
          if(indexafter1 != undefined){
            after.push(indexafter1.url);
          }
          if(indexafter2 != undefined){
            after.push(indexafter2.url);
          }
          if(indexafter3 != undefined){
            after.push(indexafter3.url);
          }
        }else{
          if(indexbefore3 != undefined){
            before.push(indexbefore3.url);
            path = indexbefore3.url + "-";
          }
          if(indexbefore2 != undefined){
            //before.push(indexbefore2.url);
            path = path + indexbefore2.url + "-";
          }
          if(indexbefore1 != undefined){
            //before.push(indexbefore1.url);
            if(indexbefore1.url === "Search"){
              searched.push(indexbefore1['query-url']);
            }
            if(indexbefore2!= undefined){
              if(indexbefore2.url != indexbefore1.url){
                path = path + indexbefore1.url + "-" + selectValue;
              }else{
                path = path + selectValue;
              }
            }
          }
          if(indexafter1 != undefined){
            after.push(indexafter1.url);
          }
          if(indexafter2 != undefined){
            after.push(indexafter2.url);
          }
          if(indexafter3 != undefined){
            after.push(indexafter3.url);
          }
        }
        if(path.length!=0){
          if (!(path in pathobjects)){
            pathobjects[path] = 1;
          }else{
            pathobjects[path] +=1;
          }
        }
      }
       searchedwordstable(searched);
       alsovisited(after);

       var sortable = [];
       for (var key in pathobjects) {
         sortable.push([key, pathobjects[key]]);
       }
       sortable.sort(function(a, b) {
         return a[1] - b[1];
       });
       var json = buildHierarchy(sortable);
       if(json.children.length != 0){
         buildSB(json);
       }else{
        d3.select("#container").remove();
        d3.select("#sunburst").remove();
        d3.select("#trail").remove();
        d3.select("#searchedalso").remove();
        d3.select("#alsovisited").remove();
       }

      function findendgoal(paths) {
        return paths.url === selectValue;
      }
    };

    $("#e1").select2();
    $('#e1').select2().on('change', function() {
        onchange();
    }).trigger('change');

    //get search
    getSearch(result);
  });
};

//Get search analysis
function getSearch(result){
  //Global frequencydata, to be passed to piechart visualization
  var freqData=[];

  //Get Modular
  var modular = result.filter(function(d){
    var url = d.url;
    var q = d['query-url'];
    if(url.includes("Search")){
      if(q.includes("u=")){
        return d;
      }
    }
  });
  //Get Staff search
  var staff = result.filter(function(d){
    var url = d.url;
    var q = d['query-url'];
    if(url.includes("Staff Directory")){
      if(q.includes("Filter")){
        return d;
      }
    }
  });
  //Get Tax knowledge
  var taxknowledge = result.filter(function(d){
    var url = d.url;
    var q = d['query-url'];
    if(url.includes("Tax Knowledge")){
      if(!q.includes("-")){
        return d;
      }
    }
  });
  //Get Refined
  var refined = result.filter(function(d){
    var url = d.url;
    var q = d['query-url'];
    if(url.includes("Search")){
      if(!q.includes("-") && q.includes("r=documenttype") || q.includes("r=taxtype") || q.includes("r=format") || q.includes("r=businessactivity") || q.includes("r=industrytype")){
        return d;
      }
    }
  });
  //Get Refined
  var advanced = result.filter(function(d){
    var url = d.url;
    var q = d['query-url'];
    if(url.includes("Search")){
      if(!q.includes("-") && q.includes("scope:")){
        return d;
      }
    }
  });
  //Get General
  var wordkey ="";
  wordobjects = {};

  var globalsearch = result.filter(function(d){
    var url = d.url;
    var q = d['query-url'];
    if(url ==="Search"){
      if(q.includes('&Is')){
        q = q.substr(0, q.indexOf('&Is'));
      }
      if(q.includes('&start')){
        q = q.substr(0, q.indexOf('&st'));
      }
      if(q.includes('&dupid')){
       q = q.substr(0, q.indexOf('&dupid'));
      }
      if(q.includes("&r=")){
        q = q.substr(0, q.indexOf('&r='));
      }
      if(q.includes("sq=")){
        q = q.substr(q.indexOf("&")+1);
      }
      if(!q.includes("u=") && !q.includes("-") && !q.includes("scope")){
        q = q.split("k=")[1];
      }else{
        q = q.split("k=")[0];
      }
      if(q != undefined && q.length !=0 && q!="-"){
        if (!(q in wordobjects)){
            wordobjects[q] = 1;
            //console.log("Added: " + wordkey);
        }else{
          wordobjects[q] +=1;
          //console.log("Plus: " + wordkey);
        }
      }
      return d;
    }
  });

  var sorted = [];
  for (var key in wordobjects) {
    if(!key.includes("_https") && !key.includes("Intranet Content E.g. Benefits")){
      // console.log(key.trim());
      sorted.push([key.trim(), wordobjects[key]]);
    }
  }

  sorted.sort(function(a, b) {
    return b[1] - a[1];
  });

  var designationkeywordslist = [];
  //Loop through designation and get each category
  for(i=0;i<designationlist.length;i++){
    var designationkeywords = getkeyword(result,designationlist[i]);
    designationkeywordslist.push(designationkeywords);
    var gs = globalsearch.filter(function(d){
      if(d['designation-category']===designationlist[i]){
        return d;
      }
    });
    var ts = taxknowledge.filter(function(d){
      if(d['designation-category']===designationlist[i]){
        return d;
      }
    });
    var ss = staff.filter(function(d){
      if(d['designation-category']===designationlist[i]){
        return d;
      }
    });
    var mods = modular.filter(function(d){
      if(d['designation-category']===designationlist[i]){
        return d;
      }
    });
    var refine = refined.filter(function(d){
      if(d['designation-category']===designationlist[i]){
        return d;
      }
    });
    var advance = advanced.filter(function(d){
      if(d['designation-category']===designationlist[i]){
        return d;
      }
    });
    var x = {
      Designation: designationlist[i],
      freq:{
        global:gs.length,
        taxknowledge:ts.length,
        modular: mods.length,
        staff:ss.length,
        refined:refine.length,
        advanced:advance.length
      }
    }
    freqData.push(x);
  }
  keywordtable(sorted);
  charts('#dashboard',freqData,designationkeywordslist);
};

/*----------------------------Passing function---------------------------------------------------------------------------*/
function getkeyword(result, designationpass){
  var wordobjects = [];
  var x = result.filter(function(d){
      var url = d.url;
      var q = d['query-url'];
      var designation = d['designation-category'];
      if(url ==="Search" && designation === designationpass){
        if(q.includes('&Is')){
          q = q.substr(0, q.indexOf('&Is'));
        }
        if(q.includes('&start')){
          q = q.substr(0, q.indexOf('&st'));
        }
        if(q.includes(' (Path:')){
          q=q.substr(0, q.indexOf(' (Path:'));
        }
        if(q.includes('&dupid')){
         q = q.substr(0, q.indexOf('&dupid'));
        }
        if(q.includes("&r=")){
          q = q.substr(0, q.indexOf('&r='));
        }
        if(q.includes("sq=")){
          q = q.substr(q.indexOf("&")+1);
        }
        if(!q.includes("u=") && !q.includes("-") && !q.includes("scope")){
          q = q.split("k=")[1];
        }else{
          q = q.split("k=")[0];
        }
        if(q != undefined && q.length !=0 && q!="-"){
          if (!(q in wordobjects)){
              wordobjects[q] = 1;
              //console.log("Added: " + wordkey);
          }else{
            wordobjects[q] +=1;
            //console.log("Plus: " + wordkey);
          }
        }
        return d;
      }
    });
  var sorted = [];
  for (var key in wordobjects) {
    if(!key.includes("_https") && !key.includes("Intranet Content E.g. Benefits")){
      // console.log(key.trim());
      sorted.push([key.trim(), wordobjects[key]]);
    }
  }

  sorted.sort(function(a, b) {
    return b[1] - a[1];
  });
  return sorted;
};

/* -------------------Global Searched keywords---------------------------------------------------------------------------*/
function keywordtable(data){
  d3.select("#keyword").remove();
  document.getElementById('downloadlink1').style.visibility = "hidden";

  var tableheader = ["Global Search Keyword", "Frequency"];
  var tableWidth = [30,10];
  var table = d3.select("#search-table")
    .append("table")
    .attr("id", "keyword");

  document.getElementById('downloadlink1').style.visibility = "visible";

  table.append("thead").append("tr")
        .selectAll("th")
        .data(tableheader)
        .enter().append("th")
        .text(function(d) {
            return d;
        })
        .data(tableWidth)
        .style("width", function(d,i){
          return tableWidth[i] + "%";
        })
        ;
  var tablebody = table.append("tbody");
            rows = tablebody
                    .selectAll("tr")
                    .data(data)
                    .enter()
                    .append("tr");
            cells = rows.selectAll("td")
                    .data(function(d) {
                        return d;
                    })
                    .enter()
                    .append("td")
                    .text(function(d) {
                        return d;
                    });
};

/* -------------------Searched to end goal + also visited----------------------------------------------------------------*/

function searchedwordstable(data){
  var searchedalso = {};
  for(i in data){
    q = data[i];
    if(q.includes('&Is')){
      q = q.substr(0, q.indexOf('&Is'));
    }
    if(q.includes('&start')){
      q = q.substr(0, q.indexOf('&st'));
    }
    if(q.includes('&dupid')){
     q = q.substr(0, q.indexOf('&dupid'));
    }
    if(q.includes('&u=')){
     q = q.substr(0, q.indexOf('&u='));
    }
    if(q.includes("&r=")){
      q = q.substr(0, q.indexOf('&r='));
    }
    if(q.includes("sq=")){
      q = q.substr(q.indexOf("&")+1);
    }
    q = q.split("k=")[1];
      if (!(q in searchedalso)){
        searchedalso[q] = 1;
      }else{
        searchedalso[q] +=1;
      }
  }
    var sort = [];

  for (var key in searchedalso) {
    sort.push([key, searchedalso[key]]);
  }
  sort.sort(function(a, b) {
      return a[1] - b[1];
  });

  sort.reverse();

  d3.select("#searchedalso").remove();
  document.getElementById('downloadlink3').style.visibility = "hidden";

  var tableheader = ["Users searched these keywords", "Frequency"];
  var tableWidth = [25,10];
  var table = d3.select("#list-wrap")
    .append("table")
    .attr("id", "searchedalso");

  //create download button
    document.getElementById('downloadlink3').style.visibility = "visible";

  

  table.append("thead").append("tr")
        .selectAll("th")
        .data(tableheader)
        .enter().append("th")
        .text(function(d) {
            return d;
        })
        .data(tableWidth)
        .style("width", function(d,i){
          return tableWidth[i] + "%";
        })
        ;
  var tablebody = table.append("tbody");
          rows = tablebody
                  .selectAll("tr")
                  .data(sort)
                  .enter()
                  .append("tr");
          cells = rows.selectAll("td")
                  .data(function(d) {
                      return d;
                  })
                  .enter()
                  .append("td")
                  .text(function(d) {
                      return d;
                  });
};

function alsovisited(data){
  var alsovisited = {};
  for(i in data){
    q = data[i];
    if(q.length!=0){
      if (!(q in alsovisited)){
        alsovisited[q] = 1;
      }else{
        alsovisited[q] +=1;
      }
    }
  }
    var sort = [];

  for (var key in alsovisited) {
    sort.push([key, alsovisited[key]]);
  }
  sort.sort(function(a, b) {
      return a[1] - b[1];
  });
    sort.reverse();
    sort = sort.slice(1,11);


  d3.select("#alsovisited").remove();
  document.getElementById('downloadlink2').style.visibility = "hidden";

  var tableheader = ["Top 10 also accessed pages", "Frequency"];
  var tableWidth = [25,10];
  var table = d3.select("#extratable2")
    .append("table")
    .attr("id", "alsovisited");
  if(data.length!=0){
    document.getElementById('downloadlink2').style.visibility = "visible";
  }
  table.append("thead").append("tr")
          .selectAll("th")
          .data(tableheader)
          .enter().append("th")
          .text(function(d) {
              return d;
          })
          .data(tableWidth)
          .style("width", function(d,i){
            return tableWidth[i] + "%";
          })
          ;
    var tablebody = table.append("tbody");
            rows = tablebody
                    .selectAll("tr")
                    .data(sort)
                    .enter()
                    .append("tr");
            cells = rows.selectAll("td")
                    .data(function(d) {
                        return d;
                    })
                    .enter()
                    .append("td")
                    .text(function(d) {
                        return d;
                    });
};

/* -------------------Sunburst------------------------------------------------------------------------------------------------*/

function buildHierarchy(csv) {
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) { // e.g. if this is a header row
      continue;
    }
    var parts = sequence.split("-");
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
   // Not yet at the end of the sequence; move down the tree.
  var foundChild = false;
  if(children.length ==1 ){
    for (var k = 0; k < children.length; k++) {
    if (children[k]["name"] == nodeName) {
      childNode = children[k];
      foundChild = true;
      break;
    }
  }
  }

  // If we don't already have a child node for this branch, create it.
  if (!foundChild) {
    childNode = {"name": nodeName, "children": []};
    children.push(childNode);
  }
  currentNode = childNode;
      } else {
  // Reached the end of the sequence; create a leaf node.
  childNode = {"name": nodeName, "size": size};
  children.push(childNode);
      }
    }
  }
  return root;
};

function buildSB(json) {
  initializeBreadcrumbTrail();
  if (first_build) {
    vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "sunburst")
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + 350 + "," + 150 + ")");



    vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

    var root = d3.hierarchy(json)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

    var nodes = partition(root).descendants()
      .filter(function(d) {
        return (x(d.x1) - x(d.x0) > 0.005);
      });

    var g = vis.selectAll("g")
      .data(partition(root))
      .enter().append("g");

    var path = vis.data([json]).selectAll("path")
          .data(nodes)
          .enter().append("svg:path")
          .attr('class','sb')
          .attr("display", function(d) { return d.depth ? null : "none"; })
          .attr("d", arc)
          .attr("fill-rule", "evenodd")
          .style("fill", function(d) {return color(d.x0); })
          .style("opacity", 1)
          .on("mouseover", mouseover);

      d3.select("#container").on("mouseleave", mouseleave);

      totalSize = path.datum().value;
      first_build = false;
  }else{
    d3.select("#container").remove();
    d3.select("#sunburst").remove();
    d3.select("#trail").remove();
    d3.select("#search").remove();

    vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "sunburst")
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + 350 + "," + 150 + ")");

    vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

    var root = d3.hierarchy(json)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

    var nodes = partition(root).descendants()
      .filter(function(d) {
        return (x(d.x1) - x(d.x0) > 0.005); // 0.005 radians = 0.29 degrees
      });

    var path = vis.data([json]).selectAll("path")
          .data(nodes)
          .enter().append("svg:path")
          .attr('class','sb')
          .attr("display", function(d) { return d.depth ? null : "none"; })
          .attr("d", arc)
          .attr("fill-rule", "evenodd")
          .style("fill", function(d) {return color(d.x0);  })
          .style("opacity", 1)
          .on("mouseover", mouseover);

    d3.select("#container").on("mouseleave", mouseleave);

    totalSize = path.datum().value;
  }
};

/* -------------------Mouse------------------------------------------------------------------------------------------------*/

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
  var vis = d3.select("#chart");
  var percentage = (100 * d.value / totalSize).toPrecision(3);
  var percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }
  d3.select("#percentage")
    .text(percentageString);

  d3.select("#explanation")
    .style("visibility", "visible");

  var sequenceArray = d.ancestors().reverse();
  sequenceArray.shift(); // remove root node from the array

  var breadcrumbs = d3.select('#sequence')
    .selectAll('.breadcrumb-custom')
    .data(sequenceArray);
  breadcrumbs.exit().remove();
  breadcrumbs.attr('class', 'breadcrumb-custom')
  breadcrumbs.enter()
      .append('li')
      .attr('class', 'breadcrumb-custom')
      .append('a')
      .style('background', function(d) {
         return color(d.x0);
      })
      .style('border-left-color', function(d) {
         return color(d.x0);
      })
      .style("font-size", function(d){
          var length = d.data.name.length;
          if(length >= 7){
            return 9 + "px";
          }else{
            return 12 + "px";
          }
      })
      .html(function(d) {
        return d.data.name;
      });

  d3.select("#pop")
  .text(sequenceArray[sequenceArray.length-1].data.name)
  .style("font-weight", "bold")
  .style("font-size", 11)
  ;

  // Fade all the segments.
  d3.selectAll("path.sb")
  .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path.sb")
  .filter(function(node) {
  return (sequenceArray.indexOf(node) >= 0);
  })
  .style("opacity", 1)
};

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {
  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  var breadcrumbs = d3.select('#sequence').selectAll('.breadcrumb-custom')
  .data(d);
  breadcrumbs.exit().remove();

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });

  d3.select("#explanation")
      .style("visibility", "hidden");
};

/* -------------------Chart------------------------------------------------------------------------------------------------*/

function charts(id, fData, designationkeywordslist){
    var barColor = '#5da5db';
    function segColor(c){ return {global:"#4393e6",refined:"#eb529d",advanced:"#ffbbc0",staff:"#e1ba10",taxknowledge:"#e08214",modular:"#41ab5d"}[c]; }

    // compute total for each Designation.
    fData.forEach(function(d){d.total=d.freq.taxknowledge+d.freq.modular+d.freq.staff+d.freq.global+d.freq.refined+d.freq.advanced;});

    // function to handle histogram.
    function histoGram(fD){
        var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 400 - hGDim.l - hGDim.r,
        hGDim.h = 200 - hGDim.t - hGDim.b +40;

        //create svg for histogram.
        var hGsvg = d3.select(id).append("svg")
            .attr("id","histogram")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b -20).append("g")
            //.attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t/2 + ")");

        // create function for x-axis mapping.
        var x = d3.scaleBand().domain(fD.map(function(d) { return d[0]; })).range([0, hGDim.w], 0.1);

        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.axisBottom(x));

        // Create function for y-axis map.
        var y = d3.scaleLinear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");

        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0])+39; })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.bandwidth()-80)
            .attr("height", function(d) {
              var h = hGDim.h - y(d[1]);
              if(h<5){
                return h +5;
              }else{
                return hGDim.h - y(d[1])+5;
              }
            })
            .attr('fill',barColor)
            .attr('class', "rects")
            //.on("mouseover",mouseover)// mouseover is defined below.
            //.on("mouseout",mouseout);// mouseout is defined below.
            .on("click", click);

        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.bandwidth()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle");

        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected Designation.
            var st = fData.filter(function(s){ return s.Designation == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});

            // call update functions of pie-chart and legend
            pC.update(nD);
            leg.update(nD);
        }
        function click(d){  // utility function to be called on mouseover.
            // filter for selected Designation.
            d3.selectAll('rect.rects').attr('fill', '#4393e6');
            d3.select(this).attr("fill", "blue");


            var st = fData.filter(function(s){ return s.Designation == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
            // call update functions of pie-chart and legend
            if(d[0] === "General Staff"){
              keywordtable(designationkeywordslist[0]);
            }else if (d[0] === "Manager Director and GTS"){
              keywordtable(designationkeywordslist[1]);
            }else{
              keywordtable(designationkeywordslist[2]);
            }
            pC.update(nD);
            leg.update(nD);
        }
        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.
            pC.update(tF);
            leg.update(tF);
        }
        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);

            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);

            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) {
                  var h = hGDim.h - y(d[1]);
                  if(h<5){
                    return h +5;
                  }else{
                    return hGDim.h - y(d[1])+5;
                  }
                })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });
        }
        return hG;
    }
    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:200, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("id","piechart")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+ (25+ pieDim.h/2) +")");

        // create function to draw the arcs of the pie slices.
        var arc = d3.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            //.on("mouseover",mouseover).on("mouseout",mouseout);
            //.on("click", clickit);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }
        // Utility function to be called on mouseover a pie slice.
        function clickit(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){
                return [v.Designation,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){
                return [v.Designation,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.Designation,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }
        return pC;
    }
    // function to handle legend.
    function legend(lD){
        var leg = {};
        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend').attr("id","table");

        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");

        // create the first column for each segment.
        tr.append("td")
          .append("svg")
          .attr("width", '16')
          .attr("height", '16')
          .append("rect")
          .attr("width", '16').attr("height", '16')
          .attr("fill",function(d){ return segColor(d.type); });

        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
        }

        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format(",.1%")(d.freq/d3.sum(aD.map(function(v){
              if(isNaN(v.freq)){
                return 0;
              }else{
                return v.freq;
              }
            })));
        }

        return leg;
    }
    if (first_build) {
      // calculate total frequency by segment for all Designation.
      var tF = ['global','refined','advanced','staff','taxknowledge','modular'].map(function(d){
          return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))};
      });

      // calculate total frequency by Designation for all segment.
      var sF = fData.map(function(d){return [d.Designation,d.total];});
      
      var hG = histoGram(sF), // create the histogram.
          pC = pieChart(tF), // create the pie-chart.
          leg= legend(tF);  // create the legend.
    }else{
      d3.select("#histogram").remove();
      d3.select("#piechart").remove();
      d3.select("#table").remove();
      // calculate total frequency by segment for all Designation.
      var tF = ['global','refined','advanced','staff','taxknowledge','modular'].map(function(d){
          return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))};
      });

      // calculate total frequency by Designation for all segment.
      var sF = fData.map(function(d){return [d.Designation,d.total];});
      
      var hG = histoGram(sF), // create the histogram.
          pC = pieChart(tF), // create the pie-chart.
          leg= legend(tF);  // create the legend.
    }
};

/* -------------------Trail------------------------------------------------------------------------------------------------*/

function initializeBreadcrumbTrail() {
  // Add the svg area.
  // var trail = d3.select("#sequence").append("svg:svg")
  //     .attr("width", width)
  //     .attr("height", 700)
  //     .attr("id", "trail");
  // Add the label at the end, for the percentage.
  /*trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "black")
    .style("font-size", 20);*/
};

// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
};

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {
  // Data join; key function combines name and depth (= position in sequence).
  var trail = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.data.name + d.depth; });
  // Remove exiting nodes.
  trail.exit().remove();

  // Add breadcrumb and label for entering nodes.
  var entering = trail.enter().append("svg:g");

  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      //.style("fill", function(d) {return colors[d.data.name]; });
      .style("fill", "none")
      .style("stroke", "black")
      .style("stroke-width", 1);

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style("fill", "black")
      .attr("class", "wrap")
      .style("font-size", function(d){
          var length = d.data.name.length;
          if(length >= 5){
            return 9 + "px";
          }else{
            return 15 + "px";
          }
      })
      .text(function(d) { return d.data.name; });

  // Merge enter and update selections; set position for all nodes.
  entering.merge(trail).attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
    //return "translate(0, " + i * (b.h + b.s) + ")";
  });

  // Now move and update the percentage at the end.
  d3.select("#trail").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(percentageString);

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");
};

function computeTextRotation(d) {
  return (x(d.x0 + d.x1 / 2) - Math.PI / 2) / Math.PI * 180;
};

/* -------------------Reset Function----------------------------------------------------------------------------------*/
function reset(){
  d3.select("#histogram").remove();
  d3.select("#piechart").remove();
  d3.select("#table").remove();
  d3.select("#container").remove();
  d3.select("#sunburst").remove();
  d3.select("#trail").remove();
  d3.select("#keywords").remove();
  d3.select("#keyword").remove();
  d3.select("#searchedalso").remove();
  d3.select("#alsovisited").remove();
  document.getElementById('downloadlink1').style.visibility = "hidden";
  document.getElementById('downloadlink2').style.visibility = "hidden";
  document.getElementById('downloadlink3').style.visibility = "hidden";
  $('input[type=radio]').each(function(){
    $(this).prop('checked', false);
  });


}
/* -------------------Arc Tween----------------------------------------------------------------------------------*/
function arcTweenData(a, i) {
  // (a.x0s ? a.x0s : 0) -- grab the prev saved x0 or set to 0 (for 1st time through)
  // avoids the stash() and allows the sunburst to grow into being
  var oi = d3.interpolate({ x0: (a.x0s ? a.x0s : 0), x1: (a.x1s ? a.x1s : 0) }, a);  
  function tween(t) {
    var b = oi(t);
    a.x0s = b.x0;  
    a.x1s = b.x1;  
    return arc(b);
  }
  if (i == 0) { 
    // If we are on the first arc, adjust the x domain to match the root node
    // at the current zoom level. (We only need to do this once.)
    var xd = d3.interpolate(x.domain(), [node.x0, node.x1]);
    return function (t) {
      x.domain(xd(t));
      return tween(t);
    };
  } else {
    return tween;
  }
};

function arcTweenUpdate(a) {
  var i = d3.interpolate({x: this.x0, dx: this.dx0}, a);
  return function(t) {
    var b = i(t);
    this.x0 = b.x;
    this.dx0 = b.dx;
    return arc(b);
  };
};

// When zooming: interpolate the scales.
function arcTweenZoom(d) {
  var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
      yd = d3.interpolate(y.domain(), [d.y0, 1]), // [d.y0, 1]
      yr = d3.interpolate(y.range(), [d.y0 ? 40 : 0, radius]);
  return function (d, i) {
    return i
        ? function (t) { return arc(d); }
        : function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
  };
};

/* -------------------Toggle Table----------------------------------------------------------------------------------*/

function toggleTable() {
    var x = document.getElementById('side');
    var button = document.getElementById('tableButton');
    if (x.style.display === 'none') {
        x.style.display = 'block';
    } else {
        x.style.display = 'none';
    }
};

var theToggle = document.getElementById('toggle');

// hasClass
function hasClass(elem, className) {
  return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
}
// addClass
function addClass(elem, className) {
    if (!hasClass(elem, className)) {
      elem.className += ' ' + className;
    }
}
// removeClass
function removeClass(elem, className) {
  var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, ' ') + ' ';
  if (hasClass(elem, className)) {
        while (newClass.indexOf(' ' + className + ' ') >= 0 ) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}
// toggleClass
function toggleClass(elem, className) {
  var newClass = ' ' + elem.className.replace( /[\t\r\n]/g, " " ) + ' ';
    if (hasClass(elem, className)) {
        while (newClass.indexOf(" " + className + " ") >= 0 ) {
            newClass = newClass.replace( " " + className + " " , " " );
        }
        elem.className = newClass.replace(/^\s+|\s+$/g, '');
    } else {
        elem.className += ' ' + className;
    }
}

theToggle.onclick = function() {
   toggleClass(this, 'on');
   return false;
}
/* -----------------------------------------------------------------------------------------------------*/



/*This is the part to change, add or remove files that you want to access*/
queue
.defer(d3.csv, "data/1Jan.csv")
// .defer(d3.csv, "data/2Feb.csv")
// .defer(d3.csv, "data/3Mar.csv")
// .defer(d3.csv, "data/4Apr.csv")
// .defer(d3.csv, "data/5May.csv")
// .defer(d3.csv, "data/6Jun.csv")
// .defer(d3.csv, "data/7Jul.csv")
// .defer(d3.csv, "data/8Aug.csv")
// .defer(d3.csv, "data/9Sep.csv")
// .defer(d3.csv, "data/10Oct.csv")
// .defer(d3.csv, "data/11Nov.csv")
.await(setData);

function setData(error, data1){//,data2,data3,data4,data5,data6,data7,data8,data9,data10,data11) {
  //var data = d3.merge([data1,data2,data3,data4,data5,data6,data7,data8,data9,data10,data11]);
  var data = data1;
  var endgoals = [];
  var pathObjects = {};
  var logsbyname = d3.nest()
    .key(function(d) { return d.username; })
    .key(function(d) { return d.date; })
    .key(function(d) { return d.session; })
    .rollup(function(v) {
      var path = v.reduce(function(path, d,i) {
        url = d.url;
        if(url.includes('.aspx') && url[0] === url[0].toUpperCase() && !url.includes("About Us")){
          endgoals.push(d.url);
        }
      },"");
    }).object(data);
    endgoals = d3.set(endgoals).values().sort();
    var temp = endgoals;

  d3.selectAll("input[name='stack']").on("change", function(){
    if(!first){
      d3.select("#e1").remove();
      d3.select(".selection").remove();
      d3.select(".select2").remove();
      d3.select("#histogram").remove();
      d3.select("#piechart").remove();
      d3.select("#table").remove();
      d3.select("#container").remove();

    }
    var first = false;
    var division = this.value;

    if(division ==="ALL"){
      var result = data;
    }else if(division ==="Unclassified"){
      var result = data.filter(function(d){
        if(d.Division === ""){
          return d;
        }
      });
    }else{
      var result = data.filter(function(d){
        if(division === d.Division){
          return d;
        }
      });
    }

    //populate table

    var select = d3.select('.endtable')
        .append('select')
        .attr('single','')
        .attr('class','selection')
        .attr('id', 'e1')
        .on('change',onchange);

      var options = select
        .selectAll('option')
        .data(temp).enter()
        .append('option')
        .attr("value", function (d) { return d; })
        .text(function (d) { return d; });

    //get path analysis
    function onchange() {
      var pathobjects = {};
      var before = [];
      var after = [];
      var searched=[];

      selectValue = d3.select('.selection').property('value');
      var pathswithendgoal =[];
      var logs = d3.nest()
        .key(function(d) { return d.username; })
        .key(function(d) { return d.date; })
        .key(function(d) { return d.session; })
        .rollup(function(v) {
          v.filter(function(d){
            if(d.url.includes(selectValue)){
              pathswithendgoal.push(v);
            }
          });
        }).object(result);


      for(i in pathswithendgoal){
        endgoalindex = pathswithendgoal[i].findIndex(findendgoal);
        indexafter1 = pathswithendgoal[i][endgoalindex+1];
        indexafter2 = pathswithendgoal[i][endgoalindex+2];
        indexafter3 = pathswithendgoal[i][endgoalindex+3];

        indexbefore1 = pathswithendgoal[i][endgoalindex-1];
        indexbefore2 = pathswithendgoal[i][endgoalindex-2];
        indexbefore3 = pathswithendgoal[i][endgoalindex-3];

        var path ="";
        if(endgoalindex === 0){
          if(indexafter1 != undefined){
            after.push(indexafter1.url);
          }
          if(indexafter2 != undefined){
            after.push(indexafter2.url);
          }
          if(indexafter3 != undefined){
            after.push(indexafter3.url);
          }
        }else{
          if(indexbefore3 != undefined){
            before.push(indexbefore3.url);
            path = indexbefore3.url + "-";
          }
          if(indexbefore2 != undefined){
            //before.push(indexbefore2.url);
            path = path + indexbefore2.url + "-";
          }
          if(indexbefore1 != undefined){
            //before.push(indexbefore1.url);
            if(indexbefore1.url === "Search"){
              searched.push(indexbefore1['query-url']);
            }
            if(indexbefore2!= undefined){
              if(indexbefore2.url != indexbefore1.url){
                path = path + indexbefore1.url + "-" + selectValue;
              }else{
                path = path + selectValue;
              }
            }
          }
          if(indexafter1 != undefined){
            after.push(indexafter1.url);
          }
          if(indexafter2 != undefined){
            after.push(indexafter2.url);
          }
          if(indexafter3 != undefined){
            after.push(indexafter3.url);
          }
        }
        if(path.length!=0){
          if (!(path in pathobjects)){
            pathobjects[path] = 1;
          }else{
            pathobjects[path] +=1;
          }
        }
      }
       searchedwordstable(searched);
       alsovisited(after);

       var sortable = [];
       for (var key in pathobjects) {
         sortable.push([key, pathobjects[key]]);
       }
       sortable.sort(function(a, b) {
         return a[1] - b[1];
       });
       var json = buildHierarchy(sortable);
       if(json.children.length != 0){
         buildSB(json);
       }else{
        d3.select("#container").remove();
        d3.select("#sunburst").remove();
        d3.select("#trail").remove();
        d3.select("#searchedalso").remove();
        d3.select("#alsovisited").remove();
       }

      function findendgoal(paths) {
        return paths.url === selectValue;
      }
    };

    $("#e1").select2();
    $('#e1').select2().on('change', function() {
        onchange();
    }).trigger('change');

    //get search
    getSearch(result);
  });
};


























