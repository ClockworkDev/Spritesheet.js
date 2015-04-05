// Render modes
var SPJS = SPJS || {};

SPJS.renderModes = SPJS.renderModes || {};

//This is the same as the default;
SPJS.renderModes.maxWidth = function (contextinput, contextoutput) {
    contextoutput.clearRect(0, 0, contextoutput.canvas.width, contextoutput.canvas.height);
    //All the width available will be used, the aspect ratio will be the same and the image will be centered vertically
    var xpos = 0;
    var ypos = (contextoutput.canvas.height - contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width) / 2;
    var width=contextoutput.canvas.width;
    var height = (contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width);
    contextoutput.drawImage(contextinput.canvas, xpos, ypos, width, height);
};

SPJS.renderModes.maxHeight = function (contextinput, contextoutput) {
    contextoutput.clearRect(0, 0, contextoutput.canvas.width, contextoutput.canvas.height);
    //All the height available will be used, the aspect ratio will be the same and the image will be centered horizontally
    var xpos = (contextoutput.canvas.width - contextinput.canvas.width * contextoutput.canvas.height / contextinput.canvas.height) / 2;
    var ypos = 0;
    var width = (contextinput.canvas.width * contextoutput.canvas.height / contextinput.canvas.height);
    var height = contextoutput.canvas.height;
    contextoutput.drawImage(contextinput.canvas, xpos, ypos, width, height);
};

SPJS.renderModes.contain = function (contextinput, contextoutput) {
    contextoutput.clearRect(0, 0, contextoutput.canvas.width, contextoutput.canvas.height);
    //All the width available will be used, the aspect ratio will be the same and the image will be centered vertically
    if (contextoutput.canvas.width / contextinput.canvas.width < contextoutput.canvas.height / contextinput.canvas.height) {
        var xpos = 0;
        var ypos = (contextoutput.canvas.height - contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width) / 2;
        var width = contextoutput.canvas.width;
        var height = (contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width);
    } else {
        var xpos = (contextoutput.canvas.width - contextinput.canvas.width * contextoutput.canvas.height / contextinput.canvas.height) / 2;
        var ypos = 0;
        var width = (contextinput.canvas.width * contextoutput.canvas.height / contextinput.canvas.height);
        var height = contextoutput.canvas.height;
    }
    contextoutput.drawImage(contextinput.canvas, xpos, ypos, width, height);
};

SPJS.renderModes.cover = function (contextinput, contextoutput) {
    contextoutput.clearRect(0, 0, contextoutput.canvas.width, contextoutput.canvas.height);
    //All the width available will be used, the aspect ratio will be the same and the image will be centered vertically
    if (contextoutput.canvas.width / contextinput.canvas.width > contextoutput.canvas.height / contextinput.canvas.height) {
        var xpos = 0;
        var ypos = (contextoutput.canvas.height - contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width) / 2;
        var width = contextoutput.canvas.width;
        var height = (contextinput.canvas.height * contextoutput.canvas.width / contextinput.canvas.width);
    } else {
        var xpos = (contextoutput.canvas.width - contextinput.canvas.width * contextoutput.canvas.height / contextinput.canvas.height) / 2;
        var ypos = 0;
        var width = (contextinput.canvas.width * contextoutput.canvas.height / contextinput.canvas.height);
        var height = contextoutput.canvas.height;
    }
    contextoutput.drawImage(contextinput.canvas, xpos, ypos, width, height);
};
