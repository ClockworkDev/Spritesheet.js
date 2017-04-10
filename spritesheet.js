var Spritesheet = (function () {

    //Here is where you should put all your rendering code, which will be private
    //This canvas will be used as a buffer to store the image off-screen
    var buffercanvas = document.createElement("canvas");
    buffercanvas.width = 1366;
    buffercanvas.height = 768;
    var buffer_w = 1366, buffer_h = 768;
    //The context of the screen buffer
    //Everything should be written here
    //The 'real' context will only be modified when copying the buffer to the screen
    var context = buffercanvas.getContext('2d');

    //Here the 'real' canvas and context will be stored
    var canvas, realcontext;
    //Here we store the handler returned by the setInterval function
    var intervalholder;

    var workingFolder = "";


    //The camera allows to move the view without moving the individual sprites
    var camera = { x: 0, y: 0 };


    //Here we store the list of spritesheets
    var spritesheets = [];
    //Here we store the list of objects
    var objects = [];
    //This array is used to store the rendering order specified by the zindex of each object
    var objectsorder = [];
    //This variable stores the frames per second
    var fps;

    //This is the default rendermode, it just scales the buffer and prints it on the canvas
    var rendermode_default = function (contextinput, contextoutput) { contextoutput.clearRect(0, 0, contextoutput.canvas.width, contextoutput.canvas.height); contextoutput.drawImage(contextinput.canvas, 0, (contextoutput.canvas.height - contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width) / 2, contextoutput.canvas.width, (contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width)); };
    //It makes sense to set rendermode_default as the default rendermode!
    var rendermode = rendermode_default;

    var debugMode = false;
    var debugHandler;

    //Holds the spritesheet: Player, enemy1...
    function spritesheet() {
        this.name = "";
        this.img;
        this.states = [];
        this.layers = [];
        this.frames = [];
    }

    //Holds a 'state': Idle, jumping...
    function state() {
        this.name = "Name";
        this.layers = [];
    }

    //Holds a layer: Body, arms...
    function layer() {
        this.frames = [];
        this.x;
        this.y;
        this.t = 0;
    }

    //Holds a single frame
    function frame(x, y, w, h, t) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.t = t;
    }

    //This function is executed as many times per second as possible (using requestAnimationFrame)
    //It renders all the objects on the buffer
    //And then it copies it to the screen using the rendermode
    function renderdraw() {
        if (!objectsProcessed) {
            return; //TODO: See if this really affects perf
        }
        if (zIndexNeedsSorting) {//If the zindex is not updated, sort it
            sortZindex();
        }
        //First we clear the context
        context.clearRect(0, 0, buffercanvas.width, buffercanvas.height);
        //In case it was modified before, we reset the alpha
        context.globalAlpha = 1;
        //For each object
        for (var i = 0; i < objectsorder.length; i++) {
            //We get the object in that position acoording to the zindex
            var object = objects[objectsorder[i].v];
            //We get its spritesheet
            var spritesheet = object.spritesheet;
            var state = spritesheet.states[0];
            //We get the current state
            if (object.state != undefined) {
                state = object.state;
            }
            //We loop over the layers of its current state
            for (var j in state.layers) {

                //We get the data corresponding to that layer
                var layer_n = state.layers[j];
                var layer = spritesheet.layers[layer_n];
                if (object.hiddenLayers[layer.name] == true) {
                    continue;
                }
                //We calculate which frame should be drawn
                //We set k to the first frame of the layer
                //And we add the duration of the frames until we reach current t
                var tempt = 0, k = 0;
                while (tempt < superModulo(object.t, layer.t)) {
                    var thisframe = spritesheet.frames[layer.frames[k]];
                    //If the duration of a frame is set to 0 it stops there
                    if (thisframe.t == 0) {
                        break;
                    }
                    k++;
                    //If we have reached exactly the end of the animation we set the first frame
                    if (k == layer.frames.length) {
                        k = 0;
                        break;
                    }
                    //We add the duration of this frame to the counter
                    tempt += thisframe.t;
                }
                //We finally have the frame that must be drawn
                var frame = spritesheet.frames[layer.frames[k]];
                //If it is a full texture frame, set the appropiate x,y,w,h
                if (frame.fullTexture) {
                    frame.x = frame.y = 0;
                    var img = object.img || spritesheet.img;
                    frame.w = img.width;
                    frame.h = img.height;
                }
                //If the object is static we dont take into account camera movements
                if (object.isstatic == true) {
                    var xposition = (+layer.x(object.t, object.vars)) + (+object.x);
                    var yposition = (+layer.y(object.t, object.vars)) + (+object.y);
                } else {
                    var xposition = (+layer.x(object.t, object.vars)) + (+object.x) - camera.x;
                    var yposition = (+layer.y(object.t, object.vars)) + (+object.y) - camera.y;
                }
                //Maybe the image must be flipped in some axis
                var flipoffsetx = 0;
                var flipoffsety = 0;
                switch (state.flip) {
                    case 1:
                        context.save();
                        flipoffsetx = -2 * xposition - frame.w;
                        context.scale(-1, 1);
                        break;
                    case 2:
                        context.save();
                        flipoffsety = -2 * yposition - frame.h;
                        context.scale(1, -1);
                        break;
                    case 3:
                        context.save();
                        flipoffsetx = -2 * xposition - frame.w;
                        flipoffsety = -2 * yposition - frame.h;
                        context.scale(-1, -1);
                        break;
                    default:
                        break;
                }
                if (frame.code == undefined) {
                    //If it is a frame from a file we draw it on the buffer
                    if (debugMode) {
                        try {
                            context.drawImage(object.img || spritesheet.img, frame.x, frame.y, frame.w, frame.h, xposition + flipoffsetx, yposition + flipoffsety, frame.w, frame.h);
                        } catch (e) {
                            debugHandler("Exception drawing frame " + frame.name + " of " + spritesheet.name + " : Maybe the image path is wrong or the coordinates step outside the image.");
                        }
                    } else {
                        context.drawImage(object.img || spritesheet.img, frame.x, frame.y, frame.w, frame.h, xposition + flipoffsetx, yposition + flipoffsety, frame.w, frame.h);
                    }
                    //If we flipped before then we restore everything
                    switch (state.flip) {
                        case 1:
                        case 2:
                        case 3:
                            context.restore();
                            break;
                        default:
                            break;
                    }
                } else {
                    //Code shouldnt flip?s
                    switch (state.flip) {
                        case 1:
                        case 2:
                        case 3:
                            context.restore();
                            break;
                        default:
                            break;
                    }
                    //If it is a 'custom' frame, we execute the code
                    if (debugMode) {
                        try {
                            frame.code(xposition, yposition, object.t, context, object.vars);
                        } catch (e) {
                            debugHandler("Exception executing frame " + frame.name + " of " + spritesheet.name + " : " + e.message);
                        }
                    } else {
                        frame.code(xposition, yposition, object.t, context, object.vars);
                    }

                }
                //If we flipped before then we restore everything
                switch (state.flip) {
                    case 1:
                    case 2:
                    case 3:
                        context.restore();
                        break;
                    default:
                        break;
                }
            }
        }
        //Finally we draw the buffer on the screen
        rendermode(context, realcontext);
        objectsProcessed = false;
    }

    //This function is executed as many times as the fps specify
    //It just increments each object timer if needed
    function renderprocess() {
        for (var i = 0; i < objects.length; i++) {
            if (objectsorder[i] == undefined) {
                break;
            }
            var object = objects[objectsorder[i].v];
            if (!object) {
                continue;
            }
            if (object.pause != true) {
                object.t += 1000 / fps;
                var spritesheet = object.spritesheet;
                var state = object.state;
                if (object.t > state.totalduration) {
                    if (object.callback) {
                        object.callback();
                        object.callback = undefined;
                    }
                }
            }
        }
        objectsProcessed = true;
    }

    //This function sorts the objects according to its z index
    function sortZindex() {
        var objectIndexes = [];
        for (var i = 0; i < objectsInScope.length; i++) {
            if (objects[objectsInScope[i]] != null) {
                objectIndexes.push(objectsInScope[i]);
            }
        }
        objectsorder = sortingCriteria(objectIndexes);
    }

    var sortingCriteria = function (values) {
        var objectsorder = [];
        for (var i = 0; i < values.length; i++) {
            var ob = objects[values[i]];
            objectsorder.push({ v: values[i], z: ob.zindex, x: ob.x, y: ob.y });
        }
        return objectsorder.sort(function (a, b) {
            if (a.z != b.z) {
                return a.z - b.z; //Draw from back to front
            } else if (a.y != b.y) {
                return a.y - b.y; //From down to up
            } else {
                return a.x - b.x;//From left to right
            }
        });
    };

    function updateObjectState(object) {
        object.spritesheet = searchWhere(spritesheets, "name", object.spritesheetName);
        object.state = searchWhere(object.spritesheet.states, "name", object.stateName) || object.spritesheet.states[0]
    }

    function superModulo(a, b) {
        if (a >= 0) {
            return a % b;
        } else {
            return b + a % b;
        }
    }

    function findwhere(array, property, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][property] == value) {
                return i;
            }
        }
        return -1;
    }

    function getlayerduration(layer, spritesheet) {
        var d = 0;
        for (var i = 0; i < layer.frames.length; i++) {
            d += spritesheet.frames[layer.frames[i]].t;
            if (spritesheet.frames[layer.frames[i]].t == 0) {
                d += Infinity; //If i dont do this the modulo may reset before reaching the t=0 layer
            }
        }
        return d;
    }

    function searchWhere(array, key, value) {
        for (var i = 0; i < array.length; i++) {
            if (array[i][key] == value) {
                return array[i];
            }
        }
        return null;
    }

    //Grid rendering optimization logic
    //Flag no indicate if the annimation has been processed since the last draw
    var objectsProcessed = true;

    //This is the quad tree used to decide which objects are in the screen
    var quadtree = [];
    var readQuadtree = function (x, y) {
        if (quadtree[x] && quadtree[x][y]) {
            return quadtree[x][y];
        } else {
            return null;
        }
    }
    var addQuadtree = function (x, y, element) {
        if (quadtree[x]) {
            if (quadtree[x][y]) {
            } else {
                quadtree[x][y] = [];
            }
        } else {
            quadtree[x] = [];
            quadtree[x][y] = [];
        }
        quadtree[x][y].push(element);
    }
    var removeQuadtree = function (x, y, element) {
        if (quadtree[x] && quadtree[x][y]) {
            var index = quadtree[x][y].indexOf(element);
            if (index >= 0) {
                quadtree[x][y].splice(index, 1);
            }
        }
    }
    var quadtreeWidth, quadtreeHeight;
    quadtreeWidth = buffercanvas.width / 2;
    quadtreeHeight = buffercanvas.height / 2;
    var getQuadtreeCoordinate = function (x) {
        return Math.floor(x / quadtreeWidth);
    }
    var moveQuadtreeObject = function (element, oldx, oldy, newx, newy) {
        var bounds = objects[element].bounds;
        if (bounds == null) {
            moveQuadtreeObjectPosition(element, oldx, oldy, newx, newy);
        } else {
            var oldxc = getQuadtreeCoordinate(oldx);
            var oldyc = getQuadtreeCoordinate(oldy);
            var newxc = getQuadtreeCoordinate(newx);
            var newyc = getQuadtreeCoordinate(newy);
            moveQuadtreeObjectCoordinates(element, oldxc, oldyc, newxc, newyc);

            var startx = getQuadtreeCoordinate(newx - bounds.w);
            var endx = getQuadtreeCoordinate(newx + bounds.w);
            var starty = getQuadtreeCoordinate(newy - bounds.h);
            var endy = getQuadtreeCoordinate(newy + bounds.h);
            if (oldxc != newxc || oldyc != newyc) {
                for (var i = startx; i <= endx; i++) {
                    for (var j = starty; j <= endy; j++) {
                        moveQuadtreeObjectCoordinatesIfDifferent(element, oldxc, oldyc, newxc, newyc, oldxc + (i - newxc), oldyc + (j - newyc), i, j);
                    }
                }
            }
        }
    }
    var moveQuadtreeObjectPosition = function (element, oldx, oldy, newx, newy) {
        var oldxc = getQuadtreeCoordinate(oldx);
        var oldyc = getQuadtreeCoordinate(oldy);
        var newxc = getQuadtreeCoordinate(newx);
        var newyc = getQuadtreeCoordinate(newy);
        if (oldxc == newxc && oldyc == newyc) {
            return;
        }
        removeQuadtree(oldxc, oldyc, element);
        addQuadtree(newxc, newyc, element);
    }
    var moveQuadtreeObjectCoordinates = function (element, oldxc, oldyc, newxc, newyc) {
        if (oldxc == newxc && oldyc == newyc) {
            return;
        }
        removeQuadtree(oldxc, oldyc, element);
        addQuadtree(newxc, newyc, element);
    }
    var moveQuadtreeObjectPositionIfDifferent = function (element, oldxc1, oldyc1, newxc1, newyc1, oldx, oldy, newx, newy) {
        var oldxc = getQuadtreeCoordinate(oldx);
        var oldyc = getQuadtreeCoordinate(oldy);
        var newxc = getQuadtreeCoordinate(newx);
        var newyc = getQuadtreeCoordinate(newy);
        if (oldxc == newxc && oldyc == newyc) {
            return;
        }
        if (oldxc != oldxc1 || oldyc != oldyc1) {
            removeQuadtree(oldxc, oldyc, element);
        }
        if (newxc != newxc1 || newyc != newyc1) {
            addQuadtree(newxc, newyc, element);
        }
    }
    var moveQuadtreeObjectCoordinatesIfDifferent = function (element, oldxc1, oldyc1, newxc1, newyc1, oldxc, oldyc, newxc, newyc) {
        if (oldxc != oldxc1 || oldyc != oldyc1) {
            removeQuadtree(oldxc, oldyc, element);
        }
        if (newxc != newxc1 || newyc != newyc1) {
            addQuadtree(newxc, newyc, element);
        }
    }
    //Objects that might be seen by the camera
    var objectsInScope = [];
    //Static objects are always shown
    var staticObjects = [];
    function updateScope(x, y) {
        //        1   |      2      |     3
        //            |             |
        //----------------------------------------
        //            |             |
        //        4   |      5      |     6
        //            |   (camera)  |
        //----------------------------------------
        //            |             |
        //        7   |      8      |     8
        var area1 = readQuadtree(getQuadtreeCoordinate(x) - 1, getQuadtreeCoordinate(y) - 1) || [];
        var area2 = readQuadtree(getQuadtreeCoordinate(x), getQuadtreeCoordinate(y) - 1) || [];
        var area3 = readQuadtree(getQuadtreeCoordinate(x) + 1, getQuadtreeCoordinate(y) - 1) || [];
        var area4 = readQuadtree(getQuadtreeCoordinate(x) - 1, getQuadtreeCoordinate(y)) || [];
        var area5 = readQuadtree(getQuadtreeCoordinate(x), getQuadtreeCoordinate(y)) || [];
        var area6 = readQuadtree(getQuadtreeCoordinate(x) + 1, getQuadtreeCoordinate(y)) || [];
        var area7 = readQuadtree(getQuadtreeCoordinate(x) - 1, getQuadtreeCoordinate(y) + 1) || [];
        var area8 = readQuadtree(getQuadtreeCoordinate(x), getQuadtreeCoordinate(y) + 1) || [];
        var area9 = readQuadtree(getQuadtreeCoordinate(x) + 1, getQuadtreeCoordinate(y) + 1) || [];
        objectsInScope = [].concatUnique(area1).concatUnique(area2).concatUnique(area3).concatUnique(area4).concatUnique(area5).concatUnique(area6).concatUnique(area7).concatUnique(area8).concatUnique(area9).concatUnique(staticObjects);
    }
    Object.defineProperty(Array.prototype, 'concatUnique', {
        value: function (b) {
            for (i = 0; i < b.length; i++) {
                if (this.indexOf(b[i]) < 0) {
                    this.push(b[i]);
                }
            }
            return this;
        },
        configurable: true
    });
    var zIndexNeedsSorting = false;

    function getObjectBounds(object) {
        var bounds = {
            w: 0, h: 0
        };
        var spritesheet = object.spritesheet;
        for (var i in spritesheet.frames) {
            var frame = spritesheet.frames[i];
            //If it is a full texture frame, set the appropiate w.h
            if (frame.fullTexture) {
                var img = object.img || spritesheet.img;
                frame.w = img.width;
                frame.h = img.height;
            }
            //Maybe the image must be flipped in some axis, we are going to make the worst assumption
            if (frame.code == undefined) {
                if (bounds.w < frame.w) {
                    bounds.w = frame.w;
                }
                if (bounds.h < frame.h) {
                    bounds.h = frame.h;
                }
            }
        }
        return bounds;
    }


    //And these are the public functions that the engine will use to talk to your library
    return {
        setUp: function (mycanvas, nfps) {
            //This function receives a reference to a canvaselement and the number of fps requested
            canvas = mycanvas;
            realcontext = canvas.getContext('2d');
            //We loop renderprocess and renderdraw
            intervalholder = window.setInterval(renderprocess, Math.round(1000 / nfps));
            requestAnimationFrame(function renderdrawrequest() { renderdraw(); requestAnimationFrame(renderdrawrequest) });
            fps = nfps;
        },
        pauseAll: function () {
            window.clearInterval(intervalholder);
        },
        restart: function () {
            intervalholder = window.setInterval(renderprocess, Math.round(1000 / nfps));
        },
        setCamera: function (x, y, z) {
            if (camera.x == x && camera.y == y) {
                return;
            }
            camera.x = x;
            camera.y = y;
            updateScope(x + buffer_w / 2, y + buffer_h / 2);
        },
        getCamera: function () {
            return { x: camera.x, y: camera.y };
        },
        moveCameraX: function (x) {
            camera.x += x;
            updateScope(camera.x + buffer_w / 2, camera.y + buffer_h / 2);
        },
        moveCameraY: function (y) {
            camera.y += y;
            updateScope(camera.x + buffer_w / 2, camera.y + buffer_h / 2);
        },
        moveCameraZ: function (z) {
            //In this library this has no meaning so it does nothing
        },
        loadSpritesheetJSONObject: function (newspritesheets) {
            spritesheets = spritesheets.concat(newspritesheets.map(function (s) {

                var newspritesheet = new spritesheet();
                newspritesheet.name = s.name;
                if (s.src != undefined) {
                    newspritesheet.img = new Image()
                    if (workingFolder) {
                        newspritesheet.img.src = (workingFolder + "/" + s.src);
                    } else {
                        newspritesheet.img.src = s.src;
                    }
                }
                for (var name in s.frames) {
                    var f = s.frames[name];
                    var newframe = new frame();
                    newframe.name = name;
                    if (f.code) {
                        newframe.code = new Function("x", "y", "t", "context", "vars", f.code);
                    } else {
                        if (f.fullTexture) {
                            newframe.fullTexture = true;
                        } else {
                            newframe.x = f.x;
                            newframe.y = f.y;
                            newframe.w = f.w;
                            newframe.h = f.h;
                            newframe.t = f.t;
                        }
                    }
                    newspritesheet.frames.push(newframe);
                }
                for (var name in s.layers) {
                    var l = s.layers[name];
                    var newlayer = new layer();
                    newlayer.name = name;
                    newlayer.x = new Function("t", "vars", "return " + l.x);
                    newlayer.y = new Function("t", "vars", "return " + l.y);
                    newlayer.frames = l.frames.map(function (x) {
                        return findwhere(newspritesheet.frames, "name", x);
                    });
                    newlayer.t = getlayerduration(newlayer, newspritesheet);
                    newspritesheet.layers.push(newlayer);
                }
                for (var name in s.states) {
                    var st = s.states[name];
                    var newstate = new state();
                    newstate.name = name;
                    newstate.totalduration = 0;
                    newstate.layers = st.layers.map(function (x) {
                        var thislayer = findwhere(newspritesheet.layers, "name", x);
                        return thislayer;
                    });
                    switch (st.flip) {
                        case "h":
                            newstate.flip = 1;
                            break;
                        case "v":
                            newstate.flip = 2;
                            break;
                        case "hv":
                            newstate.flip = 3;
                            break;
                        case "vh":
                            newstate.flip = 3;
                            break;
                        default:
                            newstate.flip = 0;
                            break;
                    }
                    newspritesheet.states.push(newstate);
                }
                return newspritesheet;
            }));
        },
        addObject: function (spritesheet, state, x, y, z, isstatic) {
            var object = { vars: {}, spritesheetName: spritesheet, stateName: state, x: x, y: y, t: 0, zindex: z || 0, isstatic: isstatic || false, hiddenLayers: {} };
            updateObjectState(object);
            object.bounds = getObjectBounds(object);
            objects.push(object);
            var index = objects.length - 1;
            if (object.isstatic) {
                staticObjects.push(index);
            } else {
                moveQuadtreeObject(index, NaN, NaN, x, y);
            }
            updateScope(camera.x + buffer_w / 2, camera.y + buffer_h / 2);
            zIndexNeedsSorting = true;
            return index;
        },
        deleteObject: function (id) {
            objects[id] = null;
            zIndexNeedsSorting = true;
        },
        clear: function () {
            objects = [];
            objectsInScope = [];
        },
        pause: function (id) {
            objects[id].pause = true;
        },
        unpause: function (id) {
            objects[id].pause = false;
        },
        setX: function (id, x) {
            if (!objects[id].isstatic) {
                moveQuadtreeObject(id, objects[id].x, objects[id].y, x, objects[id].y);
            }
            objects[id].x = x;
        },
        setY: function (id, y) {
            if (!objects[id].isstatic) {
                moveQuadtreeObject(id, objects[id].x, objects[id].y, objects[id].x, y);
            }
            objects[id].y = y;
        },
        setZ: function (id, z) {
            if (objects[id].zindex != z) {
                objects[id].zindex = z;
                zIndexNeedsSorting = true;
            }
        },
        setParameter: function (id, key, value) {
            objects[id].vars[key] = value;
        },
        setState: function (id, state) {
            if (objects[id].stateName != state) {
                objects[id].stateName = state;
                updateObjectState(objects[id]);
                var temp = objects[id].t;
                objects[id].t = 0;
                return temp;
            }
            return NaN;
        },
        setSpritesheet: function (id, s) {
            objects[id].spritesheetName = s;
            updateObjectState(objects[id]);
        },
        sendCommand: function (command, commandArgs) {
            switch (command) {
                case "setImage":
                    objects[commandArgs.id].img = commandArgs.img;
                    break;
                case "addObjectBatched":
                    var object = { vars: {}, spritesheetName: commandArgs.spritesheet, stateName: commandArgs.state, x: commandArgs.x, y: commandArgs.y, t: 0, zindex: commandArgs.z || 0, isstatic: commandArgs.isstatic || false, hiddenLayers: {} };
                    updateObjectState(object);
                    object.bounds = getObjectBounds(object);
                    objects.push(object);
                    var index = objects.length - 1;
                    if (object.isstatic) {
                        staticObjects.push(index);
                    } else {
                        moveQuadtreeObject(index, NaN, NaN, x, y);
                    }
                    return index;
                case "endObjectBatch":
                    updateScope(camera.x + buffer_w / 2, camera.y + buffer_h / 2);
                    zIndexNeedsSorting = true;
                    break;
                case "showLayer":
                    objects[commandArgs.id].hiddenLayers[commandArgs.layer] = undefined;
                    break;
                case "hideLayer":
                    objects[commandArgs.id].hiddenLayers[commandArgs.layer] = true;
                    break;
            }
            //This function sends a command to your library, you can use this an extension point to provide additional functionality
        },
        setObjectTimer: function (id, t) {
            objects[id].t = t;
        },
        getObjectTimer: function (id) {
            return objects[id].t;
        },
        setEndedCallback: function (id, callback) {
            objects[id].callback = callback;
        },
        setRenderMode: function (mode) {
            rendermode = mode;
        },
        setBufferSize: function (w, h) {
            buffer_w = w;
            buffer_h = h;
            buffercanvas.width = w;
            buffercanvas.height = h;
            quadtreeWidth = buffercanvas.width / 2;
            quadtreeHeight = buffercanvas.height / 2;
        },
        getContext: function () {
            return context;
        },
        chainWith: function (renderingLibrary) {
            if (debugMode) {
                debugHandler("Spritesheet.js does not support chaining to another rendering library");
            }
            //Chains to an instance of another rendering library, used in 'proxy' libraries (for recording, networking, perspective...)
        },
        getSpriteBox: function (spritesheet, animationstate) {
            var minX, maxX, minY, maxY;
            var spritesheet = searchWhere(spritesheets, "name", spritesheet);
            var state = spritesheet.states[0];
            if (animationstate != undefined) {
                state = searchWhere(spritesheet.states, "name", animationstate);
            }
            //We loop over the layers of its current state
            for (var i in state.layers) {
                var layer_n = state.layers[i];
                var layer = spritesheet.layers[layer_n];
                var t = 0;
                for (var j in layer.frames) {
                    var frame = spritesheet.frames[layer.frames[j]];
                    var startX = layer.x(t);
                    var startY = layer.y(t);
                    if (startX < minX || minX == undefined) {
                        minX = startX;
                    }
                    if (startY < minY || minY == undefined) {
                        minY = startY;
                    }
                    if (frame.w > maxX || maxX == undefined) {
                        maxX = frame.w;
                    }
                    if (frame.h > maxY || maxY == undefined) {
                        maxY = frame.h;
                    }
                    t += frame.t;
                }
            }
            return { x: minX || 0, y: minY || 0, w: maxX || 100, h: maxY || 100 };
        },
        debug: function (handler) {
            debugMode = true;
            debugHandler = handler;
        },
        setWorkingFolder: function (folder) {
            workingFolder = folder;
        },
        getWorkingFolder: function () {
            return workingFolder;
        }
    };
});