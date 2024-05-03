import React, { useState, useEffect } from 'react';
import dropIcon from '../assets/drop-icon.svg';
import Image from 'next/image';

const FileDrop = ({ onFilesSelected }) => {
	const [files, setFiles] = useState([]);
	const [dragging, setDragging] = useState(false);

	const handleFileChange = (event) => {
		const selectedFiles = event.target.files;
		processFiles(selectedFiles);
	};

	const handleDrop = (event) => {
		event.preventDefault();
		if (event.dataTransfer.items) {
			const items = Array.from(event.dataTransfer.items);
			items.forEach((item) => {
				if (item.kind === 'file') {
					const file = item.getAsFile();
					handleFile(file);
				} else if (
					item.kind === 'string' &&
					item.type.match('^text/uri-list')
				) {
					item.getAsString(handleURL);
				}
			});
		} else {
			processFiles(event.dataTransfer.files);
		}
		setDragging(false);
	};

	const handleFile = (file) => {
		if (validateFile(file)) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64url = reader.result;
				setFiles((prevFiles) => [
					...prevFiles,
					{ file: base64url, name: file.name },
				]);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleURL = (url) => {
		if (validateURL(url)) {
			setFiles((prevFiles) => [...prevFiles, { url }]);
		}
	};

	const processFiles = (newFiles) => {
		Array.from(newFiles).forEach((file) => handleFile(file));
	};

	const validateFile = (file) => {
		return file.type.startsWith('image/');
	};

	const validateURL = (url) => {
		return url.match(/\.(jpeg|jpg|png)$/);
	};

	const handleDragOver = (event) => {
		event.preventDefault();
		setDragging(true);
	};

	const handleDragLeave = () => {
		setDragging(false);
	};

	useEffect(() => {
		if (files.length > 0) {
			onFilesSelected(files);
		}
	}, [files, onFilesSelected]);

	return (
		<section
			className={`h-56 w-96  ${dragging ? '' : ''} `}
			aria-label="File Dropzone"
		>
			<div
				className={`h-full w-full  flex  flex-col items-center p-8 gap-y-3  justify-around border-2 border-dashed border-gray-400 rounded-md cursor-pointer`}
				onDrop={handleDrop}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				// onClick={() => document.getElementById('file-input').click()}
			>
				{(dragging && (
					<>
						{' '}
						<Image src={dropIcon} width={100} alt={'Drop file here.'} />
						<p>Drop here</p>
					</>
				)) || (
					<>
						<p className="text-pretty text-center">
							Drag and drop your images here or click to browse.
						</p>
						<p className="text-pretty text-center">
							Supported formats: JPEG, JPG, PNG.
						</p>
						<input
							type="file"
							hidden
							id="file-input"
							onChange={handleFileChange}
							accept="image/jpeg, image/jpg, image/png"
							aria-describedby="file-description"
						/>
						<label
							htmlFor="file-input"
							className="m-auto  bg-blue-500 text-white py-1 px-3 cursor-pointer rounded"
							aria-label="Upload files"
						>
							Browse files
						</label>
						<p id="file-description" hidden>
							Upload JPEG, JPG, or PNG files.
						</p>
					</>
				)}
			</div>
		</section>
	);
};

export default FileDrop;
