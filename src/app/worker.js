// Using ES Modules syntax as indicated by type: 'module'
import { pipeline, env } from '@xenova/transformers';

// Configure the environment to disable local models
env.allowLocalModels = false;
env.useBrowserCache = true;

const CORS_PROXY =
	process.env.CORS_FIX_URL || 'https://cors-anywhere.herokuapp.com/';

class Image2TextPipeline {
	static instance = null;

	static async getInstance(progress_callback = null) {
		if (!this.instance) {
			this.instance = pipeline('image-to-text', 'Mozilla/distilvit', {
				progress_callback,
			});
		}
		return this.instance;
	}
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
	// Retrieve the image2text pipeline. When called for the first time,
	// this will load the pipeline and save it for future use.
	let captioner = await Image2TextPipeline.getInstance((x) => {
		// We also add a progress callback to the pipeline so that we can
		// track model loading.
		self.postMessage(x);
	});
	let output;
	if (event.data.url.startsWith('data:')) {
		output = await captioner(event.data.url);
	} else {
		output = await captioner(CORS_PROXY + event.data.url);
	}
	console.log(output);
	self.postMessage({ status: 'update', output });
});
