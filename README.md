ngrok http 3000 --url https://booted.ngrok.io
Booted - a prank software that overlays a parking enforcement boot on images of parked cars. 

WIP 
currently accessing the webcam 
piping video frames to canvas and calling webgl2 shader files to process edge detection
<img width="637" height="476" alt="Screenshot 2025-11-10 at 4 49 11 PM" src="https://github.com/user-attachments/assets/1f6d88e4-ef5e-4ba6-ac98-6cfb04cb6d30" />


## Here is the workflow

app/page.tsx imports EdgeDetection/index.tsx 
EdgeDetection calls 2 hooks 
- useGetWebCam ->initialized webcam stream - sets isStreaming = true
- useWebGLCanvas -> begins animation loop when isStreaming is true, calls util functions
-
useWebGLCanvas is the entry point for calling util functions that turn the frames into textures and process those with shader files
- initWebGL returns the following 
- 1. 8 shaders are compiled , 1 vertex and 1 fragment per program
- 2. 4 programs are created from each shader -> gaussian blur, gradient, nonmax suppression, and threshold
- 3 . 3 frame buffers for off-screen intermediate rendering and 1 for visible output (threshold)
- 4 . textures allocated for each state
- 5. vertex buffers are created 

after initWebGL returns the above we assign each to a react RefObject
Those ref objects are passed to a utility function called processFrame

processFrame - runs 60fps 
uploads video frame to input texture 
calls renderPass for each of the 4 stages

adds the texture to our webgl canvas context and does a render pass on that texture for each of the programs created in initWebGL 
each fragment shader processes 307,200 pixels in parallel on GPU

final render pass is then visible in canvas 


## coming soon
detect heuristics of a car within the webcam video frame
1. are there 2 circles or elipses on a flat surface?
2. does each circle/elipse have a circle/elipse inside of it and parallel to it?
3. is there a volumetric shape of roughly 1:3 ratio above the circles?
4. is the subject motionless?

once the heuristics are confirmed the video frames can then be sent to an api to process more expensive convultions to match trained data models of cars.
after a successful response from Yolo we then superimpose the 'boot' on the car. 
