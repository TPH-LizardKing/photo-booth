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

    // Create download for the combined photo card
    generatePhotoCard();

    // Create downloads for individual pictures
    capturedImages.forEach((dataUrl, index) => {
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-download';

        const img = document.createElement('img');
        img.src = dataUrl;

        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = `photo_${index + 1}.jpg`;
        downloadLink.textContent = `Download Photo ${index + 1}`;

        photoContainer.appendChild(img);
        photoContainer.appendChild(downloadLink);
        photoStrip.appendChild(photoContainer);
    });
}

function generatePhotoCard() {
    const cardCanvas = document.createElement('canvas');
    const cardCtx = cardCanvas.getContext('2d');
    
    const singleWidth = cameraStream.videoWidth;
    const singleHeight = cameraStream.videoHeight;

    cardCanvas.width = singleWidth;
    cardCanvas.height = singleHeight * totalPictures;

    const imagePromises = capturedImages.map(dataUrl => {
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = dataUrl;
        });
    });

    Promise.all(imagePromises).then(images => {
        images.forEach((img, index) => {
            cardCtx.drawImage(img, 0, index * singleHeight, singleWidth, singleHeight);
        });

        const cardDataUrl = cardCanvas.toDataURL('image/jpeg');
        
        const photoContainer = document.createElement('div');
        photoContainer.className = 'photo-download main-card';

        const img = document.createElement('img');
        img.src = cardDataUrl;
        img.style.width = '100%'; // Make preview smaller

        const downloadLink = document.createElement('a');
        downloadLink.href = cardDataUrl;
        downloadLink.download = 'photocard.jpg';
        downloadLink.textContent = 'Download Photo Card';
        
        photoContainer.appendChild(downloadLink);
        photoContainer.appendChild(img);
        
        // Add the main photo card to the top of the photo strip
        photoStrip.prepend(photoContainer);
    });
}


startButton.addEventListener('click', startPhotoBooth);

// Start the camera as soon as the page loads
startCamera();
