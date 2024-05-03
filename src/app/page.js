/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import FileDrop from './components/FileDrop';
import Progress from './components/Progress';
import Image from 'next/image';

export default function Home() {
	// Keep track of the classification result and the model loading status.
	const [result, setResult] = useState([]);
	const [ready, setReady] = useState(false);
	const [progressItems, setProgressItems] = useState([]);

	const [images, setImages] = useState([]);
	const worker = useRef(null);

	useEffect(() => {
		if (!worker.current) {
			worker.current = new Worker(new URL('./worker.js', import.meta.url), {
				type: 'module',
			});
			worker.current.postMessage({ status: 'initiate' });
		}
		// Create a callback function for messages from the worker thread.
		const onMessageReceived = (e) => {
			switch (e.data.status) {
				case 'initiate':
					// Model file start load: add a new progress item to the list.
					setReady(false);
					setProgressItems((prev) => [...prev, e.data]);
					break;

				case 'progress':
					// Model file progress: update one of the progress items.
					setProgressItems((prev) =>
						prev.map((item) => {
							if (item.file === e.data.file) {
								return { ...item, progress: e.data.progress };
							}
							return item;
						})
					);
					break;

				case 'done':
					// Model file loaded: remove the progress item from the list.
					setProgressItems((prev) =>
						prev.filter((item) => item.file !== e.data.file)
					);
					break;

				case 'ready':
					// Pipeline ready: the worker is ready to accept messages.
					setReady(true);
					break;

				case 'update':
					// Generation update: update the output text.
					e.data.output.forEach((output, index) => {
						setResult((prevResult) => {
							const newResult = [...prevResult, output.generated_text];
							console.log(newResult); // Now this will log the updated state

							setImages((prevImages) => {
								const newImages = [...prevImages];
								if (newImages[index]) {
									newImages[index].caption = newResult[newResult.length - 1]; // Last added result
								}
								return newImages;
							});

							return newResult;
						});
					});
					break;

				case 'complete':
					// Generation complete: re-enable the "Translate" button
					setDisabled(false);
					break;
			}
		};

		// Attach the callback function as an event listener.
		worker.current.addEventListener('message', onMessageReceived);

		// Define a cleanup function for when the component is unmounted.
		return () =>
			worker.current.removeEventListener('message', onMessageReceived);
	});

	const classify = useCallback(({ status, url }) => {
		if (worker.current) {
			console.log(url);
			worker.current.postMessage({ status: status, url: url });
		}
	}, []);

	const handleFilesSelected = useCallback(
		(files) => {
			// Access only the latest file (assuming it's the last one in the list)
			const latestFile = files[files.length - 1];
			let url;

			if (latestFile) {
				console.log(latestFile);
				if (latestFile.type && latestFile.type.startsWith('image/')) {
					let fileReader;
					fileReader = new FileReader();
					fileReader.onload = (e) => {
						const { result } = e.target;
						url = result;
					};
					fileReader.readAsDataURL(latestFile);
					// Update the images state to only show the latest uploaded file
					setImages([{ url: url, caption: 'Loading caption...' }]);

					// Classify the latest file
					classify({ status: 'classify', url: url });
				} else if (latestFile.file) {
					// Update the images state to only show the latest uploaded file
					setImages([{ url: latestFile.file, caption: 'Loading caption...' }]);

					// Classify the latest file
					classify({ status: 'classify', url: latestFile.file });
				} else {
					// Update the images state to only show the latest uploaded file
					setImages([{ url: latestFile.url, caption: 'Loading caption...' }]);

					// Classify the latest file
					classify({ status: 'classify', url: latestFile.url });
				}
			}
		},
		[classify]
	); // Include `classify` in the dependency array to ensure it captures the latest function

	return (
		<main
			className="flex min-h-screen flex-col items-center justify-center p-12"
			aria-label="Main Content"
		>
			<h1 className="text-5xl font-bold my-2 py-2 text-center">Altify</h1>

			<FileDrop onFilesSelected={handleFilesSelected} />

			<div id="gallery" className="w-full mt-4" aria-live="polite">
				{images.map((image, index) => (
					<div key={index} className="my-4 w-fit m-auto" role="figure">
						<img
							src={image.url}
							alt={image.caption || 'Image loading'}
							className="rounded-lg m-auto"
							aria-describedby={`description-${index}`}
						/>
						<figcaption id={`description-${index}`} className="text-center">
							{image.caption || 'Caption loading...'}
						</figcaption>
					</div>
				))}
			</div>
			<div className="progress-bars-container" aria-live="assertive">
				{!ready && <label>Loading models... (only run once)</label>}
				{progressItems.map((data) => (
					<div key={data.file}>
						<Progress text={data.file} percentage={data.progress} />
					</div>
				))}
			</div>
		</main>
	);
}
