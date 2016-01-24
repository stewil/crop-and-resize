(function(){
    describe("Information Module", function(){

        it("'getImageData()' will return all image data for the source image and the cropped image.", function(){
            expect(Object.keys(information.getImageData())).toContain('croppedImage');
            expect(Object.keys(information.getImageData())).toContain('originalImage');
        });

    });
})();