(function(){
    module.exports = Settings;
    
    function Settings(fileInput, cropArea, userSettings){
        
        var body = document.querySelector('body');

        this.settings = {
            fileInput      : null,
            cropArea       : null,
            croppedImage   : {},
            dropArea       : null,
            previewElement : null,
            setRatio       : null
        };

        if(this.utils.ifValue(fileInput).isElement && body.contains(fileInput)){
            this.settings.fileInput = fileInput;
        }else{
            throw "Invalid 'fileInput' element supplied to cropResize. Please ensure element is available in the DOM.";
        }

        //CROP AREA
        if(this.utils.ifValue(cropArea).isElement && body.contains(cropArea)){
            if(!this.utils.isClosedElement(cropArea)){
                this.settings.cropArea = cropArea;
            }else{
                throw "Unable to add child element canvas to element type '" + tagName + "'."
            }
        }else{
            throw "Invalid 'cropArea' element supplied to cropResize. Please ensure element is available in the DOM.";
        }

        //DROP AREA
        if(userSettings.dropArea && this.utils.ifValue(userSettings.dropArea).isElement){
            if(body.contains(userSettings.dropArea)){
                this.settings.dropArea = userSettings.dropArea;
            }
        }else if(userSettings.dropArea === true){
            this.settings.dropArea = element;
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