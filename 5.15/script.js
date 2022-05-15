var canvas = document.querySelector('canvas');
var gl = canvas.getContext('webgl');
var width, height;
var mouseX = 0;
var mouseY = 0;
var startTime = new Date().getTime(); // Get start time for animating

// ----- Uniform ----- //

function Uniform( name, suffix ) {
  this.name = name;
  this.suffix = suffix;
  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getUniformLocation
  this.location = gl.getUniformLocation( program, name );
}

Uniform.prototype.set = function( ...values ) {
  var method = 'uniform' + this.suffix;
  var args = [ this.location ].concat( values );
  gl[ method ].apply( gl, args );
};

// ----- Rect ----- //

function Rect( gl ) {
  var buffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
  gl.bufferData( gl.ARRAY_BUFFER, Rect.verts, gl.STATIC_DRAW );
}

Rect.verts = new Float32Array([
  -1, -1,
   1, -1,
  -1,  1,
   1,  1,
]);

Rect.prototype.render = function( gl ) {
  gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
};

// ----- init WebGL ----- //

// create program
var program = gl.createProgram();
// add shaders
var vertexShaderSource = document.querySelector('#vertex-shader').text;
var fragmentShaderSource = document.querySelector('#fragment-shader').text;
addShader( vertexShaderSource, gl.VERTEX_SHADER );
addShader( fragmentShaderSource, gl.FRAGMENT_SHADER );
// link & use program
gl.linkProgram( program );
gl.useProgram( program );

// create fragment uniforms
var uResolution = new Uniform( 'u_resolution', '2f' );
var uMouse = new Uniform( 'u_mouse', '2f' );
var uTime = new Uniform( 'u_time', '1f' );
// create position attrib
var billboard = new Rect( gl );
var positionLocation = gl.getAttribLocation( program, 'a_position' );
gl.enableVertexAttribArray( positionLocation );
gl.vertexAttribPointer( positionLocation, 2, gl.FLOAT, false, 0, 0 );

resize();
animate();

// ----- addShader ----- //

function addShader( source, type ) {
  var shader = gl.createShader( type );
  gl.shaderSource( shader, source );
  gl.compileShader( shader );
  var isCompiled = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
  if ( !isCompiled ) {
    throw new Error( 'Shader compile error: ' + gl.getShaderInfoLog( shader ) );
  }
  gl.attachShader( program, shader );
}

// ----- render ----- //

function animate() {
  // update
  var now = new Date().getTime();
  var currentTime = ( now - startTime ) / 1000;
  uTime.set( currentTime );
  uMouse.set( mouseX, mouseY );
  // render
  billboard.render( gl );
  // animate next frame
  requestAnimationFrame( animate );
}

// ----- resize ----- //

function resize() {
  width = canvas.width  = window.innerWidth;
  height = canvas.height = window.innerHeight;
  uResolution.set( width, height );
  gl.viewport( 0, 0, width, height );
}

window.addEventListener( 'resize', resize );

// ----- mouse move ----- //

document.addEventListener( 'mousemove', function( event ) {
  mouseX = event.pageX;
  mouseY = height - event.pageY;
});