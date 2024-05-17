const videoElement = document.getElementById("ytplayer");
const URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTxwVzhXLU_L68mdhBgS1m_iLCLpEC2CVFbbs0mI1LP_22oC_vltxN0R8YsUuQxw6slF2XTYgkLsx1i/pub?gid=0&single=true&output=csv";
let nodos = [];
let conexiones = [];
const URLImagenDefault = "https://cdn.iconscout.com/icon/premium/png-512-thumb/love-feeling-1991782-1682379.png?f=webp&w=512";

getGoogleSheetsData().then((res) => {
  [nodos, conexiones] = convertirCSVaNodo(res);
  crearGrafico();
});

function convertirCSVaNodo(stringCSV) {
  const filasCSV = stringCSV.split(/\r\n/g); //Separo por línea
  filasCSV.splice(0, 1); //Remuevo los headers
  const nodos = [];
  const conexiones = [];
  filasCSV.forEach((linea, i) => {
    const columnasCSV = linea.split(",");
    const nuevoNodo = {
      id: parseInt(columnasCSV[0]),
      titulo: columnasCSV[1],
      descripción: columnasCSV[2],
      tamaño: columnasCSV[3],
      color: columnasCSV[4],
      URLImagen: columnasCSV[5],
      URLAudio: columnasCSV[6],
      IDYoutube: columnasCSV[7],
      URLVinculoExterno: columnasCSV[8],
    };
    nodos.push(nuevoNodo);
    if (columnasCSV[9]) {
      const nuevaConexion = {
        source: parseInt(columnasCSV[9]),
        target: nuevoNodo.id,
        value: 230,
        color: nuevoNodo.color,
      };
      conexiones.push(nuevaConexion);
    }
  });
  return [nodos, conexiones];
}

async function getGoogleSheetsData() {
  const res = await fetch(URL);
  const resText = await res.text();
  return resText;
}

function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height")),
    aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg
    .attr("viewBox", "0 0 " + width + " " + height)
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

const m = [40, 240, 40, 240], width = 1400, height = 1400;

// Define the div for the tooltip
const div = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

const svg = d3.select("body").append("svg").attr("width", width).attr("height", height).call(responsivefy)

  .append("g")
  .attr("class", "svg_container")
  .attr("width", width)
  .attr("height", height)
  .style("overflow", "scroll")
  .append("svg:g")
  .attr("class", "drawarea")
  .append("svg:g");

d3.select("svg").call(
  d3.behavior.zoom().scaleExtent([0.7, 3]).on("zoom", zoom)
);
//zooming
function zoom() {
  //zoom in&out function
  var scale = d3.event.scale,
    translation = d3.event.translate,
    tbound = -height * scale,
    bbound = height * scale,
    lbound = (-width + m[1]) * scale,
    rbound = (width - m[3]) * scale;
  //limit translation to thresholds
  translation = [
    Math.max(Math.min(translation[0], rbound), lbound),
    Math.max(Math.min(translation[1], bbound), tbound),
  ];
  d3.select(".drawarea").attr(
    "transform",
    "translate(" + translation + ")" + " scale(" + scale + ")"
  );
}

const nodeColors = d3.scale.category20();

var force = d3.layout
  .force()
  .gravity(0.3)
  .charge(-6000)
  .linkDistance((d) => d.value)
  .size([width, height]);

function crearGrafico(){
  console.log("intentado crear gráficos con",nodos,conexiones)
  force.nodes(nodos).links(conexiones).start();

  var link = svg
    .selectAll(".link")
    .data(conexiones)
    .enter()
    .append("line")
    .style("stroke-width", "1.2px")
    .attr("class", "link")
    .style("stroke", function (d) {
      return d.color;
    });

  var node = svg
    .selectAll(".node")
    .data(nodos)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(force.drag);

  var defs = node.append("defs").attr("id", "imgdefs");

  var clipPath = defs
    .append("clipPath")
    .attr("id", "clip-circle")
    .append("circle")
    .attr("class", "circle1")
    .attr("cy", 0)
    .attr("cx", 0)
    .attr("r", function (d) {
      return d.tamaño;
    });

  node
    .append("circle")
    .attr("class", "circle2")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", function (d) {
      return d.tamaño;
    })
    .style("fill", function (d) {
      return d.color;
    });
  //    .attr("fill", function (d,i) {return nodeColors(i);});

  node
    .append("image")
    .attr("xlink:href", function (d) {
      return d.URLImagen ? d.URLImagen : URLImagenDefault;
    })
    .attr("x", -80)
    .attr("y", -80)
    .attr("width", 160)
    .attr("height", 160)
    .attr("rx", 80)
    .attr("ry", 80)
    .attr("clip-path", "url(#clip-circle)");

  node
    .append("a")
    //    .attr("xlink:href",  function(d) {return d.vinculoInterno; })
    .append("rect")
    .attr("x", -50)
    .attr("y", -50)
    .attr("height", 100)
    .attr("width", 100)
    .style("fill", "transparent")
    .attr("rx", 50)
    .attr("ry", 50)
    .on(
      "mouseover",
      function (d) {
        div.transition().duration(200).style("opacity", 1.0);
        div
          .html(
            "<div align='justify'><b>" +
              d.titulo +
              "</b><br>" +
              d.descripción +
              "</div>"
          )
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
        d3.select(this).style("cursor", "pointer");
      },
      function (d) {
        d3.select(this).style("cursor", "pointer");
      }
    )
    .on("mouseout", function (d) {
      div.transition().duration(500).style("opacity", 0);
    })

    .on("click", function (d) {
      const audio = new Audio(d.URLAudio);
      //const vinculoInterno = d.vinculoInterno;
      const vinculoExterno = d.vinculoExterno;
      const video = d.IDYoutube;
      console.log(
        video,
        "http://www.youtube.com/embed/" + video + "?autoplay=1"
      );
      if (video) videoElement.src ="http://www.youtube.com/embed/" + video + "?autoplay=1";
      else videoElement.src = "";
      if (vinculoExterno) window.open(vinculoExterno, "blank");
      //if(vinculoInterno) window.open(vinculoInterno,'_top');
      if (audio) {
        audio.pause();
        audio.play();
      }
    });

  node.on(
    "mouseover",

    function (d) {
      d3.select(this)
        .select(".circle2")
        .transition()
        .attr("r", d.tamaño * 1.05);

      d3.select(this)
        .select("image")
        .transition()
        .attr("x", -120)
        .attr("y", -120)
        .attr("width", 240)
        .attr("height", 240)
        .attr("rx", 120)
        .attr("ry", 120);

      link.style("stroke-width", function (l) {
        if (d === l.source || d === l.target) return 5;
        else return 2;
      });
    }
  );
  node.on(
    "mouseout",

    function (d, i) {
      // transition the mouseover'd element
      // to having a red fill

      d3.select(this).select(".circle2").transition().attr("r", d.tamaño);

      d3.select(this)
        .select("image")
        .transition()
        .attr("x", -80)
        .attr("y", -80)
        .attr("width", 160)
        .attr("height", 160)
        .attr("rx", 80)
        .attr("ry", 80);

      link.style("stroke-width", function (l) {
        return 2;
      });
    }
  );

  force.on("tick", function () {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
    
  });
}