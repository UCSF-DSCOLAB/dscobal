let {cos,sin,PI,random,floor,min,max} = Math;

let createElement = (type, atts) => {
  let shape = document.createElementNS("http://www.w3.org/2000/svg", type); 
  // Set any attributes as desired
  Object.keys(atts).forEach(att => shape.setAttribute(att, atts[att]));
  return shape;
}

let txt = (id) => document.querySelector('#' + id).value;
let val = (id) => parseFloat(txt(id));

let stroke = 'darkgoldenrod'
let stroke_width = 6;

let path = (fill, stroke, stroke_width, ...points) => createElement('path',
  { fill, stroke, 'stroke-width': `${stroke_width}px`, d: `M ${points.map(([x,y])=>`${x} ${y}`).join(' ')} Z` }
);
let times = (n) => (iterator) => Array(n).fill().map((_,i) => iterator(i));
let radians = (deg) => PI * (deg / 180);

let colorMatrix = [];

let r = 300;
let cx = 400, cy = 400;

let color = (i,j) => colorMatrix[i] ? colorMatrix[i][j] : 'red';

let lat_lines = 16;
let lon_lines = 16;

let replacement_rate = 0.3;

let makeColorMatrix = () => {
  let colors = txt('color').split(/\s+/);
  colorMatrix = times(lat_lines)( i => times(lon_lines)( j => 
        random() < replacement_rate || !colorMatrix.length
        ?  colors[floor(random() * colors.length)]
        : color(i,j)
  ))
}
window.onload = () => makeColorMatrix();

let io = 0;
let inc = (i) => (PI * i / lat_lines) % PI;
let azi = (j) => (io + 2 * PI * j / lon_lines) % (2 * PI);

let mult = ([x,y,z], mat) => mat.map( ([a,b,c]) => a*x + b*y + c*z );

let rx = (th) => (v) => mult(v, [ [ 1, 0, 0 ], [ 0, cos(th), -sin(th) ], [ 0, sin(th), cos(th) ] ])
let ry = (th) => (v) => mult(v, [ [ cos(th), 0, sin(th) ], [ 0, 1, 0 ], [ -sin(th), 0, cos(th) ] ])
let rz = (th) => (v) => mult(v, [ [ cos(th), -sin(th), 0 ], [ sin(th), cos(th), 0 ], [ 0, 0, 1 ] ])

let x = (i,j) => r * sin(inc(i)) * cos(azi(j));
let y = (i,j) => r * sin(inc(i)) * sin(azi(j));
let z = (i,j) => r * cos(inc(i));

let rot = [ 05, 33, 32 ];

let draw = () => {
  let svg = document.querySelector("#bal");
  while( svg.hasChildNodes() ) svg.removeChild(svg.lastChild);
  drawwheel(svg);
  drawsphere(svg);
}

let spokes = 12;
let wheel_radius = 3000;
let wcx = 300, wcy = 300;

let wio = 0;
let wx = (i) => wheel_radius * cos(2*PI*i/spokes+wio) + wcx;
let wy = (i) => wheel_radius * sin(2*PI*i/spokes+wio) + wcy;

let wheel_colors = [ [ 2, 'red' ], [ 3, 'green' ] ];

let drawwheel = (svg) => {
  wio = isNaN(wio) ? 0 : wio + radians(val('wvel'));
  wcx = min(1200, max(-400, val('wcx')));
  wcy = min(1200, max(-400, val('wcy')));
  wheel_colors = txt('wcolors').split(/\s+/).map(x => { s = x.split(/\,/); s[0] = parseInt(s[0]); return s;});
  spokes = val('wspokes');

  let spoke_size = wheel_colors.reduce( (sum, [width, col]) => sum + width, 0);
  times(spokes)( i => {
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

let point = (i,j) => [ x(i,j), y(i,j), z(i,j) ];

let drawsphere = (svg) => {
  io = isNaN(io) ? 0 : io + radians(val('vel'));
  lat_lines = val('lat_lines');
  lon_lines = val('lon_lines');
  stroke = txt('stroke');
  stroke_width = val('stroke_width');
  replacement_rate = val('rrate');
  let rotx = val('rotx');
  let roty = val('roty');
  let rotz = val('rotz');

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
    ).filter(
    	p => p[2] > 0
    );

    // don't draw if z < 0 for all points
    if (points.length > 1) {
      svg.appendChild(
        path(
          color(i,j),
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
