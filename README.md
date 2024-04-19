# altify

A Chrome extension that utilize the power of AI to generate alt text for images on the web.

## Description

altify is a Chrome extension that utilizes the power of AI to generate alt text for images on the web. The extension uses [transformers.js](https://huggingface.co/docs/transformers.js/index) to generate alt text for images on the website the user is currently visiting and aims to generate alt text for images that have no alt text or alt text that is not descriptive enough, which is a common problem for many websites. The goal of this project is to help make the web more accessible to people with visual impairments, lowering the barrier for them to access the web and improving the overall user experience for everyone.

## To-dos

- Quick prove of concept using p5.js and transformers.js to run images-to-text, allowing multiple images input.
- Create a Chrome extension
  - popup.html
    - Indication for model loaded (loaded once per installation / check if latest version is loaded)
    - Buttons to run the model, show/hide the result.
  - popup.js
    - Load the model
    - Run the model
    - Show/hide the result
  - background.js
    - maybe click image to run the model?

## References

- [transformers.js](https://huggingface.co/docs/transformers.js/index)
- [p5.js](https://p5js.org/)
- [Chrome Extension](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [Chrome Extension - Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [image-to-text](https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.ImageToTextPipeline)
