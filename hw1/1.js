function world() {
    "use strict";
    const canvas = document.getElementById('canvas');    
    
    var slider1 = document.getElementById('slider1');
    slider1.value = 512; 
    var slider2 = document.getElementById('slider2');
    slider2.value = 200; 
    var slider3 = document.getElementById('slider3');
    slider3.value = 1000; 
    var slider4 = document.getElementById('slider4');
    slider4.value = 0; 
    
    const base = [
        { x: 0, y: 384, z: 0 },        // Corner 1
        { x: 1024, y: 384, z: 0 },     // Corner 2
        { x: 1024, y: 384, z: -1024 }, // Corner 3
        { x: 0, y: 384, z: -1024 }     // Corner 4    
    ];

    const grid = [
        { x: 1024, y: 384, z: 0 },
        { x: 768, y: 384, z: 0 },
        { x: 768, y: 384, z: -1024 },     
        { x: 512, y: 384, z: -1024 },
        { x: 512, y: 384, z: 0 },     
        { x: 256, y: 384, z: 0 }, 
        { x: 256, y: 384, z: -1024 },  
        { x: 0, y: 384, z: -1024 },      
        { x: 0, y: 384, z: -256 },
        { x: 1024, y: 384, z: -256 },
        { x: 1024, y: 384, z: -512 },
        { x: 0, y: 384, z: -512 },
        { x: 0, y: 384, z: -768 },
        { x: 1024, y: 384, z: -768 }     
    ];

    const cube = [
        { x:   0, y:   0, z:   0 },       
        { x: 300, y:   0, z:   0 },
        { x: 300, y: 300, z:   0 },
        { x:   0, y: 300, z:   0 },
        { x:   0, y:   0, z:   0 }, //front face end      
        
        { x:   0, y:   0, z: -300 },
        { x:   0, y: 300, z: -300 },
        { x:   0, y: 300, z:    0 }, //left face end 
        
        { x: 300, y: 300, z:    0 },
        { x: 300, y: 300, z: -300 },
        { x:   0, y: 300, z: -300 }, //bottom face end
        
        { x: 300, y: 300, z: -300 },
        { x: 300, y:   0, z: -300 },
        { x: 300, y:   0, z:    0 }, //right face end

        { x: 300, y:   0, z: -300 },
        { x:   0, y:   0, z: -300 },           
    ];

    function renderScene() {
        const context = canvas.getContext('2d');
        canvas.width = canvas.width; // Clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Get camera position from sliders
        var dx = parseFloat(slider1.value);
        var dy = parseFloat(slider2.value);
        var dz = parseFloat(slider3.value);
        var yaw = parseFloat(slider4.value) * (Math.PI / 180); 

        var camera = { x: dx, y: dy, z: dz };

        const cam2scrn = 1000;

        function translateCube(cube, x1, y1, z1) {
            return cube.map(point => ({
                x: point.x + x1,
                y: point.y + y1,
                z: point.z + z1
            }));
        }      

        function projectPoint(point, camera) {
            
            const cosYaw = Math.cos(yaw);
            const sinYaw = Math.sin(yaw);
            const translatedX = point.x - camera.x;
            const translatedZ = point.z - camera.z;
            const rotatedX = translatedX * cosYaw + translatedZ * sinYaw;
            const rotatedZ = -translatedX * sinYaw + translatedZ * cosYaw;

            const zDifference = rotatedZ;
            if (zDifference >= 0) return null;
            const xProjected = -(rotatedX * cam2scrn) / zDifference + canvas.width / 2;
            const yProjected = camera.y + ((point.y - camera.y) * cam2scrn) / zDifference;

            return { x: xProjected, y: yProjected };
        }

        // Project each corner of the base and grid onto the projection plane
        const projectedBase = base.map(corner => projectPoint(corner, camera)).filter(point => point !== null);
        const projectedGrid = grid.map(corner => projectPoint(corner, camera)).filter(point => point !== null);
        const translatedCube = translateCube(cube, 362, 84, -362);
        const projectedCube = translatedCube.map(corner => projectPoint(corner, camera)).filter(point => point !== null);

        function drawCube() {
            const flippedCubeCorners = projectedCube.map(point => ({
                x: point.x,
                y: canvas.height - point.y
            }));

            // Draw the base using the flipped corners
            context.beginPath();
            context.moveTo(flippedCubeCorners[0].x, flippedCubeCorners[0].y);
            flippedCubeCorners.forEach((point, index) => {
                if (index > 0) {
                    context.lineTo(point.x, point.y);
                }
            });
            context.closePath(); // Close the shape

            context.strokeStyle = 'red';
            context.lineWidth = 2;
            context.stroke();

        }

        function drawWarpedBase() {

            // Flip Y-coordinate for display (canvas Y increases downwards)
            const flippedBaseCorners = projectedBase.map(point => ({
                x: point.x,
                y: canvas.height - point.y
            }));

            const flippedGridCorners = projectedGrid.map(point => ({
                x: point.x,
                y: canvas.height - point.y
            }));

            // Draw the base using the flipped corners
            context.beginPath();
            context.moveTo(flippedBaseCorners[0].x, flippedBaseCorners[0].y);
            flippedBaseCorners.forEach((point, index) => {
                if (index > 0) {
                    context.lineTo(point.x, point.y);
                }
            });
            context.closePath(); // Close the shape
            if (dy - 384 <= 0) {
                var baseColor = '#909090';
            } else {
                var baseColor = '#303030';
            }

            context.fillStyle = baseColor;
            context.fill();    // Draw the base shape

            // Draw the grid lines on top of the base
            context.beginPath();
            flippedGridCorners.forEach((point, index) => {
                if (index === 0) {
                    context.moveTo(point.x, point.y);
                } else {
                    context.lineTo(point.x, point.y);
                }
            });
            context.closePath();
            context.strokeStyle = 'black';
            context.stroke(); // Draw the grid lines
        }

        // Call the draw function to display the warped base and grid
        if (dy - 384 <= 0) {
            drawWarpedBase();
            drawCube();
        } else {
            drawCube();
            drawWarpedBase();
            
        }
        
    }

    // Add event listeners for the sliders
    slider1.addEventListener("input", renderScene);
    slider2.addEventListener("input", renderScene);
    slider3.addEventListener("input", renderScene);
    slider4.addEventListener("input", renderScene);
    renderScene(); // Initial render
}

window.onload = world;
