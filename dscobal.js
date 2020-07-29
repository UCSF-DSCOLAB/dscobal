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

const times = (n) => (iterator) => Array(n).fill().map((_,i) => iterator(i));
const radians = (deg) => PI * (deg / 180);

let colorMatrix = [];

const getColor = (i,j) => colorMatrix[i] ? colorMatrix[i][j] : 'red';

const makeColorMatrix = () => {
  let {color, lat_lines, lon_lines, rrate} = readConfig();

  colors = color.split(/\s+/);
  colorMatrix = times(lat_lines)( i => times(lon_lines)( j => 
        random() < rrate || !colorMatrix.length
        ? colors[floor(random() * colors.length)]
        : getColor(i,j)
  ))
}

const readConfig = () => {
  const num = [ 'wvel', 'wcx', 'wcy', 'wspokes', 'vel', 'lat_lines',
    'lon_lines', 'stroke_width', 'rrate', 'rotx', 'roty', 'rotz' ];
  const str = [ 'color', 'wcolors', 'stroke' ];
  const txt = (id) => document.querySelector('#' + id).value;
  const val = (id) => parseFloat(txt(id));

  config = {}

  num.forEach(n => config[n] = val(n));
  str.forEach(s => config[s] = txt(s));

  return config;
}

let draw = () => {
  let svg = document.querySelector("#bal");
  let config = readConfig();
  while( svg.hasChildNodes() ) svg.removeChild(svg.lastChild);
  drawwheel(svg, config);
  drawsphere(svg, config);
}

window.onload = () => makeColorMatrix();


// draw a wheel

const wheel_radius = 3000;

let wio = 0;

const drawwheel = (svg, {wcx, wcy, wvel, wspokes, wcolors}) => {
  const wx = (i) => wheel_radius * cos(2*PI*i/wspokes+wio) + wcx;
  const wy = (i) => wheel_radius * sin(2*PI*i/wspokes+wio) + wcy;

  let wheel_colors;

  wio = isNaN(wio) ? 0 : wio + radians(wvel);

  wcx = min(1200, max(-400, wcx));
  wcy = min(1200, max(-400, wcy));
  wheel_colors = wcolors.split(/\s+/).map(x => { s = x.split(/\,/); s[0] = parseInt(s[0]); return s;});

  let spoke_size = wheel_colors.reduce( (sum, [width, col]) => sum + width, 0);
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
