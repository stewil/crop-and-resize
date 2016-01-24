'use strict';
var GulpConfig = (function () {
    function GulpConfig() {

        this.debug               = './debug/';
        this.dist                = './dist/';
        this.source              = './src/';
        this.testsDir            = './test/';
        this.bowerFilesSettings  = {};

        this.scss = [
            this.source + "*.scss",
            this.source + "**/*.scss"
        ];

        this.images = [
            this.source + 'assets/**/*.gif',
            this.source + 'assets/**/*.png',
            this.source + 'assets/**/*.jpg',
            this.source + 'assets/**/*.jpeg'
        ];

        this.html = [
            this.source + "**/*.html",
            "!" + this.source + "index.html"
        ];

        this.index = [
            this.source + "index.html"
        ];

        this.application = this.source + 'app.js';

        this.javascriptModules = [
            "!" + this.source + "sourceBundle.js",
            "!" + this.source + '**/*.test.js',
            this.source + '*.js',
            this.source + '**/*.js'
        ];

        this.testIndexName   = "SpecRunner.html";
        this.testIndex       = this.source + this.testIndexName;
        this.testSourceFiles = this.source + "sourceBundle.js";
        this.tests           = [
            this.source + '**/*.test.js'
        ];

    }
    return GulpConfig;
})();
module.exports = GulpConfig;