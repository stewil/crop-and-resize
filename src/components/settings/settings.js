(function(){
    module.exports = Settings;
    
    function Settings(cropArea, userSettings){
        
        var body = document.querySelector('body');

        this.settings = {
            fileInput      : null,
            cropArea       : null,
            croppedImage   : {},
            dropArea       : null,
            previewElement : null,
            setRatio       : null
        };

        if(!userSettings.fileInput && !userSettings.dropArea){
            throw "CropResize is unable to operate without a 'fileInput' or 'dropArea' element.";
        }

        //CROP AREA
        if(this.utils.ifValue(cropArea).isElement && body.contains(cropArea)){
            if(!this.utils.isClosedElement(cropArea)){
                this.settings.cropArea = cropArea;
            }else{
                throw "Unable to add child element canvas to element type '" + cropArea.tagName + "'."
            }
        }else{
            throw "Invalid 'cropArea' element supplied to cropResize. Please ensure element is available in the DOM.";
        }

        if(userSettings.fileInput){
            if(this.utils.ifValue(userSettings.fileInput).isElement && body.contains(userSettings.fileInput)){
                this.settings.fileInput = userSettings.fileInput;
            }else{
                throw "Invalid 'fileInput' element supplied to cropResize. Please ensure element is available in the DOM.";
            }
        }

        //DROP AREA
        if(userSettings.dropArea){
            if(this.utils.ifValue(userSettings.dropArea).isElement && body.contains(userSettings.dropArea)){
                this.settings.dropArea = userSettings.dropArea;
            }else if(userSettings.dropArea === true){
                this.settings.dropArea = userSettings.cropArea;
            }else{
                throw "Unable to assign parameter " + userSettings.dropArea + " to 'dropArea'. Please ensure value is an element available in the DOM.";
            }
        }

        //PREVIEW ELEMENT
        if(userSettings.previewElement && this.utils.ifValue(userSettings.previewElement).isElement && body.contains(userSettings.previewElement)){
            this.settings.previewElement = userSettings.previewElement;
        }

        //RATIO
        //TODO:Ensure we have a correct match on at least two unique numbers
        if(typeof userSettings.setRatio === "string" && (/(\d+){2}/gi.test(userSettings.setRatio))){
            this.settings.setRatio = userSettings.setRatio;
        }
    }
})();