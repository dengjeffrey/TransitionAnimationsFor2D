/*
* Simple 2D Entrance Animations
* Readily made animatable objects to be extended by any 
* object with an x and y coordinate, width and height
*
* Simply extend AnimatableShape to use the animations
* provided, or add to it!
*
* Jan. 27, 2015
* Jeffrey Deng 
* jeffreydeng.com
*/

//////////////////////////////////////////////////////
// GLOBAL CONSTANTS
//////////////////////////////////////////////////////

// To assure all animations run smoothly, 60fps is required
var FRAME_RATE = 60;
frameRate(FRAME_RATE);

var MILLISECONDS_IN_SECOND = 1000;

//////////////////////////////////////////////////////
// HELPER OBJECTS
//////////////////////////////////////////////////////

// Animation
/**
Container for animations, holding the necessary properties
@param {double} duration     - Duration of the animation.
@param {double} startTime    - Start time of the animation.
@param {double} destinationX - final X value of animating property. (width, X, etc.)
@param {double} destinatioY  - final Y value of animating property. (height, Y, etc.)
@param {double} startX       - starting X value of animating property. (width, X, etc.)
@param {double} startY       - starting Y value of animating property. (height, Y, etc.)
*/

var Animation = function(duration, startTime, destinationX, destinationY, startX, startY) {
    this.animDuration = duration;
    this.animDestinationX = destinationX;
    this.animDestinationY = destinationY;
    this.animStartX = startX;
    this.animStartY = startY;
    this.animStartTime = startTime;
    this.isAnimating = false;
    
    this.animDistanceX = destinationX - startX;
    this.animDistanceY = destinationY - startY;
};

// AnimatableShape
/**
An object that has a (x, y) coordinate, width, and height
with the ability to perform arithmetic operations on it's property
to create animations.

@param {int} x           - X position of the shape.
@param {int} y           - Y position of the shape.
@param {int} shapeWidth  - Width of the shape.
@param {int} shapeHeight - Height of the shape.
*/
var AnimatableShape = function(x, y, shapeWidth, shapeHeight) {
    this.x = x;
    this.y = y;
    
    this.width = shapeWidth;
    this.height = shapeHeight;
    
    this.animationTween = new Animation(0, millis(), x, y, x, y);
    this.animationStretch = new Animation(0, millis(), width, height, width, height);
    this.animationShrink = new Animation(0, millis(), width, height, width, height);
};

/**
Tweens the shape to a destination within number of seconds.
@param {int} finalX      - X position where the shape stops animating.
@param {int} finalY      - Y position where the shape stops animating.
@param {double} duration - Number of seconds till the animation has finished.
*/
AnimatableShape.prototype.tween = function(finalX, finalY, duration) {
    
    var startPos = PVector(this.x, this.y);
    var finalPos = PVector(finalX, finalY);
    
    this.animationTween = new Animation(duration, millis(), finalX, finalY, this.x, this.y);
    this.animationTween.isAnimating = true;
};

/**
Stretches the shape to a given scale then shrinks back to the original size
in succession.
@param {double} maxScale - Maximum scale of the shape to stretch to.
@param {double} duration - Number of seconds till the animation has finished.
*/
AnimatableShape.prototype.stretchIn = function(maxScale, duration) {

    if (maxScale < 1.0){
        maxScale = 1;
    }
    
    var totalScaleChange = (maxScale + maxScale - 1);
    var durationOfStretch = (maxScale/ totalScaleChange) * duration;
    
    // Animation for stretching to 'maxScale' of the shape
    this.animationStretch = new Animation(durationOfStretch, 
                                                   millis(), 
                                                   maxScale * this.width,  
                                                   maxScale* this.height, 
                                                   0, 
                                                   0);
    this.animationStretch.isAnimating = true;
    
    // Animation for shrinking to the original size of the shap 
    this.animationShrink = new Animation(duration - durationOfStretch, 
                                        millis(), 
                                        this.width, 
                                        this.height, 
                                        maxScale * this.width, 
                                        maxScale* this.height);
};

/**
Applies a quadratic function to represent a distance and provides a vector based on time passed 
and given duration
 
@param {double} time - Time passed in same format as duration.
@param {double} duration - Time alloted to cover the distance.
@param {double} distance - Magnitude of change.
@param {double} positon  - Initial starting position.

@return {double} position represented by a quadratic equation based on time passed and 
given duration 
*/
AnimatableShape.prototype.calculateEaseIn = function(time, duration, distance, position) {
    
    // Percentage of animation completion
    var percentage = time/duration;
    
    if (percentage > 1) {
        percentage = 1;
    }

    return position + distance * Math.pow(percentage, 2);
};

/**
Applies a quadratic function to represent a distance and provides a vector based on time passed and given duration
 
@param {double} time - Time passed in same format as duration.
@param {double} duration - Time alloted to cover the distance.
@param {double} distance - Magnitude of change.
@param {double} positon  - Initial starting position.

@return {double} position represented by a quadratic equation based on time passed and given duration 
*/
AnimatableShape.prototype.calculateEaseOut = function(time, duration, distance, position) {
    
    // Percentage of animation completion
    var percentage = time/duration;
    
    if (percentage > 1) {
        percentage = 1;
    }
    
    return position + (-1 * distance * percentage * (percentage - 2));
};

/*
Applies the necessary changes for animation based on the shapes acceleration, velocity, and scale factor
*/
AnimatableShape.prototype.draw = function() {
    
    if (this.animationTween.isAnimating){   
        
        var timePassed = (millis() / MILLISECONDS_IN_SECOND) - 
                         (this.animationTween.animStartTime / MILLISECONDS_IN_SECOND);
        
        this.y = this.calculateEaseOut(timePassed, 
                                       this.animationTween.animDuration, 
                                       this.animationTween.animDistanceY, 
                                       this.animationTween.animStartY);
                                       
        this.x = this.calculateEaseOut(timePassed, 
                                       this.animationTween.animDuration, 
                                       this.animationTween.animDistanceX, 
                                       this.animationTween.animStartX);

     
        // If time is up, let's stop
        if (timePassed > this.animationTween.animDuration) { 
            this.animationTween.isAnimating = false;
        }
    }

    
    if (this.animationStretch.isAnimating){
       
        var timePassed = (millis() / MILLISECONDS_IN_SECOND) - 
                         (this.animationStretch.animStartTime / MILLISECONDS_IN_SECOND);
        
        this.width = this.calculateEaseOut(timePassed, 
                                       this.animationStretch.animDuration, 
                                       this.animationStretch.animDistanceY, 
                                       this.animationStretch.animStartY);
                                       
        this.height = this.calculateEaseOut(timePassed, 
                                       this.animationStretch.animDuration, 
                                       this.animationStretch.animDistanceX, 
                                       this.animationStretch.animStartX);

     
        // If time is up, let's stop and shrink back to original
        if (timePassed > this.animationStretch.animDuration) { 
            this.animationStretch.isAnimating = false;
            
            this.animationShrink.animStartTime = millis();
            this.animationShrink.isAnimating = true;
        }
    }
    
    if (this.animationShrink.isAnimating){
        
        var timePassed = (millis() / MILLISECONDS_IN_SECOND) - 
                         (this.animationShrink.animStartTime / MILLISECONDS_IN_SECOND);
        
        this.width = this.calculateEaseIn(timePassed, 
                                       this.animationShrink.animDuration, 
                                       this.animationShrink.animDistanceY, 
                                       this.animationShrink.animStartY);
                                       
        this.height = this.calculateEaseIn(timePassed, 
                                       this.animationShrink.animDuration, 
                                       this.animationShrink.animDistanceX, 
                                       this.animationShrink.animStartX);
     
        if (timePassed > this.animationShrink.animDuration) { 
            this.animationShrink.isAnimating = false;
        }
    }
};

// Animatable Ellipse
// See ellipse(x, y, w, h)
var AnimatableEllipse = function(x, y, w, h) {
    AnimatableShape.call(this, x, y, w, h);
};

// Inherit from AnimatableShape
AnimatableEllipse.prototype = Object.create(AnimatableShape.prototype);

AnimatableEllipse.prototype.draw = function() {
    
    // Include this method in all custom Animatable objects
    // This will call the super class' draw method
    // Calculates the position of this object for the next frame based on the animations it is running
    AnimatableShape.prototype.draw.call(this); 
    
    ellipse(this.x, this.y, this.width, this.height);
};

// Button
/**
Object for custom buttons
@param config 
@config x                - Top left x position of button
@config y                - Top left y position of button
@config width            - Width of button
@config height           - Height of button
@config radius           - Button's corner radius
@config backgroundColour - Background colour of button
@config strokeColour     - Stroke colour displayed on button
@config textColour       - Text colour displayed on button                
@config onClick()        - Function block to execute when button has been pressed
@config label            - Button title
*/
var Button = function(config) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 150;
    this.height = config.height || 50;
    this.radius = config.radius || 5;
    this.label = config.label || "Button";
    this.onClick = config.onClick || function() {};
    this.backgroundColour = config.backgroundColour || [255, 255, 255];
    this.textColour = config.textColour || [0, 0, 0];
    this.strokeColour = config.strokeColour || [255, 255, 255];
    
    this.isEnabled = true;
};

Button.prototype.draw = function() {
    stroke(this.strokeColour[0], this.strokeColour[1], this.strokeColour[2]);
    fill(this.backgroundColour[0], this.backgroundColour[1], this.backgroundColour[2]);
    rect(this.x, this.y, this.width, this.height, this.radius);
    fill(this.textColour[0], this.textColour[1], this.textColour[2]);
    textSize(19);
    textAlign(LEFT, TOP);
    text(this.label, this.x+10, this.y+this.height/4);
};

// Handles mouse location relative to Button
/**
@return {Boolean} Whether the mouse is within Button bounds
*/
Button.prototype.isMouseInside = function() {
    return mouseX > this.x &&
           mouseX < (this.x + this.width) &&
           mouseY > this.y &&
           mouseY < (this.y + this.height);
};

Button.prototype.handleMouseClick = function() {
    if (this.isMouseInside() && this.isEnabled) {
        this.onClick();
    }
};

// Text Field
/**
Object for custom text fields
@param config 
@config x                   Top left x position
@config y                   Top left y position
@config width               Width of field
@config height              Height of field
@config backgroundColour    Background colour of field
@config strokeColour        Stroke colour displayed on field
@config textColour          Text colour displayed on field 
@config value               Default value of text field
*/
var TextField = function(config) {
    Button.call(this, config);
    
    this.isActive = false;
    this.isBlack = false;
    this.maxChar = config.maxChars || 10;
    this.value = config.value || "";
    this.numChar = this.value.length;
};

// Inherit from button
TextField.prototype = Object.create(Button.prototype);

TextField.prototype.draw = function() {
    
    // Constants
    var BLINK_RATE = FRAME_RATE*0.5;
    var CHARACTER_WIDTH = 11;
    var BLINKER_PADDING = 5;
    var DESCRIPTION_LABEL_PADDING = 0;
    
    // Text Field
    stroke(this.strokeColour[0], this.strokeColour[1], this.strokeColour[2]);
    fill(this.backgroundColour[0], this.backgroundColour[1], this.backgroundColour[2]);
    rect(this.x, this.y, this.width, this.height, this.radius);
    fill(this.textColour[0], this.textColour[1], this.textColour[2]);
    
    // Text Description Label
    textSize(19);
    textAlign(LEFT, TOP);
    text(this.label, 
         this.x + DESCRIPTION_LABEL_PADDING, 
        this.y - this.height - DESCRIPTION_LABEL_PADDING);
    
    // Text Content
    textSize(19);
    textAlign(LEFT, TOP);
    text(this.value, this.x + BLINKER_PADDING, this.y + BLINKER_PADDING);
    
    // Toggle blinker
    if (this.isActive && frameCount % BLINK_RATE === 0){
        if (this.isBlack) {
            this.isBlack = false;
        } else {
           this.isBlack = true;
        }
    }
    
    if (this.isActive) {
        
        // set blinker to the same colour as background
        fill(this.backgroundColour[0], this.backgroundColour[1], this.backgroundColour[2]);
        stroke(this.backgroundColour[0], this.backgroundColour[1], this.backgroundColour[2]);
        
        // Or black
        if (this.isBlack) {
            fill(0, 0, 0);
            stroke(0, 0, 0, 0);
        }
        
        rect(this.x + BLINKER_PADDING + this.numChar * CHARACTER_WIDTH, 
             this.y + this.height * 0.25, 
             2, 
             this.height * 0.5);
    }
};

TextField.prototype.handleMouseClick = function() {
    
    if (this.isMouseInside() && this.isEnabled) {
        // Allow key input
        this.isActive = true;
    }else if (this.isActive) {
        // Resign key responder
        this.isActive = false;
    }
};

TextField.prototype.handleKeyPressed = function() {
    
    var KEY_0 = 48;
    var KEY_9 = 57;
    var KEY_DOT = 46;
    
    // Handle backspace
    if ((keyCode === DELETE || keyCode === BACKSPACE) && this.isActive && this.numChar > 0) {

        this.numChar --;
        this.value = this.value.substring(0, this.numChar); 

    }
    // Handle all characters except special keys, and letters
    else if (this.numChar < this.maxChar && this.isActive && (key >= KEY_DOT && key <= KEY_9)) {
        this.numChar ++;
        this.value = this.value + String.fromCharCode(key);
    } 
};

//////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////

var animatingEllipse = new AnimatableEllipse(width * 0.5, 0, 20, 20);
var sceneNumber = 1;

var initAnimation = function(){};
var setScene = function(scene){};

// UI Elements
// Final X text field
var TEXT_FIELD_WIDTH = 70;
var TEXT_FIELD_HEIGHT = 30;
var TEXT_FIELD_PADDING = 10;
var xTextField = new TextField({
    x: width / 4 - TEXT_FIELD_WIDTH / 2,
    y: height - TEXT_FIELD_HEIGHT - TEXT_FIELD_PADDING,
    width: TEXT_FIELD_WIDTH,
    height: TEXT_FIELD_HEIGHT,
    label: "Final x",
    strokeColour: [0, 0, 0],
    maxChars: 5,
    value: "200"
});

// Final Y text field
var yTextField = new TextField({
    x: (width / 2) - TEXT_FIELD_WIDTH / 2,
    y: height - TEXT_FIELD_HEIGHT - TEXT_FIELD_PADDING,
    width: TEXT_FIELD_WIDTH,
    height: TEXT_FIELD_HEIGHT,
    label: "Final y",
    strokeColour: [0, 0, 0],
    maxChars: 5,
    value: "200"
});

// Duration text field
var durationTextField = new TextField({
    x: 3*(width / 4) - TEXT_FIELD_WIDTH / 2,
    y: height - TEXT_FIELD_HEIGHT - TEXT_FIELD_PADDING,
    width: TEXT_FIELD_WIDTH,
    height: TEXT_FIELD_HEIGHT,
    label: "Duration",
    strokeColour: [0, 0, 0],
    maxChars: 5,
    value: "0.5"
});

// Scale text field
var scaleTextField = new TextField({
    x: 1*(width / 4) - TEXT_FIELD_WIDTH / 2,
    y: height - TEXT_FIELD_HEIGHT - TEXT_FIELD_PADDING,
    width: TEXT_FIELD_WIDTH,
    height: TEXT_FIELD_HEIGHT,
    label: "Scale",
    strokeColour: [0, 0, 0],
    maxChars: 5,
    value: "1.5"
});

// Reset Button
var RESET_BTTN_WIDTH = 70;
var RESET_BTTN_HEIGHT = 30;
var RESET_BTTN_PADDING = 10;
var resetButton = new Button({
    x: width - RESET_BTTN_WIDTH - RESET_BTTN_PADDING,
    y: RESET_BTTN_PADDING,
    width: RESET_BTTN_WIDTH,
    height: RESET_BTTN_HEIGHT,
    label: "Replay",
    onClick: function() {
        // Redo animation from beginning state
        initAnimation();
    }
});

// Tween Button
var BTTN_WIDTH = 70;
var BTTN_HEIGHT = 30;
var BTTN_PADDING = 10;
var tweenButton = new Button({
    x: width - BTTN_WIDTH - BTTN_PADDING,
    y: 100,
    width: BTTN_WIDTH,
    height: BTTN_HEIGHT,
    label: "Tween",
    onClick: function() {
        // Redo animation from beginning state
        setScene(1);
    }
});

// Growth Button
var growthButton = new Button({
    x: width - BTTN_WIDTH - BTTN_PADDING,
    y: tweenButton.y + tweenButton.height + BTTN_PADDING,
    width: BTTN_WIDTH,
    height: BTTN_HEIGHT,
    label: "Growth",
    onClick: function() {
        // Redo animation from beginning state
        setScene(2);
    }
});

// Interaction handlers
mouseClicked = function() {
    
    resetButton.handleMouseClick();
    tweenButton.handleMouseClick();
    growthButton.handleMouseClick();
    
    xTextField.handleMouseClick();
    yTextField.handleMouseClick();
    
    durationTextField.handleMouseClick();
    scaleTextField.handleMouseClick();
};

keyPressed = function() {
    
    xTextField.handleKeyPressed();
    yTextField.handleKeyPressed();
    
    durationTextField.handleKeyPressed();
    scaleTextField.handleKeyPressed();
};

// Draw events
var drawUI = function() {
    
    resetButton.draw();
    tweenButton.draw();
    growthButton.draw();
    
    if (sceneNumber === 1) {
    
        xTextField.draw();
        xTextField.isEnabled = true;
        
        yTextField.draw();
        yTextField.isEnabled = true;
        
        durationTextField.draw();

        scaleTextField.isEnabled = false;

    } else if (sceneNumber === 2) {
        
        durationTextField.draw();
        scaleTextField.draw();
        scaleTextField.isEnabled = true;
        
        xTextField.isEnabled = false;
        xTextField.isEnabled = false;
    }
};

// Others
setScene = function(scene) {
    sceneNumber = scene;
    
    if (scene === 1) {
        tweenButton.textColour = [0, 200, 0]; 
        growthButton.textColour = [0, 0, 0];
        initAnimation();
    } else if (scene === 2) {
        growthButton.textColour = [0, 200, 0];
        tweenButton.textColour = [0, 0, 0]; 
        initAnimation();
    }
};


// Screen initializations
initAnimation = function() {

    if (sceneNumber === 1) {
        
        // Place ellipse
        animatingEllipse.x = width * 0.5;
        animatingEllipse.y = 0;
    
        var xInput = parseInt(xTextField.value, null); 
        var yInput = parseInt(yTextField.value, null);
        var durationInput = parseFloat(durationTextField.value);
    
        // Initiate Tween animation for ellipse
        animatingEllipse.tween(xInput, 
                               yInput, 
                               durationInput,
                               FRAME_RATE);
       
    } else if (sceneNumber === 2) {
        
        animatingEllipse.x = width * 0.5;
        animatingEllipse.y = height * 0.5;
        
        var scaleInput = parseFloat(scaleTextField.value);
        var durationInput = parseFloat(durationTextField.value);
        
        // Disallow scale < 1
        if (scaleInput < 1) {
            scaleTextField.value = "1";
            scaleInput = 1;
        }
        
        // Initiate stretch in animation for ellipse
        animatingEllipse.stretchIn(scaleInput, durationInput, FRAME_RATE);
    }
};

// Runtime
setScene(1);
drawUI();

// Draws to screen during runtime
draw = function() {
    background(255, 255, 255);
    
    // Circle
    stroke(242, 80, 80);
    fill(242, 80, 80);
    animatingEllipse.draw();
    
     // Draw UI
    drawUI();
};
