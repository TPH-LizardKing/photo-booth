const cameraStream = document.getElementById('camera-stream');
const startButton = document.getElementById('start-button');
const photoStrip = document.getElementById('photo-strip');
const canvas = document.getElementById('canvas');
const timerDisplay = document.getElementById('timer');

let picturesTaken = 0;
const totalPictures = 4;
let countdownInterval;
const capturedImages = [];

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStream.srcObject = stream;
    } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Could not access the camera. Please make sure you have a camera connected and have granted permission.");
    }
}

function startPhotoBooth() {
    startButton.disabled = true;
    picturesTaken = 0;
    capturedImages.length = 0; // Clear the array
    photoStrip.innerHTML = '';
    startCountdown();
}

function startCountdown() {
    let count = 3;
    timerDisplay.textContent = count;

    countdownInterval = setInterval(() => {
        count--;
        timerDisplay.textContent = count > 0 ? count : '';
        if (count === 0) {
            clearInterval(countdownInterval);
            takePicture();
        }
    }, 1000);
}

function takePicture() {
    canvas.width = cameraStream.videoWidth;
    canvas.height = cameraStream.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(cameraStream, 0, 0, canvas.width, canvas.height);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    capturedImages.push(dataUrl);

    // Show a temporary thumbnail
    const thumb = document.createElement('img');
    thumb.src = dataUrl;
    photoStrip.appendChild(thumb);

    picturesTaken++;

    if (picturesTaken < totalPictures) {
        setTimeout(startCountdown, 1000);
    } else {
        timerDisplay.textContent = 'Done!';
        createDownloads();
        setTimeout(() => {
            timerDisplay.textContent = '';
            startButton.disabled = false;
        }, 2000);
    }
}

function createDownloads() {
    photoStrip.innerHTML = ''; // Clear thumbnails
    generatePhotoCard();
}

function generatePhotoCard() {
    const cardCanvas = document.createElement('canvas');
    const cardCtx = cardCanvas.getContext('2d');
    
    const imgWidth = cameraStream.videoWidth;
    const imgHeight = cameraStream.videoHeight;

    const padding = 40;
    const gap = 20;

    cardCanvas.width = imgWidth + (padding * 2);
    cardCanvas.height = (imgHeight * totalPictures) + (gap * (totalPictures - 1)) + (padding * 2);

    // Fill with white background
    cardCtx.fillStyle = '#ffffff';
    cardCtx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);

    const imagePromises = capturedImages.map(dataUrl => {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = dataUrl;
        });
    });

    Promise.all(imagePromises).then(images => {
        images.forEach((img, index) => {
            const x = padding;
            const y = padding + (index * (imgHeight + gap));
            cardCtx.drawImage(img, x, y, imgWidth, imgHeight);
        });

        const stripDataUrl = cardCanvas.toDataURL('image/jpeg', 0.95);
        
        const container = document.createElement('div');
        container.className = 'final-strip-container';

        const img = document.createElement('img');
        img.src = stripDataUrl;
        img.className = 'final-strip-image';

        const downloadLink = document.createElement('a');
        downloadLink.href = stripDataUrl;
        downloadLink.download = 'photo-booth-strip.jpg';
        downloadLink.className = 'download-button';
        downloadLink.textContent = 'Download Photo Strip';

        container.appendChild(downloadLink);
        container.appendChild(img);
        
        photoStrip.appendChild(container);
    });
}


startButton.addEventListener('click', startPhotoBooth);

// Start the camera as soon as the page loads
startCamera();
