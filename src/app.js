(function(document, window){

    window['CropResize'] = CropResize;


    function CropResize(element, attributes){

        this.remove = remove;

        element.addEventListener('change', onFileInputChange);

        function remove(){
            element.removeEventListener('change', onFileInputChange);
        }

        function onFileInputChange(e, scope){

            var files       = this.files,
                parsedFiles = {};

            for(var file in this.files){
                parsedFiles[files[file].name] = new FileHandler(files[file]);
            }
        }

        function FileHandler(file){

            if(typeof file === 'object'){
                var reader = new FileReader();

                reader.onload = onReaderLoad;

                reader.readAsDataURL(file);

                function onReaderLoad(e){
                    var url = e.target.result;
                    CanvasHandler(url);
                }
            }
        }

        function CanvasHandler(src){
            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                parent = element.parentElement,
                image = new Image();

            image.onload = onCanvasImageLoad;

            image.src = src;

            function onCanvasImageLoad(){
                parent.insertBefore(canvas, element);
                context.drawImage(image, 0,0);
            }


        }
    }

})(document, window);