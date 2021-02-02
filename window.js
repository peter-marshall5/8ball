cwidth = 300;
cheight = 300;
twidth = 512;
theight = 512;
fontSize = twidth * 0.11764705882352941;
clearColor = 0x000000;
lightColor = 0xffffff;
textColor = "lightgray";
radius = 60;
cameraOpts = {
    angle: 30,
    aspect: cwidth / cheight,
    near: 0.1,
    far: 10000
}
rendererType = navigator.hasWebGL ? "WebGL" : "Canvas";
container = document.querySelector("#view");
renderer = new THREE[rendererType + "Renderer"]({antialias: true});
camera = new THREE.PerspectiveCamera(
    cameraOpts.angle,
    cameraOpts.aspect,
    cameraOpts.near,
    cameraOpts.far
);
scene = new THREE.Scene();
scene.add(camera);
pointLight = new THREE.PointLight(lightColor);
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;
geometry = new THREE.IcosahedronGeometry(radius);
geometry.faceVertexUvs[0] = [];
for(var i=0;i<geometry.faces.length;i++) {
    geometry.faceVertexUvs[0].push([
        new THREE.Vector2(0.5, 0),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(0, 1)
    ]);
    geometry.faces[i].materialIndex = i;
}
messages = [
    {
        message: ["", "It is", "certain"],
        type: 0
    },
    {
        message: ["", "It is", "decidedly", "so"],
        type: 0
    },
    {
        message: ["", "Without a", "doubt"],
        type: 0
    },
    {
        message: ["", "Yes,", "Definately"],
        type: 0
    },
    {
        message: ["", "Rely on", "it"],
        type: 0
    },
    {
        message: ["", "As I see", "it, yes"],
        type: 0
    },
    {
        message: ["", "Most", "likely"],
        type: 0
    },
    {
        message: ["", "Outlook", "good"],
        type: 0
    },
    {
        message: ["", "Yes"],
        type: 0
    },
    {
        message: ["", "Signs point", "to yes"],
        type: 0
    },
    {
        message: ["", "Don't count", "on it"],
        type: 1
    },
    {
        message: ["", "My reply", "is no"],
        type: 1
    },
    {
        message: ["", "My sources", "say no"],
        type: 1
    },
    {
        message: ["", "Outlook", "not so", "good"],
        type: 1
    },
    {
        message: ["", "Very", "doubtful"],
        type: 1
    },
    {
        message: ["", "Reply hazy,", "try again"],
        type: 2
    },
    {
        message: ["", "Ask again", "later"],
        type: 2
    },
    {
        message: ["", "Cannot", "predict", "now"],
        type: 2
    },
    {
        message: ["", "Better not", "tell you", "now"],
        type: 2
    },
    {
        message: ["", "Concentrate", "and ask", "again"],
        type: 2
    }
];
faceAngle = new THREE.Euler(-Math.PI / 10, 0, -Math.PI / 2);
messageFace = 15;
colors = ["#00ff00", "#ff0000", "#0000ff"];
mesh = new THREE.Mesh(geometry);
mesh.rotation.x = faceAngle.x;
mesh.rotation.y = faceAngle.y;
mesh.rotation.z = faceAngle.z;
camera.position.z = 200;
scene.add(pointLight);
scene.add(mesh);
renderer.setSize(cwidth, cheight);
renderer.setClearColor(clearColor);
canvas = document.createElement("canvas");
canvas.width = cwidth;
canvas.height = cheight;
ctx = canvas.getContext("2d");
container.appendChild(canvas);
energy = 1;
deadDate = 0;
startRotation = null;
animationSteps = 0;
animationSpeed = 3.5;
animationX = false;
animationY = false;
animationZ = false;
opacity = 0;
response = 0;
intensity = 1;
glowIntensity = 0;
prevFrame = 0;
fps = 0;
animXStart = 0;
animYStart = 0;
animZStart = 0;
fadeAnimStart = 0;
showMessage(0);
var eightball = document.createElement("img");
eightball.src = "8ball.png";
var fpsGraph = false;
var fpsGraphShading = false;
var fpsGraphHeight = 0.25;
var historyToKeep = 300;
var fpsHistory = new Array(historyToKeep);
var maxFps = 80;
var glowRadius = 0.258;
function render() {
    ctx.clearRect(0, 0, cwidth, cheight);
    var time = performance.now();
    fps = 1 / (time - prevFrame) * 1000;
    prevFrame = time;
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, cwidth / 4 - 20, cheight / 4 - 20, cwidth / 4 * 2 + 40, cheight / 4 * 2 + 40);
    ctx.drawImage(eightball, 0, 0, cwidth, cheight);
    ctx.beginPath();
    ctx.lineWidth = cwidth * 0.01;
    ctx.lineCap = "butt";
    var color = hexToRGB(colors[messages[response].type]);
    var alpha = glowIntensity * 0.6;
    var r = color.r;
    var g = color.g;
    var b = color.b;
    var gradient = ctx.createLinearGradient(0, 0, canvas.width * 0.675, canvas.height * 0.45);
    gradient.addColorStop(0, "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")");
    gradient.addColorStop(0.3, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.6, "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")");
    gradient.addColorStop(0.8, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")");
    ctx.strokeStyle = gradient;
    ctx.arc(cwidth / 2, cheight / 2, cwidth * glowRadius, 0, 2 * Math.PI);
    ctx.stroke();
    if(animationX) animLoopX();
    if(animationY) animLoopY();
    if(animationZ) animLoopZ();
    if(fadeAnimation) fadeLoop();
    if(fadingIn) fadeInLoop();
    if(fadingOut) fadeOutLoop();
    if(!animationX) {
        swayLoop();
    }else{
        rotation = 0;
    }
    fpsHistory.push(fps > maxFps ? maxFps : fps);
    if(fpsHistory.length > historyToKeep) {
        fpsHistory.shift();
    }
    if(fpsGraph) {
        ctx.strokeStyle = "white";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "none";
        ctx.fillStyle = "red";
        ctx.beginPath();
        var spaceUsed = 0;
        var pointDistance = cwidth / fpsHistory.length;
        ctx.moveTo(0, cheight - ((fpsHistory[0] || 0) / maxFps * cheight * fpsGraphHeight));
        for(var i=0;i<fpsHistory.length;i++) {
            ctx.lineTo(spaceUsed, cheight - ((fpsHistory[i] || 0) / maxFps * cheight * fpsGraphHeight));
            ctx.moveTo(spaceUsed, cheight - ((fpsHistory[i] || 0) / maxFps * cheight * fpsGraphHeight));
            spaceUsed += pointDistance;
        }
        ctx.stroke();
        if(fpsGraphShading) {
            spaceUsed = 0;
            ctx.beginPath();
            ctx.moveTo(0, cheight - ((fpsHistory[0] || 0) / maxFps * cheight * fpsGraphHeight));
            for(var i=0;i<fpsHistory.length;i++) {
                ctx.lineTo(spaceUsed, cheight - ((fpsHistory[i] || 0) / maxFps * cheight * fpsGraphHeight));
                spaceUsed += pointDistance;
            }
            ctx.lineTo(cwidth, cheight);
            ctx.lineTo(0, cheight);
        
            ctx.lineTo(0, cheight - ((fpsHistory[0] || 0) / maxFps * cheight * fpsGraphHeight));
            ctx.closePath();
            ctx.fill();
        }
    }
    requestAnimationFrame(render);
}
render();
function addObject(e) {
    mesh = e;
    mesh.position.z = -30;
    scene.add(mesh);
}
function changeTexture(blob) {
    mesh.material = new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load(URL.createObjectURL(blob))});
}
function createTexture(lines, color) {
    var spaceUsed = 0;
    var canvas = document.createElement("canvas");
    canvas.width = twidth;
    canvas.height = theight;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = fontSize + "px Monospace";
    ctx.textAlign = "center";
    ctx.lineWidth = "2px";
    for(var i=0;i<lines.length;i++) {
        ctx.fillStyle = "black";
        ctx.strokeText(lines[i], canvas.width / 2, fontSize + spaceUsed);
        ctx.fillStyle = color;
        ctx.fillText(lines[i], canvas.width / 2, fontSize + spaceUsed);
        spaceUsed += fontSize;
    }
    var texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshBasicMaterial({map: texture, transparent: true, alphaTest: 0.01, opacity: opacity, side: THREE.DoubleSide});
}
function createMaterials(faces, messages, illuminatedFace, illuminationColor) {
    var materials = [];
    var material = null;
    for(var i=0;i<faces;i++) {
        if(i == illuminatedFace) {
            material = createTexture(messages[i].message, illuminationColor);
        }else{
            material = createTexture(messages[i].message, textColor);
        }
        material.side = THREE.DoubleSide;
        materials.push(material);
    }
    return materials;
}
function rearrangeMessages(id) {
    var message = messages[id];
    var messagesClone = messages.slice(0);
    messagesClone[id] = messages[messageFace];
    messagesClone[messageFace] = message;
    return messagesClone;
}
function showMessage(id) {
    var color = hexToRGB(colors[messages[id].type]);
    color = blendColors(color, intensity, {r: 255, g: 255, b: 255});
    color = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
    mesh.material = createMaterials(geometry.faces.length, rearrangeMessages(id), messageFace, color);
    response = id;
}
function setOpacity(val) {
    opacity = val;
    for(var i=0;i<mesh.material.length;i++) {
        mesh.material[i].opacity = val;
    }
}
function setIntensity(val) {
    intensity = val;
    showMessage(response);
}
function setGlowIntensity(val) {
    glowIntensity = val;
    showMessage(response);
}
function hexToRGB(hex) {
    var r = parseInt(hex[1] + hex[2], 16);
    var g = parseInt(hex[3] + hex[4], 16);
    var b = parseInt(hex[5] + hex[6], 16);
    return {r: r, g: g, b: b};
}
function blendColors(color1, percent, color2) {
    var percent2 = 1 - percent;
    var r = color1.r * percent + color2.r * percent2;
    var g = color1.g * percent + color2.g * percent2;
    var b = color1.b* percent + color2.b * percent2;
    return {r: Math.floor(r), g: Math.floor(g), b: Math.floor(b)};
}
function animate(id) {
    setOpacity(0);
    showMessage(id);
    animationSteps = 0;
    animationX = true;
    animationY = true;
    animationZ = true;
    fadeAnimation = true;
    mesh.rotation.x = faceAngle.x - 1;
    mesh.rotation.y = faceAngle.y - 2;
    mesh.rotation.z = faceAngle.z - 0.3;
    glowIntensity = 0;
    fadeIntensity = 0;
    animXStart = animYStart = animZStart = fadeAnimStart = performance.now() / 1000;
}
var animXStart = 0;
var animYStart = 0;
var animZStart = 0;
var animationsEnded = 0;
function animLoopX() {
    var distanceLeft = faceAngle.x - mesh.rotation.x;
    var timePassed = performance.now() / 1000 - animXStart;
    var timeLeft = animationSpeed - timePassed;
    var framesLeft = fps * timeLeft;
    var distance = distanceLeft / Math.abs(framesLeft);
    if(framesLeft < 1) {
        distance = distanceLeft;
        animationX = false;
        animationsEnded++;
        if(animationsEnded > 3) {
            animationsEnded = 0;
            rollEnd();
        }
    }
    mesh.rotation.x += distance;
}
function animLoopY() {
    var distanceLeft = faceAngle.y - mesh.rotation.y;
    var timePassed = performance.now() / 1000 - animYStart;
    var timeLeft = animationSpeed - timePassed;
    var framesLeft = fps * timeLeft;
    var distance = distanceLeft / Math.abs(framesLeft);
    if(framesLeft < 1) {
        distance = distanceLeft;
        animationY = false;
        animationsEnded++;
        if(animationsEnded > 3) {
            animationsEnded = 0;
            rollEnd();
        }
    }
    mesh.rotation.y += distance;
}
function animLoopZ() {
    var distanceLeft = faceAngle.z - mesh.rotation.z;
    var timePassed = performance.now() / 1000 - animZStart;
    var timeLeft = animationSpeed - timePassed;
    var framesLeft = fps * timeLeft;
    var distance = distanceLeft / Math.abs(framesLeft);
    if(framesLeft < 1) {
        distance = distanceLeft;
        animationZ = false;
        animationsEnded++;
        if(animationsEnded > 3) {
            animationsEnded = 0;
            rollEnd();
        }
    }
    mesh.rotation.z += distance;
}
var rotationMin = -0.15;
var rotationMax = 0.15;
var rotationMinSlowdown = -0.1;
var rotationMaxSlowdown = 0.1;
var rotation = 0;
var normalSwaySpeed = 0.03;
var slowSwaySpeed = 0.01;
var swaySpeed = normalSwaySpeed;
var swayingRight = true;
function swayLoop() {
    if(swayingRight) {
        rotation += swaySpeed / fps;
    }else{
        rotation -= swaySpeed / fps;
    }
    if(rotation > rotationMax) {
        swayingRight = false;
    }
    if(rotation < rotationMin) {
        swayingRight = true;
    }
    if(rotation > rotationMaxSlowdown || rotation < rotationMinSlowdown) {
        swaySpeed = slowSwaySpeed;
    }else{
        swaySpeed = normalSwaySpeed;
    }
    mesh.rotation.z = faceAngle.z + rotation;
}
var fadeAnimation = false;
var fadeIntensity = 1;
var fadeInTime = 0.4;
function fadeLoop() {
    var intensityLeft = 1 - fadeIntensity;
    var timePassed = performance.now() / 1000 - fadeAnimStart;
    var timeLeft = animationSpeed - timePassed;
    var framesLeft = fps * timeLeft;
    var intensity = intensityLeft / Math.abs(framesLeft);
    if(framesLeft < 1) {
        intensity = intensityLeft;
        fadeAnimation = false;
        animationsEnded++;
        if(animationsEnded > 3) {
            animationsEnded = 0;
            rollEnd();
        }
    }
    fadeIntensity += intensity;
    glowIntensity = fadeIntensity / fadeInTime - 1;
    setOpacity(fadeIntensity);
}
function fadeInLoop() {
    var intensityLeft = 1 - opacity;
    var timePassed = performance.now() / 1000 - fadeInStart;
    var timeLeft = fadeAnimSpeed - timePassed;
    var framesLeft = fps * timeLeft;
    var intensity = intensityLeft / Math.abs(framesLeft);
    if(framesLeft < 1) {
        intensity = intensityLeft;
        fadingIn = false;
    }
    opacity += intensity;
    setOpacity(opacity);
    glowIntensity = opacity;
}
function fadeOutLoop() {
    var intensityLeft = opacity;
    var timePassed = performance.now() / 1000 - fadeOutStart;
    var timeLeft = fadeAnimSpeed - timePassed;
    var framesLeft = fps * timeLeft;
    var intensity = intensityLeft / Math.abs(framesLeft);
    if(framesLeft < 1) {
        intensity = intensityLeft;
        fadingOut = false;
    }
    opacity -= intensity;
    setOpacity(opacity);
    glowIntensity = opacity;
}
var fadingIn = false;
var fadingOut = false;
var fadeInStart = 0;
var fadeOutStart = 0;
var fadeAnimSpeed = 1;
function fadeIn() {
    clearTimeout(fadeTimeout);
    fadeInStart = performance.now() / 1000;
    fadingIn = true;
}
function fadeOut() {
    clearTimeout(fadeTimeout);
    fadeOutStart = performance.now() / 1000;
    fadingOut = true;
}
var fadeTimeout = 0;
var fadeTime = 45;
function roll(message) {
    rolling = true;
    clearTimeout(fadeTimeout);
    if(typeof message != "number" || message > messages.length - 1) {
        response = Math.floor(Math.random() * 19);
    }else{
        response = message;
    }
    animate(response);
    playSound(1);
    setTimeout(readMessage, soundBuffers[sounds[1]].duration * 1000);
    fadeTimeout = setTimeout(fadeOut, fadeTime * 1000);
}
var sounds = ["back.mp3", "fade.wav", "voice/1.mp3", "voice/2.mp3", "voice/3.mp3", "voice/4.mp3", "voice/5.mp3", "voice/6.mp3", "voice/7.mp3", "voice/8.mp3", "voice/9.mp3", "voice/10.mp3", "voice/11.mp3", "voice/12.mp3", "voice/13.mp3", "voice/14.mp3", "voice/15.mp3", "voice/16.mp3", "voice/17.mp3", "voice/18.mp3", "voice/19.mp3", "voice/20.mp3"];
var soundsLoaded = 0;
var soundBuffers = {};
function loadSounds(callback) {
    var http;
    soundsLoaded = 0;
    for(var i=0;i<sounds.length;i++) {
        http = new XMLHttpRequest();
        http.open("GET", sounds[i]);
        http.responseType = "arraybuffer";
        http.url = sounds[i];
        http.onload = function() {
            var url = this.url;
            audio.decodeAudioData(this.response).then(function(buffer) {
                soundBuffers[url] = buffer;
                soundsLoaded++;
                if(soundsLoaded >= sounds.length) {
                    if(callback) callback();
                }
            });
        }
        http.send();
    }
}
var audio = new AudioContext();
var voiceGain = audio.createGain();
var soundGain = audio.createGain();
var backgroundGain = audio.createGain();
var outputGain = audio.createGain();
voiceGain.connect(outputGain);
soundGain.connect(outputGain);
backgroundGain.connect(outputGain);
outputGain.connect(audio.destination);
backgroundGain.gain.setValueAtTime(2, 0);
soundGain.gain.setValueAtTime(3, 0);
voiceGain.gain.setValueAtTime(0.5, 0);
outputGain.gain.setValueAtTime(4, 0);
function playSound(id) {
    var source = audio.createBufferSource();
    source.buffer = soundBuffers[sounds[id]];
    source.connect(id > 1 ? voiceGain : soundGain);
    source.start(0);
}
loadSounds(function() {
    ready = true;
    var source = audio.createBufferSource();
    source.buffer = soundBuffers[sounds[0]];
    source.loop = true;
    source.connect(backgroundGain);
    source.start(0);
});
function readMessage() {
    playSound(response + 2);
}
var rolling = false;
var ready = false;
function rollHandler() {
    if(rolling || !ready) return;
    if(opacity == 0) {
        roll();
    }else{
        rolling = true;
        fadeOut();
        setTimeout(function() {roll()}, fadeAnimSpeed * 1000);
    }
}
function rollEnd() {
    setTimeout(function() {
        rolling = false;
    }, soundBuffers[sounds[response + 2]].duration * 1000);
}
function setCanvasSize(width, height) {
    canvas.width = cwidth = width;
    canvas.height = cheight = height;
}
function setTextureSize(width, height) {
    twidth = np2(width);
    theight = np2(height);
    fontSize = twidth * 0.11764705882352941;
    renderer.setSize(width, height);
    showMessage(response);
}
function updateSize(width, height) {
    setCanvasSize(width, height);
    setTextureSize(width, height);
}
function changeSize(size) {
    updateSize(size, size);
}
function np2(x) {
    return Math.pow(2, Math.floor(Math.log(x) / Math.log(2)) + 1);
}
window.onclick = rollHandler;
window.onkeydown = function(e) {
    if(e.which == 13 || e.which == 32) {
        rollHandler();
    }
}
window.onresize = function() {
    changeSize(Math.min(window.innerWidth, window.innerHeight));
}
var resizeInterval = setInterval(function() {
    if(window.innerWidth) {
        window.onresize();
        clearInterval(resizeInterval);
    }
}, 0);