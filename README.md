# Spritesheet.js
A library to use spritesheet based animations in the HTML5 canvas. Spritesheets are images that contain all the assets needed to render one (or many) 2D animations on the screen, and are comonly used in (but not limited to) videogames. This library was originally developed for one of my games (Paradux, for the Imagine Cup), so some features are quite particular and they won't be needed in most of the common usage cases. Despite that, the library pretends to be generic enough to be used in almost any web/game/app that uses spritesheets, and be platform and device independent (that is the reason why some features, as rotation, were not initially considered).
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
Coming soon!
##Examples
Check out [examples/example1.html](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/examples/example1.html) to see a quick example that shows various features, and you should also read [examples/spritesheets.xml](https://github.com/arcadiogarcia/Spritesheet.js/blob/master/examples/spritesheets.xml) to see the spritesheet structure. Thanks to [Silvia Barbero](http://silvishinystar.deviantart.com/) for allowing me to use her dog sprite!
##Known bugs
There are no known bugs, if you find one please report it! (or even better, fix it yourself and submit a pull request)
##Roadmap
These features will be added to the library:
  - **Sounds**:
  Frames will be able to play sound files, allowing to integrate animations and sound effects
  - **Several optimizations**:
  For example, the library doesn't take into account which objects are actually in the screen area, so it renders everything. That should be fixed.

These feaures are being considered:
  - **Cutscenes**:
  Preset animations that specify the movement of instanciated objects, it could be used to create movies, cutscenes or any kind of non-interactive animation.

If you have ideas for more features, or want to help implementing some of those mentioned here, pull requests are welcome!


