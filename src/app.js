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
                parsedFiles = [];

            for(var file in files){
                parsedFiles.push(new FileHandler(files[file]));
            }
        }

        function FileHandler(file){

            var fileHandler = {};

            fileHandler.original    = {};
            fileHandler.cropped     = {};

            if(typeof file === 'object' && file.type.match('image.*')){
                var reader = new FileReader();

                reader.onload = onReaderLoad;

                reader.readAsDataURL(file);

                function onReaderLoad(e){
                    fileHandler.original['url'] = e.target.result;
                    fileHandler.original['size'] = bytesToSize(file.size);
                    bindCanvas.call(fileHandler);
                }
            }
        }

        function bindCanvas(){
            var self = this;

            self['canvas'] = {};
            self.canvas['element'] = document.createElement('canvas');
            self.canvas['context'] = self.canvas.element.getContext('2d');

            var parent  = element.parentElement,
                image   = new Image();

            image.onload    =   onCanvasImageLoad;
            image.src       =   self.original.url;

            function onCanvasImageLoad(){
                self.original['width']  =   this.width;
                self.original['height'] =   this.height;

                self.canvas['width']    =   self['canvas'].element.width;
                self.canvas['height']   =   self['canvas'].element.height;

                var canvasParams = measurements(self.original, self.canvas);

                if(attributes['target']){
                    attributes['target'].appendChild(self.canvas.element)
                }else{
                    parent.insertBefore(self.canvas.element, element);
                }

                self.canvas.context.clearRect(0, 0, self.canvas['width'], self.canvas['height']);
                self.canvas.context.drawImage(image,
                    canvasParams.sx,
                    canvasParams.sy,
                    canvasParams.sWidth,
                    canvasParams.sHeight,
                    canvasParams.dx,
                    canvasParams.dy,
                    canvasParams.dWidth,
                    canvasParams.dHeight
                );

                function measurements(image, canvas){
                    var hRatio      =   canvas.width  / image.width,
                        vRatio      =   canvas.height  / image.height,
                        ratio       =   Math.min ( hRatio, vRatio);

                    return {
                        sx:         0,
                        sy:         0,
                        sWidth:     image.width,
                        sHeight:    image.height,
                        dx:         (canvas['width'] - image['width'] * ratio ) / 2,
                        dy:         (canvas['height'] - image['height'] * ratio ) / 2,
                        dWidth:     image.width * ratio,
                        dHeight:    image.height * ratio
                    }
                }

            }
        }

        function bytesToSize(bytes) {
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }

    }

})(document, window);