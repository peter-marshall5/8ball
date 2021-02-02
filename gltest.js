tmpCanvas = document.createElement("canvas");
tmpGl = tmpCanvas.getContext("webgl") || tmpCanvas.getContext("experimental-webgl");
if(tmpGl && tmpGl instanceof WebGLRenderingContext) {
    navigator.hasWebGL = true;
}else{
    navigator.hasWebGL = false;
}
delete tmpCanvas;
delete tmpGl;