// start slingin' some d3 here.

var gameOptions = {
  width: 750,
  height: 750,
  numEnemies: 20,
  padding: 20
}

// Keep track of score and collisions
var gameStats = {
  highScore: 0,
  score: 0,
  collisions: 0
}

// ----------------------------------------------------------------------------------

// Draw game board
var gameBoard = d3.select('.gameArea').append("svg")
  .attr('width', gameOptions.width)
  .attr('height', gameOptions.height);

// Set relative coordinate system
var axes = {
  x: d3.scale.linear().domain([0,100]).range([0, gameOptions.width - 60]), 
  y: d3.scale.linear().domain([0,100]).range([0, gameOptions.height - 60])
}

// ----------------------------------------------------------------------------------

// Create enemies and put them on the screen
var initEnemies = function() {
  var enemies = [];

  for (var i = 0; i < gameOptions.numEnemies; i++) {
    enemies.push({
      id: i, 
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100) 
    });
  }

  return enemies;
};

// Save array of enemies
var enemies = initEnemies();
var asteroids = initEnemies();
// ----------------------------------------------------------------------------------

var Player = function(){
  this.x = gameOptions.width / 2;
  this.y = gameOptions.height / 2;
  this.angle = 0;
  this.r = 0;
};

var drag = d3.behavior.drag()
    .origin(function(d) { return d; })
    .on("drag", dragmove);

function dragmove(d) {
  d3.select(this)
      .attr("x", d.x = Math.max(-10, Math.min(gameOptions.width - 50, d3.event.x)))
      .attr("y", d.y = Math.max(0, Math.min(gameOptions.height - 60, d3.event.y)))
      .attr("angle", d.angle = 360 * (Math.atan2(d.x,d.y)/(Math.PI*2)));
};



var newPlayer = new Player();

var players = [];

players.push(newPlayer);

d3.select('svg').selectAll('.player')
  .data(players)
  .enter()
  .append('image')
  .attr('class', 'player')
  .attr('x', function(d){return d.x})
  .attr('y', function(d){return d.y})
  .attr('angle', function(d){return d.angle})
  .attr('r', 10)
  .attr('xlink:href', 'img/ship.png')
  .attr('width', 60)
  .attr('height', 60)
  .call(drag);

// ---------------------------------------------------------------------------------- 

var checkCollision = function(enemies, collidedCallback){
    var enemy = d3.select('svg').selectAll('.enemy');
    var radiusSum = parseFloat(enemy[0][0].getAttribute('width')) / 2 + newPlayer.r;

    for (var i = 0; i < enemies.length; i++) {
      var xDiff = enemy[0][i].getAttribute('x') - newPlayer.x;
      var yDiff = enemy[0][i].getAttribute('y') - newPlayer.y;

      var separation = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
      if (gameStats.score > 10 && separation < radiusSum) {
        collidedCallback();
      }
    }
};

var collided = function() {
  // Toggle explosion gif
  d3.select('.player').attr('xlink:href', 'img/explosion.gif');

  // Update scores
  gameStats.collisions+=1;
  gameStats.score = 0;
  updateScore();
  
  // Toggle back to player ship after 2 seconds
  setInterval(function(){
    d3.select('.player').attr('xlink:href', 'img/ship.png');
  }, 2000);
};

// Main game updater function
var update = function(data){

  // DATA JOIN
  // Join new data with old elements, if any.
  var enemies = gameBoard.selectAll('.enemy')
      .data(data);

  // UPDATE
  // Update old elements as needed.
  d3.select("svg").selectAll('.enemy').transition().duration(2000)
    .attr('x', function(d){return axes.x( Math.random() * 100 )})
    .attr('y', function(d){return axes.y( Math.random() * 100 )})
    .attr('id', function(d){return d.id});

  // ENTER
  // Create new elements as needed.
  enemies.enter().append('image')
    .attr('class', 'enemy')
    .attr('xlink:href', 'img/badShip.gif')
    .attr('width', 60)
    .attr('height', 60)
    .attr('class', 'enemy')
    .attr('x', function(d){return axes.x(d.x)})
    .attr('y', function(d){return axes.y(d.y)})
    .attr('id', function(d){return d.id});
 
  // ENTER + UPDATE
  // Appending to the enter selection expands the update selection to include
  // entering elements; so, operations on the update selection after appending to
  // the enter selection will apply to both entering and updating nodes.
  enemies.attr("r", 10);

  // EXIT
  // Remove old elements as needed.
  enemies.exit().remove();
};

var updateScore = function() {
  d3.select('#highScore')
    .text(gameStats.highScore.toString());
  d3.select('#currentScore')
    .text(gameStats.score.toString());
  d3.select('#collisionNum')
    .text(gameStats.collisions.toString());
  
  d3.select('.highScoreBar')
      .style('width', (100 + gameStats.highScore).toString() + 'px');
  d3.select('.scoreBar')
    .style('width', (100 + gameStats.score).toString() + 'px');
  d3.select('.collisionBar')
    .style('width', (100 + gameStats.collisions).toString() + 'px');
};

var increaseScore = function() {
  if (gameStats.score > gameStats.highScore){ 
    gameStats.highScore = gameStats.score;
  }
  gameStats.score++;
  updateScore();
};

var play = function() {
  // Start moving enemies
  update(enemies);
  update(asteroids);

  setInterval(function() {
    checkCollision(enemies, collided);
  }, 40);

  setInterval(function() {
    increaseScore();
  }, 50);

  setInterval(function() {
    update(enemies);
  }, 2000);
};

play();