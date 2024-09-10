// Get HTML elements
const uploadInput = document.getElementById('upload');
const image = document.getElementById('image');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Load PoseNet model
async function loadPosenet() {
    return await posenet.load();
}

// Process the uploaded image
async function processImage(file) {
    const reader = new FileReader();
    reader.onload = async function(event) {
        image.src = event.target.result;
        image.onload = async function() {
            // Calculate the aspect ratio of the image
            const aspectRatio = image.height / image.width;
            
            // Set the new canvas dimensions
            const newWidth = 700;
            const newHeight = newWidth * aspectRatio;

            // Calculate scaling factors
            const scaleX = newWidth / image.width;
            const scaleY = newHeight / image.height;

            // Set canvas size
            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw the resized image on the canvas
            ctx.drawImage(image, 0, 0, newWidth, newHeight);

            // Load PoseNet model and estimate pose
            const net = await loadPosenet();
            const pose = await net.estimateSinglePose(image, {
                flipHorizontal: false
            });

            // Scale keypoints according to new canvas dimensions
            const scaledKeypoints = pose.keypoints.map(keypoint => ({
                ...keypoint,
                position: {
                    x: keypoint.position.x * scaleX,
                    y: keypoint.position.y * scaleY
                }
            }));

            // Draw keypoints, skeleton, and angles with scaled keypoints
            drawKeypoints(scaledKeypoints, 0.5, ctx);
            drawSkeleton(scaledKeypoints, 0.5, ctx);
            calculateAndDisplayAngles(scaledKeypoints, ctx);
        };
    };
    reader.readAsDataURL(file);
}



// Calculate angle between three points
function calculateAngle(p1, p2, p3) {
    const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    return Math.abs(angle * 180 / Math.PI);
}

// Calculate angle of a line from a point to the horizontal axis
function calculateHorizontalAngle(p1, p2) {
    const angle = Math.atan2(p1.y - p2.y, p1.x - p2.x);
    return angle * 180 / Math.PI;
}

// Draw keypoints on the canvas
function drawKeypoints(keypoints, minConfidence, ctx) {
    keypoints.forEach((keypoint) => {
        if (keypoint.score >= minConfidence) {
            const { y, x } = keypoint.position;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'red';
            ctx.fill();
        }
    });
}

// Draw skeleton on the canvas
function drawSkeleton(keypoints, minConfidence, ctx) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);
    adjacentKeyPoints.forEach((keypoint) => {
        ctx.beginPath();
        ctx.moveTo(keypoint[0].position.x, keypoint[0].position.y);
        ctx.lineTo(keypoint[1].position.x, keypoint[1].position.y);
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

// Draw dotted horizontal lines from the hips
function drawDottedLine(start, end, ctx) {
    const dashLength = 5;
    const gapLength = 5;
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const dashCount = Math.floor(length / (dashLength + gapLength));

    ctx.beginPath();
    ctx.setLineDash([dashLength, gapLength]);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw angle lines
function drawAngle(p1, p2, p3, color, ctx) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
}

// Calculate and display angles
function calculateAndDisplayAngles(keypoints, ctx) {
    // Find keypoints for left and right knees
    const leftHip = keypoints.find(kp => kp.part === 'leftHip');
    const leftKnee = keypoints.find(kp => kp.part === 'leftKnee');
    const leftAnkle = keypoints.find(kp => kp.part === 'leftAnkle');

    const rightHip = keypoints.find(kp => kp.part === 'rightHip');
    const rightKnee = keypoints.find(kp => kp.part === 'rightKnee');
    const rightAnkle = keypoints.find(kp => kp.part === 'rightAnkle');

    // Find keypoints for shoulders for waist angle calculation
    const leftShoulder = keypoints.find(kp => kp.part === 'leftShoulder');
    const rightShoulder = keypoints.find(kp => kp.part === 'rightShoulder');

    if (leftHip && leftKnee && leftAnkle) {
        const leftKneeAngle = calculateAngle(leftHip.position, leftKnee.position, leftAnkle.position);
        ctx.font = '20px Arial';
        ctx.fillStyle = 'green';
        ctx.fillText(`${leftKneeAngle.toFixed(2)}°`, leftKnee.position.x + 10, leftKnee.position.y - 10);
    }

    if (rightHip && rightKnee && rightAnkle) {
        const rightKneeAngle = calculateAngle(rightHip.position, rightKnee.position, rightAnkle.position);
        ctx.font = '20px Arial';
        ctx.fillStyle = 'orange';
        ctx.fillText(`${rightKneeAngle.toFixed(2)}°`, rightKnee.position.x + 10, rightKnee.position.y - 10);
    }

    if (leftShoulder && leftHip) {
        const hipAngle = calculateHorizontalAngle(leftShoulder.position, leftHip.position);
        ctx.font = '20px Arial';
        ctx.fillStyle = 'blue';
        ctx.fillText(`${Math.abs(hipAngle).toFixed(2)}°`, leftHip.position.x + 10, leftHip.position.y - 10);

        // Draw horizontal dotted lines from the hips
        drawDottedLine(leftHip.position, { x: canvas.width, y: leftHip.position.y }, ctx);
    }
}

// Handle file input change
uploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        processImage(file);
    }
});
