import {
	pipeline,
	env,
} from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@latest';

// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = false;

export { pipeline };
