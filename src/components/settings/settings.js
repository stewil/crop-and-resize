(function(){
    module.exports = Settings;

    function Settings(cropArea, userSettings){
        
        var body    = document.querySelector('body'),
            _utils  = require('../utils/utils.js')();

        this.settings = {
            fileInput      : null,
            cropArea       : null,
            croppedImage   : {},
            dropArea       : null,
            previewElement : null,
            setRatio       : null
        };

        /**
         * cropArea or fileInput must be available.
         */
        if(!userSettings.fileInput && !userSettings.dropArea){
            throw new TypeError("CropResize is unable to operate without a 'fileInput' or 'dropArea' element.");
        }

        /**
         * cropArea value validation.
         */
        if(_utils.ifValue(cropArea).isElement && body.contains(cropArea)){
            if(!_utils.isClosedElement(cropArea)){
                this.settings.cropArea = cropArea;
            }else{
                throw new TypeError("Unable to add child element canvas to element type '" + cropArea.tagName + "'.");
            }
        }else{
            throw new TypeError("Invalid 'cropArea' element supplied to cropResize. Please ensure element is available in the DOM.");
        }

        /**
         * fileInput value validation.
         */
        if(userSettings.fileInput){
            if(_utils.ifValue(userSettings.fileInput).isElement
                && body.contains(userSettings.fileInput)
                && userSettings.fileInput.tagName.toLowerCase() === 'input'
                && userSettings.fileInput.type === 'file'){
                this.settings.fileInput = userSettings.fileInput;
            }else{
                throw new TypeError("Invalid 'fileInput' element supplied to cropResize. Please ensure element is available in the DOM.");
            }
        }

        /**
         * dropArea value validation.
         */
        if(userSettings.dropArea){
            if(_utils.ifValue(userSettings.dropArea).isElement
                && body.contains(userSettings.dropArea)){
                this.settings.dropArea = userSettings.dropArea;
            }else if(userSettings.dropArea === true){
                this.settings.dropArea = userSettings.cropArea;
            }else{
                throw new TypeError("Unable to assign parameter " + userSettings.dropArea + " to 'dropArea'. Please ensure value is an element available in the DOM.");
            }
        }

        /**
         * previewElement value validation.
         */
        if(userSettings.previewElement
            && _utils.ifValue(userSettings.previewElement).isElement
            && body.contains(userSettings.previewElement)){
            this.settings.previewElement = userSettings.previewElement;
        }

        /**
         * Ratio value validation.
         */
        if(userSettings.setRatio){
            if(Object.prototype.toString.call( userSettings.setRatio ) === '[object Array]'){
                if(userSettings.setRatio.length >= 2 && typeof userSettings.setRatio[0] === 'number' && typeof userSettings.setRatio[1] === 'number'){
                    this.settings.setRatio = ratioArrayToObject(userSettings.setRatio);
                }else{
                    throw new TypeError("'setRatio' requires and array with two valid number values.");
                }
            }else if(typeof userSettings.setRatio === "string" && (/\d+/gi.test(userSettings.setRatio))){
                this.settings.setRatio = ratioArrayToObject(userSettings.setRatio.match(/\d+/gi));
            }else{
                throw new TypeError("'setRatio' must be a string containing two numbers separated by any non digit value.");
            }
        }

        function ratioArrayToObject(ratios){
            return {
                hRatio : ratios[0] / ratios[1],
                wRatio : ratios[1] / ratios[0]
            };
        }

        return this.settings;
    }
})();