let {sqrt,cos,sin,PI,random,floor,min,max} = Math;

const createElement = (type, atts) => {
  let shape = document.createElementNS("http://www.w3.org/2000/svg", type); 
  // Set any attributes as desired
  Object.keys(atts).forEach(att => shape.setAttribute(att, atts[att]));
  return shape;
}

let stroke = 'darkgoldenrod'
let stroke_width = 6;

let path = (fill, stroke, stroke_width) => createElement('path',
  { fill, stroke, 'stroke-width': `${stroke_width}px`}
);

let text = (txt, font, col) => {
  let t = document.createElement('span');
  t.style = `left: 400px; top: 400px; font: ${font}; color: ${col}; position: absolute;`
  t.innerHTML = txt;
  return t;
}

const times = (n) => (iterator) => Array(n).fill().map((_,i) => iterator(i));
const radians = (deg) => PI * (deg / 180);

const CONFIGS = {
  default: {
    wvel:0.5, wcx:300, wcy:300, wspokes:20,
    vel:1,
    trotx: 35,
    troty: 25,
    trotz: 5,
    tvel: 0.5,
    texp: 180,
    ttxt: 'DSCOLAB',
    tfont: 'bold 90px sans-serif',
    tcol: 'white',
    lat_lines:16, lon_lines:32,
    stroke_width:2,
    rrate:0.3,
    rotx:35, roty:25, rotz:5,
    color:"red magenta chartreuse cyan blue",
    wcolors:"2,black 3,green 8,orange 3,green",
    stroke:"darkgoldenrod"
  },
  deathstar: {
    wvel:0.1, wcx:-400, wcy:-400, wspokes:60,
    vel:1,
    lat_lines:16, lon_lines:32,
    stroke_width:4,
    rrate:0.3,
    rotx:34, roty:164, rotz:76,
    color: "gray gray #444",
    wcolors:"10,black 1,#0f0 30,black 1,#0f0 10,black 1,#f00",
    stroke:"#666",
    trotx:-104,
    troty:164,
    trotz:34,
    tvel:1,
    texp:90,
    tcol:"yellow",
    tfont:"40px sans-serif"
  },
  colabs: {
    wvel:0.1,
    wcx:500,
    wcy:300,
    wspokes:20,
    vel:-49,
    lat_lines:15,
    lon_lines:15,
    stroke_width:2,
    rrate:0.3,
    rotx:35,
    roty:125,
    rotz:-70,
    color:"#0d7998 #0f7862 #106452 #11866e #126e5c #17677c #1f88ab #26aae1 #76184f #871d58 #9c2420 #9f2064 #c43388 #cb393a #d96727 #e24c4c #e27a26 #ee6e6f #ef8721 #f79622",
    wcolors:"1,#052049 3,#178ccb 15,white 3,#f48024",
    stroke:"darkgoldenrod",
    trotx:108,
    troty:30,
    trotz:-51,
    tvel:0.5,
    texp:350,
    ttxt: "DSCOLABDSCOLABDSCOLABDSCOLABDSCOLAB",
    tcol:"#052049",
    tfont:"bold 90px sans-serif"
  },
  gold: {
    wvel:1,
    wcx:293,
    wcy:348,
    wspokes:10,
    vel:1,
    lat_lines:20,
    lon_lines:20,
    stroke_width:2,
    rrate:0.3,
    rotx:55,
    roty:-40,
    rotz:-20,
    color:"gold orange yellow",
    wcolors:"1,pink 1,white 1,papayawhip",
    stroke:"darkgoldenrod",
    trotx:55,
    troty:-40,
    trotz:-20,
    tvel:1.5,
    texp:333,
    ttxt: "DSCO DSCO DSCO DSCO DSCO",
    tcol:"hotpink",
    tfont:"120px sans-serif"
  },
  earth: {
    wvel:-0.1,
    wcx:20,
    wcy:20,
    wspokes:50,
    wcolors:"1,yellow 100,black",
    vel:1,
    lat_lines:18,
    lon_lines:36,
    stroke_width:1,
    rrate:0.3,
    rotx: 67,
    roty:25,
    rotz:-20,
    trotx:80,
    troty:0,
    trotz:180,
    tvel:1.5,
    texp:25,
    color:"white white brown green green green blue blue blue blue blue blue blue blue blue",
    stroke:"blue",
    ttxt:"DSCO",
    tcol:"#aaa",
    tfont:"bold 70px sans-serif"
  }
}

let config = {};

const loadConfig = (template) => {
  template = Object.assign({}, CONFIGS.default, template);

  Object.keys(template).forEach( t => document.querySelector('#'+t).value = template[t]);

  updateConfig();
}

const updateConfig = () => {
  const num = [ 'wvel', 'wcx', 'wcy', 'wspokes', 'vel', 'lat_lines',
    'lon_lines', 'stroke_width', 'rrate', 'rotx', 'roty', 'rotz', 'trotx', 'troty', 'trotz', 'tvel', 'texp' ];
  const str = [ 'color', 'wcolors', 'stroke', 'ttxt', 'tcol', 'tfont' ];
  const txt = (id) => document.querySelector('#' + id).value;
  const val = (id) => parseFloat(txt(id));

  num.forEach(n => config[n] = val(n));
  str.forEach(s => config[s] = txt(s));

  config.wcx = min(1200, max(-400, config.wcx));
  config.wcy = min(1200, max(-400, config.wcy));

  console.log(JSON.stringify(config));

  config.wheel_colors = config.wcolors.split(/\s+/).map(x => { s = x.split(/\,/); s[0] = parseInt(s[0]); return s;});
  config.colors = config.color.split(/\s+/);
  config.spoke_size = config.wheel_colors.reduce( (sum, [width, col]) => sum + width, 0);

  let svg = document.querySelector("#bal");
  while( svg.hasChildNodes() ) svg.removeChild(svg.lastChild);

  makeWheelElements(svg);
  makeSphereElements(svg);
  makeLetters();
}

const readConfig = () => config;

const draw = () => {
  let svg = document.querySelector("#bal");
  let config = readConfig();
  drawwheel(config);
  drawsphere(config);
  drawtext(config);
}

window.onload = () => {
  let inputs = document.querySelectorAll('input');
  inputs.forEach(i => i.onchange = updateConfig)

  loadConfig(CONFIGS.default);

  let config = document.querySelector('#config');

  Object.keys(CONFIGS).forEach( c => {
    let option = document.createElement("option");
    option.text = c;
    if (c == "default") option.selected = true;
    config.add(option);
  });
}

// draw orbiting text

let tx = 400;
let ty = 400;

let letters = [];

const makeLetters = () => {
  let t = document.querySelector("#textbox");
  t.innerHTML='';

  let { ttxt, tfont, tcol } = readConfig();

  letters = ttxt.split('').map( (l,i) => {
    let node = {}

    node.letter = l;
    node.element = text(l, tfont, tcol);
    
    t.appendChild(node.element);

    return node;
  })
}

const dist = ([x1,y1,z],[x2,y2]) => sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));

let tio = -90;

const drawtext = ({trotx,troty,trotz,tvel,texp}) => {
  //rtx += 10;
  //rtz += 1;
  tio = isNaN(tio) ? 0 : tio + tvel;

  let spacing = letters.length > 1 ? texp / (letters.length - 1) : 0;

  letters.forEach( (l,i) => {
    // x, y for the letter is:

    // while this looks wrong, it maps inconsistent css + svg coordinate systems correctly
    let tx = trotx + 270;
    let ty = trotz + tio + i * spacing;
    let tz = troty;

    let p = rz(radians( tz))(ry(radians( ty))(rx(radians( tx))([0, 0, 350])))

    let fontSize = parseInt(window.getComputedStyle(l.element).getPropertyValue('font-size'));

    if (p[2] < 0 && dist(p, [0, 0]) < 300 + fontSize / 5) {
      l.element.style.display = 'none';
    }
    else
      l.element.style.display = 'block';

    l.element.style.transform = `translate(-50%, -50%) rotateZ(${tz}deg) rotateX(${tx}deg) rotateY(${ty}deg) translateZ(350px)`;
  });
}

// draw a wheel

const wheel_radius = 3000;

let wio = 0;

let wheel_elements = [];

const makeWheelElements = (svg) => {
  console.log("Making wheel_elements");
  let {wcx, wcy, wvel, wspokes, spoke_size, wheel_colors} = readConfig();

  wheel_elements = times(wspokes)( i => times(wheel_colors.length)( j => {
    let node = wheel_elements[i] && wheel_elements[i][j] ? wheel_elements[i][j] : {};

    node.width = wheel_colors[j][0];
    node.color = wheel_colors[j][1];
    node.element = path(node.color, 'none', 0);

    svg.appendChild(node.element);

    return node;
  }));
}

const drawwheel = ({wcx, wcy, wvel, wspokes, spoke_size, wheel_colors}) => {
  const wx = (i) => wheel_radius * cos(2*PI*i/wspokes+wio) + wcx;
  const wy = (i) => wheel_radius * sin(2*PI*i/wspokes+wio) + wcy;

  wio = isNaN(wio) ? 0 : wio + radians(wvel);

  times(wspokes)( i => {
    let w = 0;

    times(wheel_colors.length)( j => {
      if (!wheel_elements[i]) return;

      let node = wheel_elements[i][j];

      if (!node) return;

      let points = [
            [ wcx, wcy ],
            [ wx(i+(w/spoke_size)), wy(i+(w/spoke_size)) ],
            [ wx(i+(w+node.width)/spoke_size), wy(i+(w+node.width)/spoke_size) ]
      ].map(([x,y])=>`${x} ${y}`).join(' ');

      node.element.setAttribute("d", `M ${points} Z` );

      w += node.width;
    })
  });

}

// draw a sphere

let sphere_elements = [];

const getColor = (color, colors, rrate) => random() < rrate ? colors[floor(random() * colors.length)] : (color || 'red');

const updateSphereColors = () => {
  let {colors, lat_lines, lon_lines, rrate} = readConfig();

  times(lat_lines)( i => times(lon_lines)( j => {
    // SphereElements was set, so we can assume the node exists
    if (!sphere_elements[i]) return;

    let node = sphere_elements[i][j];

    if (!node) return;

    sphere_elements[i][j].color = getColor(node.color, colors, rrate);
  }))
}

const makeSphereElements = (svg) => {
  console.log("Making sphere_elements");
  let {colors, stroke, stroke_width, lat_lines, lon_lines, rrate} = readConfig();

  sphere_elements = times(lat_lines)( i => times(lon_lines)( j => {
    let node = sphere_elements[i] && sphere_elements[i][j] ? sphere_elements[i][j] : {}

    // we may use the old color to "blur" transitions between dscobals
    node.color = getColor(node.color, colors, rrate);

    node.i = i;
    node.j = j;

    // while we preserve color above, the element is replaced
    node.element = path(node.color, stroke, stroke_width);
    svg.appendChild(node.element);

    return node;
  }))
}

let io = 0;

const mult = ([x,y,z], mat) => mat.map( ([a,b,c]) => a*x + b*y + c*z );

const rx = (th) => (v) => mult(v, [ [ 1, 0, 0 ], [ 0, cos(th), -sin(th) ], [ 0, sin(th), cos(th) ] ])
const ry = (th) => (v) => mult(v, [ [ cos(th), 0, sin(th) ], [ 0, 1, 0 ], [ -sin(th), 0, cos(th) ] ])
const rz = (th) => (v) => mult(v, [ [ cos(th), -sin(th), 0 ], [ sin(th), cos(th), 0 ], [ 0, 0, 1 ] ])

const drawsphere = ({vel, lat_lines, lon_lines, rotx, roty, rotz}) => {
  io = isNaN(io) ? 0 : io + radians(vel);

  times(lat_lines)( i => times(lon_lines)( j => {
    if (!sphere_elements[i]) return;

    let node = sphere_elements[i][j];

    if (!node) return;

    const r = 300;
    const cx = 400, cy = 400;
    const inc = (i) => (PI * i / lat_lines) % PI;
    const azi = (j) => (io + 2 * PI * j / lon_lines) % (2 * PI);


    const x = (i,j) => r * sin(inc(i)) * cos(azi(j));
    const y = (i,j) => r * sin(inc(i)) * sin(azi(j));
    const z = (i,j) => r * cos(inc(i));
    const point = (i,j) => [ x(i,j), y(i,j), z(i,j) ];

    // draw a polygon with corners at lat, lat+1, lon, lon+1
    let k = i % 2 == 0 ? j : j + 0.5;
    let m = (i == lat_lines-1) ? (i + 0.99) : (i + 1);
    let points = [
      point(i,k),
      point(m,k),
      point(m,k+0.5),
      point(m,k+1),
      point(i,k+1),
      point(i,k+0.5)
    ].map(
        p => rz(radians(rotz))(ry(radians(roty))(rx(radians(rotx))(p)))
    );

    points = points.filter(p => p[2] > 0);

    // don't draw if z < 0 for all points
    if (points.length > 0) {
      points = points.map(([x,y])=>`${x+cx} ${y+cy}`).join(' ');
      node.element.setAttribute("d", `M ${points} Z` );
    } else {
      node.element.setAttribute("d", '');
    }

    node.element.setAttribute("fill", node.color);
  }))

}

setInterval(draw, 50);
setInterval(updateSphereColors, 500);
