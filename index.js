function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var ficha = getParameterByName('ficha');

function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style("width")),
      height = parseInt(svg.style("height")),
      aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
      .attr("perserveAspectRatio", "xMinYMid")
      .call(resize);

  // to register multiple listeners for same event type, 
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
      var targetWidth = parseInt(container.style("width"));
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
}

  var m = [40, 240, 40, 240],
 width = 1400,
  height = 1400;


// Define the div for the tooltip
var div = d3.select("body").append("div") 
  .attr("class", "tooltip")       
  .style("opacity", 0);

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(responsivefy)

  .append("g")
  .attr("class", "svg_container")
  .attr("width", width)
  .attr("height", height)
  .style("overflow", "scroll")
  .append("svg:g")
  .attr("class", "drawarea")
  .append("svg:g")

  d3.select("svg") 
  .call(d3.behavior.zoom()
  .scaleExtent([0.7, 3])
  .on("zoom", zoom));
  //zooming 
  function zoom() { //zoom in&out function 
  var scale = d3.event.scale,
  translation = d3.event.translate,
  tbound = -height * scale,
  bbound = height * scale,
  lbound = (-width + m[1]) * scale,
  rbound = (width - m[3]) * scale;
  //limit translation to thresholds
  translation = [
  Math.max(Math.min(translation[0], rbound), lbound),
  Math.max(Math.min(translation[1], bbound), tbound)
  ];
  d3.select(".drawarea")
  .attr("transform", "translate(" + translation + ")" +
  " scale(" + scale + ")");
  }

var nodeColors;
nodeColors = d3.scale.category20();

var force = d3.layout.force()
  .gravity(0.30)
  .charge(-6000)
  .linkDistance(function(d) {return d.value; })
  .size([width, height]);

var url = "fuente.json";

d3.json(url, function(error, json) {
if (error) throw error;

force
    .nodes(json.nodes)
    .links(json.links)
    .start();

var link = svg.selectAll(".link")
    .data(json.links)
  .enter().append("line")
  .style("stroke-width", "1.2px")
  .attr("class", "link")
  .style("stroke", function(d) { return d.color; });

var node = svg.selectAll(".node")
    .data(json.nodes)
  .enter().append("g")
    .attr("class", "node")
    .call(force.drag);

var defs = node.append("defs").attr("id", "imgdefs")

var clipPath = defs.append('clipPath').attr('id', 'clip-circle')
.append("circle")
  .attr("class", "circle1")
  .attr("cy",0)
  .attr("cx", 0)
      .attr("r",   function(d) { return (d.dimensiones1); }) ;

node.append("circle")
  .attr("class", "circle2")
  .attr("cx",0)
  .attr("cy",0)
  .attr("r",  function(d) { return (d.dimensiones2); }) 
  .style("fill", function(d) { return d.color; })
  ; 
//    .attr("fill", function (d,i) {return nodeColors(i);});


node.append("image")
  .attr("xlink:href", function(d) {return d.filenameDestino; })
  .attr("x", -80)
  .attr("y", -80)
  .attr("width", 160)
  .attr("height", 160)
  .attr("rx", 80)
  .attr("ry", 80)
 .attr("clip-path", "url(#clip-circle)");

node.append("a")
/*    .attr("xlink:href",  function(d) {return d.pathFichas; })*/
  .append("rect")  
  .attr("x", -50)
  .attr("y", -50)
  .attr("height", 100)
  .attr("width", 100)
  .style("fill", "transparent")
  .attr("rx", 50)
  .attr("ry", 50)
   .on("mouseover", function(d) {
           div.transition()
       .duration(200)
       .style("opacity", 1.0);
        div .html( "<div align='justify'><b>"+d.tipoNodo + "</b><br>"  + d.nameNodo+"</div>" )  
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY - 28) + "px");  
            d3.select(this).style("cursor", "pointer") ;
            },
          function(d){
            d3.select(this).style("cursor", "pointer") ;
       })
      .on("mouseout", function(d) {   
          div.transition()    
              .duration(500)    
              .style("opacity", 0); 
      })

.on('click', function(d) {
          window.open(
            d.pathFichas,
            '_top' // <- This is what makes it open in a new window.
          );
        });

    node.on("mouseover"

      , function (d) {
   d3.select(this).select(".circle2")
    .transition()
    .attr("r",d.dimensiones2*1.05);



    d3.select(this).select("image").transition()
  .attr("x", -120)
  .attr("y", -120)
  .attr("width", 240)
  .attr("height", 240)
  .attr("rx", 120)
  .attr("ry", 120);

      link.style('stroke-width', function(l)
       {
          if (d === l.source || d === l.target)
            return 5;
        else
            return 2;
      });
  })
node.on("mouseout"

      , function (d,i) {
    // transition the mouseover'd element
    // to having a red fill

   d3.select(this).select(".circle2")
    .transition()
    .attr("r",d.dimensiones2);

    d3.select(this).select("image").transition()
  .attr("x", -80)
  .attr("y", -80)
  .attr("width", 160)
  .attr("height", 160)
  .attr("rx", 80)
  .attr("ry", 80);

      link.style('stroke-width', function(l)
       {
            return 2;
      });
  });


force.on("tick", function() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
});
});


// /** Crea el gráfico basado en fuente.js */
// function crearGrafico(){
//   nodos.nodes.forEach(nodo => {
//     console.log(nodo)
//   })
// }

// crearGrafico();
