var words = `Lorem Ipsum is simply dummy text of the printing
and typesetting industry. Lorem Ipsum has been the
industry's standard dummy text ever since the 1500s,
when an unknown printer took a galley of type and scrambled
it to make a type specimen book. It has survived not only
five centuries, but also the leap into electronic
typesetting, remaining essentially unchanged. It was
popularised in the 1960s with the release of Letraset
sheets containing Lorem Ipsum passages, and more
recently with desktop publishing software like Aldus
PageMaker including versions of Lorem Ipsum.`;

     // Function returns an array of scrambled text, based on the amount of lines you give it.
     function createLineText(text, lines) {
       var textItems = [];
       var words = text.split(" ");

       // For each line of text
       for (var i = 0; i <= lines; i++) {
         // Shuffle words
         for (var j = words.length - 1; j > 0; j--) {
           var k = Math.floor(Math.random() * (j + 1));
           var temp = words[j];
           words[j] = words[k];
           words[k] = temp;
         }

         textItems.push(words.join(" "));
       }

       return textItems;
     }

     var scale = 1;

     wordMap.main({gapX: 10, lines: 20, scale: scale, particleLinesText: createLineText(words, 20), font: '17px monospace'});
     wordMap.inflectors = [{x: 200, y: 200, push: 100}];

     // Animate specific lines, line 5, in the positive direction, line 10 in the negative direction
     wordMap.animateLines = [[5, 1], [10, -1]];

     document.onmousemove = function (e) {mousePos(e);};
     function mousePos (e) {

       mouseX = e.pageX;
       mouseY = e.pageY;

       wordMap.inflectors[0].x = mouseX * scale;
       wordMap.inflectors[0].y = mouseY * scale;

       //wordMap.inflectors = [{x: mouseX, y: mouseY, push: 100}];

       }

     // UI
     // var gui = new dat.GUI();
     // var folder1 = gui.addFolder("Inflector 1");
     // folder1.add(wordMap.inflectors[0], "x", 0, window.innerWidth * 1.5);
     // folder1.add(wordMap.inflectors[0], "y", 0, window.innerWidth * 1.5);
     // folder1.add(wordMap.inflectors[0], "push", 0, 150);
     // folder1.open();
