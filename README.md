# Spritesheet.js
A library to use spritesheet based animations in the HTML5 canvas. Spritesheets are images that contain all the assets needed to render one (or many) 2D animations on the screen, and are comonly used in (but not limited to) videogames. This library is a fork of the one developed for one of my games (Paradux, for the Imagine Cup), so some features are quite particular and they won't be needed in most of the common usage cases. Despite that, the library pretends to be generic enough to be used in almost any web/game/app that uses spritesheets, and be platform and device independent (that is the reason why some features, as rotation, were not initially considered).
## Main concepts
There are four levels to consider when designing a spritesheet:
* **Frames**
  - Frames are just squares cropped from the image, and therefore are defined by
    - X position
    - Y position
    - Width
    - Height
    - A frame duration (t) must also be specified, it indicates how long will that frame be shown in the screen. A duration of 0 means that that frame will be shown as long as the animation continues.
- **Layers**
  - Layers are ordered sets of frames that are displayed one after the other. Therefore they are defined by a list of frames, and they can also be moved specifying two functions: x(t) and y(t)
- **States**
  - States are a set of layers that are displayed at the same time on the screen, overlaying if necessary. Therefore they are just a list of layers.
- **Spritesheet**
  - Spritesheets are the set of states, plus all of their associated layers and frames, and the image from which the frames should be extracted.

For example, when animating a person walking, there could be two states: "Idle" and "Walking". Each state could be formed by several layers: "Body", "Arms", "Legs", and some layers could be reused in both states. Each layer could have several frames with the sucessive steps of the animation. Finally, the spritesheet should contain all of them, plus a reference to "someone_walking.png". 
##Writing the spritesheet with XML
A XML file can describe one or multiple spritesheets and has the following structure:
```
<spritesheets>
 <spritesheet name="Something" src="path/something.png">
    <states>
      <state name="State1">
        <layer name="Layer1"></layer>
        ...
      </state>
      ...
    </states>
    <layers>
       <layer name="Layer1" x="0" y="0">
        <frame name="Frame1"></frame>
        ...
      </layer>
      ...
    </layers>
    <frames>
      <frame name="Frame1" x="0" y="0" w="100" h="50" t="30"></frame>
      ...
    </frames>
  </spritesheet>
  ...
</spritesheets>
```

You can test the animations in the [viewer](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/tools/viewer.html).
##Using the library
To start using the library follow this steps:
  1. Include the .js file in your .html file.
  `<script src="spritesheet.js"></script>`
  2. Instantiate the library. If you want to draw on several canvases, you will need adifferent instance for each one.
  `var canvasAnimation = new Spritesheet();`
  3. Set up the library specifying a canvas and the frames per second.
  `canvasAnimation.setUp(document.getElementById("canvas"), 30);`
  4. Choose a buffer size (the default is 1366x768).
  `canvasAnimation.setBufferSize(800, 600);`
  5. Load one or several XML files with your spritesheets
  ` canvasAnimation.asyncload("spritesheets.xml", callback_load);`
  6. Once the XML files have been loaded (you should use the callback to wait until that has happened), you can create objects that instantiate a spritesheet. Keep track of the ids generated to modify those objects.
  `var object_id = canvasAnimation.addObject("Spritesheet", "State", 0, 0, 0, false, false);`
  7. Set the camera position if needed.
  `canvasAnimation.setCamera(-650, 0);`
  8. You can modify the objects using their id, like in these examples.
```
   canvasAnimation.setState(object_id, "SomeState");
   canvasAnimation.setX(object_id, 50);
   canvasAnimation.moveX(20);
```

##FAQ
  - *Should I use this library?*
  
  If you are developing an app, game or webpage in HTML/JS that needs to use 2D animations using spritesheets, this library is for you! If you need 3D or vector animation, this library won't help you (unless you want to embed your vector drawing code in custom 'code' frames, or use this library to render 'animated' textures for your 3d meshes).

  - *Where should I start?*
  
  Start running and reading the examples to see how to use the library, and you should read the xml files with the spritesheets. If you create an xml spritesheet, you can test it in the [viewer](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/tools/viewer.html) without having to write any code. You should also read the complete list of functions in the doc directory.

  - *The examples don't work, I only see a blank screen!*

  The library uses an XMLHTTPRequest to fetch the spritesheet, so you should either use the library on the server or use Firefox, which doesn't block the loading of local files (other browsers do it for security reasons).
  
  - *What are the advantages of using the library?*
  
  First of all, you don't have to write code to handle animations, it is as easy as using the library. But there are also other benefits: the modular nature of the spritesheets allow to reuse animations between projects, or redraw and reanimate everything, without writing a single line of code. 

  If you work in a team, the animators probably will not be involved in the code: with this library you can let them write the spritesheets, test them and work independiently using the [viewer](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/tools/viewer.html) without having to be constantly asking for modifications in your code base.

##Examples
Check out [examples/example1.html](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/examples/example1.html) to see a quick example that shows various features, and you should also read [examples/spritesheets.xml](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/examples/spritesheets.xml) to see the spritesheet structure.

Check out [examples/example2.html](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/examples/example2.html) to see how to use custom render modes.

Check out [examples/example3.html](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/examples/example3.html) to see how to use the Zindex to make '3d' animations.

Check out [examples/example4.html](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/examples/example4.html) to see when to use static objects and how to use custom 'code frames'.

Thanks to [Silvia Barbero](http://silvishinystar.deviantart.com/) for allowing me to use her dog sprite!

If you have used Spritesheet.js in a project, or you have just made a nice demo, you can ask to be featured in this section!
##Known bugs
There are no known bugs, if you find one please report it! (or even better, fix it yourself and submit a pull request)
##Roadmap
These features will be added to the library:
  - **Sounds**:
  Frames will be able to play sound files, allowing to integrate animations and sound effects
  - **Several optimizations**:
  For example, the library doesn't take into account which objects are actually in the screen area, so it renders everything. That should be fixed.
  - **More rendermodes**
  Right now, only a default rendermode (that uses all the width available) is suplied with the library. Additional render modes will come preloaded to cover other common use cases (use all the height available, cover, contain...). They would basically mimic the background-size CSS property, to allow more control about how the buffer is drawn on the canvas.


These feaures are being considered:
  - **Cutscenes**:
  Preset animations that specify the movement of instanciated objects, it could be used to create movies, cutscenes or any kind of non-interactive animation.
  - **Spritesheet creator**:
  A small utitlity to create the animations, drawing squares to create the frames and grouping them in layers and states.

If you have ideas for more features, or want to help implementing some of those mentioned here, pull requests are welcome!


