var WordMap = function() {
  "use strict";

  var canvas;
  var context;

  var width;
  var height;
  var scale;
  var font;

  var particleLines = [];
  var particleLinesText = [];

  var gapX, gapY;

  var textMap = {};
  var drawLines = false;

  // TODO: Replace with actual system
  this.inflectors = [];
  this.animateLines = [];

  // Global counters
  var characterIndex = 0;

  /**
   * Utils
   */

  // Performance:
  // Loops through all the characters given, and creates small canvas's to save on rendering
  function populateTextMap() {
    var i, j;
    for (i = 0; i < particleLinesText.length; i++) {
      var line = particleLinesText[i];
      for( j = 0; j < line.length; j++ ) {
        var character = line[j];
        if (!textMap[character]) {
          var c = document.createElement("canvas");
          var ctx = c.getContext("2d");
          c.width = 50;
          c.height = 50;
          ctx.font = font;
          ctx.fillStyle = "#000";
          ctx.fillText(character, 15, 15);
          textMap[character] = c;
        }
      }
    }
  }

  // Performance
  function getCharacters(line) {
    
    var string = particleLinesText[line][characterIndex];
    
    characterIndex++;
    if (characterIndex > particleLinesText[line].length - 1) {
      characterIndex = 0;
    }

    return string;
  }

  // Point based functions
  function point(x, y) {
    this.x = x;
    this.pX = x;
    this.y = y;
    this.pY = y;
  }

  function updatePointPosition(point) {

    point.x = point.pX;
    point.y = point.pY;

    for (var i = 0; i < wordMap.inflectors.length; i++) {
      var inflector = wordMap.inflectors[i];
      
      // Calculate the angles of inflection
      var theta = Math.atan2(point.y - inflector.y, point.x - inflector.x);

      // Inflect
      point.x = Math.cos(theta) * inflector.push + point.x;
      point.y = Math.sin(theta) * inflector.push + point.y;
    }

    return point;
  }

  function drawPoints() {

    var i, j;
    context.strokeStyle = "#000";
    context.lineWidth = 1;

    for (i = 0; i < particleLines.length; i++) {
    
      var line = particleLines[i];
      characterIndex = 0;

      var previousPoint = null;

      // Loop through each point
      for (j = 0; j < line.length; j++) {
       
        var p = updatePointPosition(line[j]);

        // Starting point
        if (previousPoint === null) {
          previousPoint = p;

        // Connecting 2 points together  
        } else {
          
          var xDistance = p.x - previousPoint.x;
          var yDistance = p.y - previousPoint.y;

          // Divide up points that are very distant from each other, and subdivide them
          if (Math.abs(xDistance) > 16 || Math.abs(yDistance) > 16) {
            
            // Sub points
            var maxDist = Math.max(Math.abs(xDistance), Math.abs(yDistance));
            var distSeperator = 10;
            var subPoints = Math.ceil(maxDist / distSeperator);

            var thePreviousPoint = previousPoint;

            for (var k = 1; k <= subPoints; k++) {

              // Create artificial sub-points
              var newPoint = updatePointPosition({
                x: p.pX - (p.pX - thePreviousPoint.pX) * (1 - k / subPoints),
                y: p.pY - (p.pY - thePreviousPoint.pY) * (1 - k / subPoints),
                pX: p.pX - (p.pX - thePreviousPoint.pX) * (1 - k / subPoints),
                pY: p.pY - (p.pY - thePreviousPoint.pY) * (1 - k / subPoints)
              });

              var from = { x: previousPoint.x, y: previousPoint.y };
              var to = { x: newPoint.x, y: newPoint.y };

              var angle = Math.atan2(to.y - from.y, to.x - from.x);
              var angleDistance = Math.sqrt(
                (to.x - from.x) * (to.x - from.x) +
                  (to.y - from.y) * (to.y - from.y)
              );

              if (!drawLines) {
                context.save();
                context.translate(from.x, from.y);
                context.rotate(angle + (Math.random() * (0.001 * 2) - 0.001));
                context.drawImage(textMap[getCharacters(i)], 0, 0);
                context.restore();
              } else {
                context.beginPath();
                context.moveTo(from.x, from.y);
                context.lineTo(to.x, to.y);
                context.stroke();
              }

              previousPoint = newPoint;
            }
          } else {
            var from = { x: previousPoint.x, y: previousPoint.y };
            var to = { x: p.x, y: p.y };

            // Draw with letters
            if (!drawLines) {

              var size = 17;
              context.font = font;

              var angle = Math.atan2(to.y - from.y, to.x - from.x);

              var angleDistance = Math.sqrt(
                (to.x - from.x) * (to.x - from.x) +
                  (to.y - from.y) * (to.y - from.y)
              );

              // Performance:
              // If the angle we are calculating is small, don't do another transformation
              if (Math.abs(angle) < 0.1) {
                context.drawImage(
                  textMap[getCharacters(i)],
                  from.x,
                  from.y
                );
              } else {
                context.save();
                context.translate(from.x, from.y);
                context.rotate(angle + (Math.random() * (0.001 * 2) - 0.001));
                context.drawImage(textMap[getCharacters(i)], 0, 0);
                context.restore();
              }

            // Draw with lines
            } else {
              context.beginPath();
              context.moveTo(from.x, from.y);
              context.lineTo(to.x, to.y);
              context.stroke();
            }
          }

          previousPoint = p;
        }
      }

      previousPoint = null;
    }
  }

  // Soft object augmentation
  function extend(target, source) {
    for (var key in source) if (!(key in target)) target[key] = source[key];
    return target;
  }

  function clearCanvas() {
    canvas.width = canvas.width;
  }

  /**
   * Word Map
   */

  function init(element) {

    // Create and add the canvas to the page
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;

    particleLines = createLines(width / gapX, height / gapY);
    populateTextMap();

    draw();
  }

  // Creates the grid of points that will move with the inflections
  function createLines(points_x, points_y) {
    var lines = [];
    var horizontalPoints = points_x;
    var verticalPoints = points_y;

    var i, j;

    //Create new points
    for (i = 0; i < verticalPoints; i++) {
      var line = [];

      for (j = 0; j < horizontalPoints; j++) {
        line.push(new point(j * gapX, i * gapY));
      }

      lines.push(line);
    }

    return lines;
  }

  // Updates animating text
  function update() {
    for( var i = 0; i < wordMap.animateLines.length; i++ ) {

      var details = wordMap.animateLines[i];
      var direction = details[1];

      // Move first char to last
      if (direction > 0) {
        particleLinesText[details[0]] =
          particleLinesText[details[0]].substring(1) +
          particleLinesText[details[0]].charAt(0);
      } else {
        particleLinesText[details[0]] =
          particleLinesText[details[0]].charAt(particleLinesText[details[0]].length - 1) +
          particleLinesText[details[0]].substring(
            0,
            particleLinesText[details[0]].length - 1
          );
      }
    }
  }

  function draw() {
    update();
    clearCanvas();
    drawPoints();
    requestAnimationFrame(draw);
  }

  function config(options) {
    
    // Handle options
    if( !options.scale ) {
      scale = 1.5;
    } else {
      scale = options.scale;
    }

    width = window.innerWidth * scale;
    height = window.innerHeight * scale;

    gapX = options.gapX;
    gapY = Math.floor(height / options.lines);

    font = options.font;

    // The line text passed in needs to match the given amount of lines.
    particleLinesText = options.particleLinesText;
  }

  function main(options) {
    config(options);
    init();
  }

  // Exposed Variables, for in line editing
  return {
    main: main,
    inflectors: this.inflectors,
    animateLines: this.animateLines,
    draw: draw
  };

};

wordMap = new WordMap();