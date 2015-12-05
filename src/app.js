(function(document, window){

    window['CropResize'] = CropResize;


    function CropResize(element, attributes){

        var _cropResize         = this,
            _eventQueues = {
                mousedown:new EventObject(window, onMouseMove),
                mouseup:new EventObject(window, onMouseUp),
                mousemove:new EventObject(window, onMouseMove),
                resize:new EventObject(window, onWindowResize),
                change:new EventObject(element, onFileInputChange)
            };

        this.remove = remove;
        this.images = {};       

        for(var eventName in _eventQueues){
            (function(eventName, eventObj){
                eventObj.element.addEventListener(eventName, eventObj.fn);
            })(eventName, _eventQueues[eventName]); 
        }

        function remove(){
            for(var eventName in _eventQueues){
                (function(eventName, eventObj){
                    eventObj.element.removeEventListener(eventName, eventObj.fn);
                    eventObj.events = [];
                })(eventName, _eventQueues[eventName]); 
            }

        }

        function EventObject(target, fn){
            return {
                events:[],
                element:target,
                fn:fn
            }
        }

        function onMouseDown(e){
            onSubscription(e, 'mousedown');
        }

        function onMouseUp(e){
            onSubscription(e, 'mouseup');
        }

        function onMouseMove(e){
            onSubscription(e, 'mousemove');
        }

        function onWindowResize(e){
            onSubscription(e, 'resize');
        }

        function onSubscription(e, key){
            var events = _eventQueues[key];
            for(var i = 0; i < events.length; i++){
                events[i](e);
            }
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

                cropWindow((attributes['target'] || parent), self.canvas);

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

        function createImgInstance(croppedImageData,croppedImageElement, target){
            var buffer = document.createElement('canvas'),
                bufferCtx = buffer.getContext("2d");

            buffer.width    =   500;
            buffer.height   =   500;
            bufferCtx.putImageData(croppedImageData, 0, 0);

            croppedImageElement.src = buffer.toDataURL('image/png');

            if(target && !target.contains(croppedImageElement)){
                target.appendChild(croppedImageElement);
            }
            return croppedImageElement;
        }

        function cropWindow(target, canvas, croppedSrc){

            var croppedImage = document.createElement('img');

            var isHeld              = false,
                mouseStart          = {},
                cropWindowElement   = document.createElement('div'),
                childNames = [
                    'handle-top-left',
                    'handle-top-center',
                    'handle-top-right',
                    'handle-right-middle',
                    'handle-bottom-right',
                    'handle-bottom-center',
                    'handle-bottom-left',
                    'handle-left-middle',
                    'center-point'
                ];

            cropWindowElement.className = 'cr-crop-window';

            for(var i = 0; i < childNames.length; i++){
                (function(){
                    var cropHandle = document.createElement('div');
                    cropHandle.className = "cr-crop-handle cr-" + childNames[i];
                    cropWindowElement.appendChild(cropHandle);
                })();
            }

            target.appendChild(cropWindowElement);

            _eventQueues.mousemove.push(onCropMove);
            _eventQueues.mousedown.push(onCropMouseDown);
            _eventQueues.mouseup.push(onCropMouseUp);

            function onCropMove(e){
                if(isHeld){

                    //TODO:Add Boundaries
                    //TODO:Add functionality for handles clicked
                    //TODO:Keep previous translate
                    cropWindowElement.style.transform = "translate(" + ((e.x - mouseStart.x)) + "px, " + ((e.y - mouseStart.y)) + "px)";

                    var canvasBoundingRect = canvas.element.getBoundingClientRect(),
                        canvasWidth     =   canvas.element.clientWidth,
                        canvasHeight    =   canvas.element.clientHeight;

                    var heightPercent   =   cropWindowElement.clientHeight / canvasHeight,
                        widthPercent    =   cropWindowElement.clientWidth / canvasWidth,
                        leftPercent = (cropWindowElement.getBoundingClientRect().left - canvasBoundingRect.left) / canvasWidth,
                        topPercent = (cropWindowElement.getBoundingClientRect().top - canvasBoundingRect.top) / canvasHeight;

                    var newImgData = canvas.context.getImageData(
                            canvas.width * leftPercent,
                            canvas.height * topPercent,
                            canvas.width * widthPercent,
                            canvas.height * heightPercent);

                    createImgInstance(newImgData, croppedImage, _element.parentNode);
                }
            }

            function onCropMouseDown(e){
                if(e.target.className.match("-crop-")){
                    isHeld = true;
                    mouseStart['x'] = e.x;
                    mouseStart['y'] = e.y;
                }
            }

            function onCropMouseUp(e){
                isHeld = false;
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