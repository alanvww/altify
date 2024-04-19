(function () {
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		if (changeInfo.status === 'complete') {
			chrome.scripting.executeScript({
				target: { tabId: tabId },
				function: function () {
					let offset_x = 0,
						offset_y = 0;
					let zIndexCounter = 1000; // Start with a base zIndex value

					function initDraggable(element) {
						document.querySelectorAll('a').forEach((link) => {
							link.style.pointerEvents = 'none'; // Disable pointer events on links
						});

						element
							.querySelectorAll('div, span')
							.forEach((draggableElement) => {
								draggableElement.style.touchAction = 'none'; // Prevent default touch actions
								draggableElement.style.position = 'relative'; // Needed for correct positioning
								draggableElement.style.userSelect = 'none'; // Prevent text selection
								draggableElement.style.cursor = 'grab'; // Change cursor to grab

								let cross = document.createElement('spam');
								cross.textContent = '✖'; // Unicode cross character
								cross.style.position = 'absolute';
								cross.style.top = '0';
								cross.style.right = '0';
								cross.style.color = 'red';
								cross.style.cursor = 'pointer';
								cross.style.display = 'none'; // Initially hidden
								cross.style.userSelect = 'none'; // Prevent text selection

								draggableElement.addEventListener('mouseover', () => {
									cross.style.display = 'inline-block';
								});

								draggableElement.addEventListener('mouseout', () => {
									cross.style.display = 'none';
								});

								cross.addEventListener('click', (event) => {
									event.stopPropagation(); // Prevent parent drag actions
									draggableElement.remove(); // Remove the element
								});

								draggableElement.appendChild(cross);
							});

						document.addEventListener('pointerdown', function (event) {
							let targetElement = event.target.closest('div, span');
							if (targetElement && event.target === targetElement) {
								targetElement.style.margin = '0';
								targetElement.style.transform = 'none';
								targetElement.style.position = 'absolute';

								zIndexCounter++; // Increment zIndex for the active element
								targetElement.style.zIndex = zIndexCounter.toString(); // Set the highest zIndex

								offset_x =
									event.clientX - targetElement.getBoundingClientRect().left;
								offset_y =
									event.clientY - targetElement.getBoundingClientRect().top;

								let initialX = event.clientX - offset_x;
								let initialY = event.clientY - offset_y;
								targetElement.style.left = `${initialX}px`;
								targetElement.style.top = `${initialY}px`;

								targetElement.setPointerCapture(event.pointerId);
								document.body.style.userSelect = 'none'; // Prevent text selection
								event.target.draggableElement = targetElement;
							}
						});

						document.addEventListener('pointermove', function (event) {
							let targetElement = event.target.draggableElement;
							if (targetElement) {
								let x = event.clientX - offset_x;
								let y = event.clientY - offset_y;
								targetElement.style.position = 'absolute';
								targetElement.style.left = `${x}px`;
								targetElement.style.top = `${y}px`;
							}
						});

						document.addEventListener('pointerup', function (event) {
							let targetElement = event.target.draggableElement;
							if (targetElement) {
								targetElement.releasePointerCapture(event.pointerId);
								document.body.style.userSelect = '';
								event.target.draggableElement = null; // Clear the target
							}
						});
					}

					initDraggable(document);
				},
			});
		}
	});
})();
