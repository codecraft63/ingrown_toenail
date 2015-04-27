(function (window, document, angular) {
    "use strict";

    var app = {
        name: null,
        version: null,
        codename: null,
        ngApp: 'App',
        apiUrl: angular.element('link[rel=api]').attr('href') || '/',
        angular: angular,
        _triggers: {
            'before.init': [],
            'after.init': []
        },

        setName: function(name) {
            this.name = name;
        },

        setVersion: function(version) {
            this.verson = version;
        },

        setCodename: function(codename) {
            this.codename = codename;
        },

        setNgApp: function(ngApp) {
            this.ngApp = ngApp;
        },

        setApiUrl: function(url) {
            this.apiUrl = url;
        },

        ngName: function (suffix) {
            return this.ngApp + '.' + suffix;
        },

        resourceUrl: function (uri) {
            return this.apiUrl + uri + '.json';
        },

        on: function(eventName, cb) {
            if (angular.isUndefined(this._triggers[eventName])) {
                return false;
            }

            this._triggers[eventName].push(cb);
        },

        _initAngular: function() {
            angular.module(this.ngName('routes'), []);
            angular.module(this.ngName('filters'), []);
            angular.module(this.ngName('services'), []);
            angular.module(this.ngName('resources'), ['ngResource']);
            angular.module(this.ngName('validations'), []);
            angular.module(this.ngName('directives'), []);
            angular.module(this.ngName('controllers'), ['ngSanitize']);
        },

        _initApp: function() {
            this.ng = angular.module(this.ngthis, [
                'ngRoute',
                'ngAnimate',
                this.ngName('routes'),
                this.ngName('filters'),
                this.ngName('services'),
                this.ngName('resources'),
                this.ngName('validations'),
                this.ngName('directives'),
                this.ngName('controllers')
            ]);

            this.ng.config(['$httpProvider', function ($httpProvider) {
                $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
                $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
            }]);
        },

        trigger: function(eventName) {
            if (angular.isUndefined(this._triggers[eventName])) {
                return false;
            }

            var dis = this;
            angular.forEach(this._triggers[eventName], function(cb) {
                cb.apply(this);
            }, dis);
        },

        init: function() {
            try {
                this.trigger('before.init');
                this._initAngular();
                this._initApp();

                angular.bootstrap(document, [this.ngApp]);
                this.trigger('after.init');
            } catch (e) {}
        }
    };

    window.app = window.app || app;
}(window, window.document, window.angular));
