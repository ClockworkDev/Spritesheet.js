# Spritesheet.js
A library to use spritesheet based animations in the HTML5 canvas. Spritesheets are images that contain all the assets needed to render one (or many) 2D animations on the screen, and are comonly used in (but not limited to) videogames. This library was originally developed for one of my games (Paradux, for the Imagine Cup), so some features are quite particular and they won't be needed in most of the common usage cases. Despite that, the library pretends to be generic enough to be used in almost any web/game/app that uses spritesheets, and be platform and device independent (that is the reason why some features, as rotation, were not initially considered).
## Main concepts
There are four levels to consider when designing a spritesheet:
* Frames
  - Frames are just squares cropped from the image, and therefore are defined by
    - X position
    - Y position
    - Width
    - Height
    - A frame duration (t) must also be specified, it indicates how long will that frame be shown in the screen. A duration of 0 means that that frame will be shown as long as the animation continues.
- Layers
  - Layers are ordered sets of frames that are displayed one after the other. Therefore they are defined by a list of frames, and they can also be moved specifying two functions: x(t) and y(t)
- States
  - States are a set of layers that are displayed at the same time on the screen, overlaying if necessary. Therefore they are just a list of layers.
- Spritesheet
  - Spritesheets are the set of states, plus all of their associated layers and frames, and the image from which the frames should be extracted.

For example, when animating a person walking, there could be two states: "Idle" and "Walking". Each state could be formed by several layers: "Body", "Arms", "Legs", and some layers could be reused in both states. Each layer could have several frames with the sucessive steps of the animation. Finally, the spritesheet should contain all of them, plus a reference to "someone_walking.png". 
##Writing the spritesheet with XML
Coming soon!
##Using the library
Coming soon!
##FAQ
Coming soon!
##Examples
Check out examples/example1.html to see a quick example that shows various features, and you should also check examples/spritesheets.xml to see the spritesheet structure. Thanks to [Silvia Barbero](http:\\www.silvishinystar.deviantart.com) for allowing me to use her dog sprite!