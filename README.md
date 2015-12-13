#Resize & Crop

This is the start of a vanilla solution for image resizing cropping in javascript.

##Usage
```javascript
var _element    = document.querySelector('#file-uploader'),
    _cropResize = new CropResize(_element, {
        target:document.querySelector('[data-cropresize-target]')
    });
```

##API
| Name        | Type        | Description           | Example  |
| ------------- | ------------- | ------------- | ----- |
| remove | function | Removes the class and unbinds all event listeners |  |

##License
See [LICENSE](https://github.com/stewil/crop-resize/blob/master/LICENSE.txt).