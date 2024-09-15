function world() {"use strict"
    const canvas = document.getElementById('canvas');    
    
    var slider1 = document.getElementById('slider1');
    slider1.value = 512;
    var slider2 = document.getElementById('slider2');
    slider2.value = 400;
    var slider3 = document.getElementById('slider3');
    slider3.value = 500;
    
    const base = [
        { x: 0, y: 200, z: 0 },        // Corner 1
        { x: 1024, y: 200, z: 0 },     // Corner 2
        { x: 1024, y: 200, z: -1024 }, // Corner 3
        { x: 0, y: 200, z: -1024 },     // Corner 4    
    ];

    const grid = [
        { x: 1024, y: 200, z: 0 },
        { x: 768, y: 200, z: 0 },
        { x: 768, y: 200, z: -1024 },     
        { x: 512, y: 200, z: -1024 },
        { x: 512, y: 200, z: 0 },     
        { x: 256, y: 200, z: 0 }, 
        { x: 256, y: 200, z: -1024 },  
        { x: 0, y: 200, z: -1024 },      
        { x: 0, y: 200, z: -256 },
        { x: 1024, y: 200, z: -256 },
        { x: 1024, y: 200, z: -512 },
        { x: 0, y: 200, z: -512 },
        { x: 0, y: 200, z: -768 },
        { x: 1024, y: 200, z: -768 },     
          
    ];


    function renderScene() {

        const context = canvas.getContext('2d');
        canvas.width = canvas.width;
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        var dx = parseFloat(slider1.value);
        var dy = parseFloat(slider2.value);
        var dz = parseFloat(slider3.value);
        
        var camera = { x: dx, y: dy, z: dz };

        function projectPoint(point, camera) {
            const xProjected = camera.x + ((point.x - camera.x) * (0 - camera.z)) / (point.z - camera.z);
            const yProjected = camera.y + ((point.y - camera.y) * (0 - camera.z)) / (point.z - camera.z);
            
            return { x: xProjected, y: yProjected };
        }

        const projectedBase = base.map(corner => projectPoint(corner, camera));
        const projectedBaseGrid = grid.map(corner => projectPoint(corner, camera));

        function drawWarpedBase() {
            

            // Set line color and width
            context.strokeStyle = 'white';
            context.lineWidth = 2;

            // Flip Y-coordinate for display (canvas Y increases downwards)
            const flippedBaseCorners = projectedBase.map(point => ({
                x: point.x,
                y: canvas.height - point.y
            }));

            const flippedGridCorners = projectedBaseGrid.map(point => ({
                x: point.x,
                y: canvas.height - point.y
            }));

            // Draw the warped base using the flipped corners
            
            context.beginPath();
            context.moveTo(flippedBaseCorners[0].x, flippedBaseCorners[0].y);
            flippedBaseCorners.forEach((point, index) => {
                if (index > 0) {
                    context.lineTo(point.x, point.y);
                }
            });
            context.closePath(); // Close the shape
            context.fillStyle = 'gray';
            context.fill();    // Draw the outline

            context.beginPath();
            context.moveTo(flippedGridCorners[0].x, flippedGridCorners[0].y);
            flippedGridCorners.forEach((point, index) => {
                if (index > 0) {
                    context.lineTo(point.x, point.y);
                }
            });
            context.closePath(); // Close the shape
            context.strokeStyle = 'black';
            context.stroke();    // Draw the outline




        }

        // Call the draw function to display the warped base
        drawWarpedBase();
    }
    slider1.addEventListener("input",renderScene);
    slider2.addEventListener("input",renderScene);
    slider3.addEventListener("input",renderScene);
    renderScene();
}
window.onload = world;