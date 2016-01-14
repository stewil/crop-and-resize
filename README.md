#Resize & Crop
A vanilla Javascript library that provides the tools and UI necessary to manipulate an image file in browser.

##Features
- Fully stylable with CSS.
- No JS dependencies.
- It's responsive
- Supports drag and drop

##Usage
```javascript
var cropArea     = document.querySelector('[data-cropresize-target]'),
    cropResize   = CropResize(cropArea, {
         fileInput       : document.querySelector('input#file-uploader[type="file"]'),
         dropArea        : document.querySelector('[data-drag-drop-target]'),
         previewElement  : document.querySelector('[data-cr-preview]')
    });
```
##Browser Support

##API
###CropResize(fileInput, cropArea, settings):ICropResizeInterface
| Name        | Type        | Description           |
| ------------- | ------------- | ------------- |
| cropArea | element | The element that will be used for file cropping. May be a canvas element or any open (<></>) tag element. |
| settings | object | And object of optional arguments that may be supplied to the initializer.  |

###ICropResizeInterface
| Name        | Type        | Description           |
| ------------- | ------------- | ------------- |
| remove | function() | Removes the class and unbinds all event listeners |
| getInfo | function():IInformationInterface |  |

###Settings
| Name        | Type        | Description           |
| ------------- | ------------- | ------------- |
| fileInput | element | File input element required for uploading files into the ui. |
| dropArea | element|boolean | An element that will trigger a file load on drag/drop. if set to true will default to the cropArea. |
| previewElement | element | An <img/> element that will have it's src updated with the cropped image data. |

###IInformationInterface


##License
See [LICENSE](https://github.com/stewil/crop-resize/blob/master/LICENSE.txt).