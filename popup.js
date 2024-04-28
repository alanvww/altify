import { pipeline } from './loader.js';

const speaker_embeddings =
	'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';

async function loadModel() {
	try {
		const captioner = await pipeline('image-to-text', 'tarekziade/distilvit');
		document.getElementById('model-status').innerText = 'Model is ready!';
		// const synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts');

		return captioner;
	} catch (error) {
		console.error('Failed to load the model:', error);
		document.getElementById('model-status').innerText = 'Failed to load model.';
		return null;
	}
}

let captioner;
document.addEventListener('DOMContentLoaded', async () => {
	captioner = await loadModel();
	const clearGalleryButton = document.getElementById('clearGallery');
	clearGalleryButton.addEventListener('click', () => {
		document.getElementById('gallery').innerHTML = '';
		document.getElementById('caption').innerHTML = 'Clear!';
	});
});

document.getElementById('drop-area').ondragover = (event) => {
	event.preventDefault();
	event.stopPropagation();
	event.target.classList.add('hover');
};

document.getElementById('drop-area').ondragleave = (event) => {
	event.preventDefault();
	event.stopPropagation();
	event.target.classList.remove('hover');
};

document.getElementById('drop-area').ondrop = (event) => {
	event.preventDefault();
	event.stopPropagation();
	event.target.classList.remove('hover');
	const dt = event.dataTransfer;
	if (dt.items) {
		for (let i = 0; i < dt.items.length; i++) {
			if (dt.items[i].kind === 'file') {
				const file = dt.items[i].getAsFile();
				handleFiles([file]);
			} else if (
				dt.items[i].kind === 'string' &&
				dt.items[i].type.match('^text/uri-list')
			) {
				dt.items[i].getAsString(handleURL);
			}
		}
	} else {
		handleFiles(dt.files);
	}
};

document.getElementById('fileElem').onchange = (event) => {
	handleFiles(event.target.files);
};

function handleFiles(files) {
	for (let i = 0, len = files.length; i < len; i++) {
		if (validateImage(files[i])) {
			previewFile(files[i]);
		} else {
			alert('This file is not a valid image.');
		}
	}
}

function handleURL(url) {
	const img = new Image();
	img.crossOrigin = 'anonymous'; // Ensure this is set if accessing cross-origin images

	img.onload = async () => {
		const imageText = document.createElement('p');
		document.getElementById('gallery').appendChild(img);
		document.getElementById('gallery').appendChild(imageText);

		document.getElementById('caption').innerText = 'Loading...';

		try {
			// Assuming the captioner needs a base64 string, we first convert the image to a canvas to fetch the base64 data
			const canvas = document.createElement('canvas');
			canvas.width = img.naturalWidth;
			canvas.height = img.naturalHeight;
			const ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0);
			const dataURL = canvas.toDataURL('image/jpeg');

			if (captioner) {
				const captionResult = await captioner(dataURL);
				const captionText = captionResult[0].generated_text;
				imageText.innerText = captionText;
				//const out = await synthesizer(captionText, {
				//	speaker_embeddings,
				//});
				document.getElementById('caption').innerText = 'Done!';
			} else {
				document.getElementById('caption').innerText = 'Model is not ready.';
			}
		} catch (error) {
			console.error('Error while fetching image caption:', error);
			document.getElementById('caption').innerText = 'Failed to fetch caption.';
		}
	};
	img.onerror = function () {
		console.error('Failed to load image from URL.');
		document.getElementById('caption').innerText = 'Failed to load image.';
	};
	img.src = 'https://cors-anywhere.herokuapp.com/' + url;
}

function validateImage(file) {
	return file.type.startsWith('image/');
}

function previewFile(file) {
	const reader = new FileReader();
	reader.readAsDataURL(file);
	document.getElementById('caption').innerText = 'Loading...';
	reader.onloadend = async () => {
		const img = document.createElement('img');
		img.src = reader.result;
		document.getElementById('gallery').appendChild(img);

		const imageText = document.createElement('p');

		if (captioner) {
			try {
				const captionResult = await captioner(reader.result);
				const captionText = captionResult[0].generated_text;
				imageText.innerText = captionText;
				document.getElementById('gallery').appendChild(imageText);

				document.getElementById('caption').innerText = 'Done!';
			} catch (error) {
				console.error('Error while fetching image caption:', error);
				document.getElementById('caption').innerText =
					'Failed to fetch caption.';
			}
		} else {
			document.getElementById('caption').innerText = 'Model is not ready.';
		}
	};
}
