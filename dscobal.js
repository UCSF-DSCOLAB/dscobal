let {cos,sin,PI,random,floor,min,max} = Math;

const createElement = (type, atts) => {
  let shape = document.createElementNS("http://www.w3.org/2000/svg", type); 
  // Set any attributes as desired
  Object.keys(atts).forEach(att => shape.setAttribute(att, atts[att]));
  return shape;
}

let stroke = 'darkgoldenrod'
let stroke_width = 6;

let path = (fill, stroke, stroke_width, ...points) => createElement('path',
  { fill, stroke, 'stroke-width': `${stroke_width}px`, d: `M ${points.map(([x,y])=>`${x} ${y}`).join(' ')} Z` }
);

let text = (txt, x, y, fill, stroke, stroke_width, transform) => {
  let t = document.createElement('span');
  t.style = `left: 100px; top: 100px; position: absolute; transform: ${transform}`
  t.innerHTML = txt;
  return t;
}

const times = (n) => (iterator) => Array(n).fill().map((_,i) => iterator(i));
const radians = (deg) => PI * (deg / 180);

let colorMatrix = [];

const getColor = (i,j) => colorMatrix[i] ? colorMatrix[i][j] : 'red';

const makeColorMatrix = () => {
  let {colors, lat_lines, lon_lines, rrate} = readConfig();

  colorMatrix = times(lat_lines)( i => times(lon_lines)( j => 
        random() < rrate || !colorMatrix.length
        ? colors[floor(random() * colors.length)]
        : getColor(i,j)
  ))
}

const CONFIGS = {
  default: {
    wvel:0.5, wcx:300, wcy:300, wspokes:20,
    vel:1,
    lat_lines:16, lon_lines:32,
    stroke_width:2,
    rrate:0.3,
    rotx:5, roty:25, rotz:35,
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
    rotx:76, roty:164, rotz:34,
    color: "gray gray #444",
    wcolors:"10,black 1,#0f0 30,black 1,#0f0 10,black 1,#f00",
    stroke:"#666"
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
    rotx:-70,
    roty:125,
    rotz:35,
    color:"#0d7998 #0f7862 #106452 #11866e #126e5c #17677c #1f88ab #26aae1 #76184f #871d58 #9c2420 #9f2064 #c43388 #cb393a #d96727 #e24c4c #e27a26 #ee6e6f #ef8721 #f79622",
    wcolors:"1,#052049 3,#178ccb 15,white 3,#f48024",
    stroke:"darkgoldenrod"
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
    rotx:-20,
    roty:-40,
    rotz:55,
    color:"gold orange yellow",
    wcolors:"1,pink 1,white 1,papayawhip",
    stroke:"darkgoldenrod"
  }
}

let config = {};

const loadConfig = (template) => {
  Object.keys(template).forEach( t => document.querySelector('#'+t).value = template[t]);

  updateConfig();
}

const updateConfig = () => {
  const num = [ 'wvel', 'wcx', 'wcy', 'wspokes', 'vel', 'lat_lines',
    'lon_lines', 'stroke_width', 'rrate', 'rotx', 'roty', 'rotz' ];
  const str = [ 'color', 'wcolors', 'stroke' ];
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

}

const readConfig = () => config;

const draw = () => {
  let svg = document.querySelector("#bal");
  let config = readConfig();
  while( svg.hasChildNodes() ) svg.removeChild(svg.lastChild);
  drawtext(svg, config);
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

  makeColorMatrix();
}

// draw orbiting text

let tx = 400;
let ty = 400;

let rtx = 0;
let rty = 0;
let rtz = 0;

const drawtext = (svg,config) => {
  rtx += 1;
  rtz += 1;
  rty += 1;
  let t = document.querySelector("#textbox");
  t.innerHTML='';
  t.appendChild(
    text('D', 100, 100, 'goldenrod', 'black', 0, `translateZ(500px) rotateX(${rtx}deg) rotateY(${rty}deg) rotateZ(${rtz}deg)`)
  )
}

// draw a wheel

const wheel_radius = 3000;

let wio = 0;

const drawwheel = (svg, {wcx, wcy, wvel, wspokes, spoke_size, wheel_colors}) => {
  const wx = (i) => wheel_radius * cos(2*PI*i/wspokes+wio) + wcx;
  const wy = (i) => wheel_radius * sin(2*PI*i/wspokes+wio) + wcy;

  wio = isNaN(wio) ? 0 : wio + radians(wvel);

  times(wspokes)( i => {
    let w = 0;
    wheel_colors.forEach( ([width, col]) => {
      svg.appendChild(
        path(
          col,
          'none',
          0,
          [ wcx, wcy ],
          [ wx(i+(w/spoke_size)), wy(i+(w/spoke_size)) ],
          [ wx(i+(w+width)/spoke_size), wy(i+(w+width)/spoke_size) ]
        )
      );
      w += width;
    })
  });
  
}


// draw a sphere

let io = 0;

let drawsphere = (svg, {vel, lat_lines, lon_lines, stroke, stroke_width, rotx, roty, rotz}) => {
  io = isNaN(io) ? 0 : io + radians(vel);

  const r = 300;
  const cx = 400, cy = 400;
  const inc = (i) => (PI * i / lat_lines) % PI;
  const azi = (j) => (io + 2 * PI * j / lon_lines) % (2 * PI);

  const mult = ([x,y,z], mat) => mat.map( ([a,b,c]) => a*x + b*y + c*z );

  const rx = (th) => (v) => mult(v, [ [ 1, 0, 0 ], [ 0, cos(th), -sin(th) ], [ 0, sin(th), cos(th) ] ])
  const ry = (th) => (v) => mult(v, [ [ cos(th), 0, sin(th) ], [ 0, 1, 0 ], [ -sin(th), 0, cos(th) ] ])
  const rz = (th) => (v) => mult(v, [ [ cos(th), -sin(th), 0 ], [ sin(th), cos(th), 0 ], [ 0, 0, 1 ] ])

  const x = (i,j) => r * sin(inc(i)) * cos(azi(j));
  const y = (i,j) => r * sin(inc(i)) * sin(azi(j));
  const z = (i,j) => r * cos(inc(i));
  const point = (i,j) => [ x(i,j), y(i,j), z(i,j) ];


  times(lat_lines)( i => times(lon_lines)( j => {
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
        p => rz(radians(rotx))(ry(radians(roty))(rx(radians(rotz))(p)))
    );
    
    points = points.filter(
    	p => p[2] > 0
    );

    // don't draw if z < 0 for all points
    if (points.length > 1) {
      svg.appendChild(
        path(
          getColor(i,j),
          stroke,
          stroke_width,
          ...points.map(([x,y,z]) => [ x + cx, y + cy ])
        )
      );
      }
  }))

}

setInterval(draw, 50);
setInterval(makeColorMatrix, 500);
