(function (window, document, angular) {
    "use strict";

    var app = {
        name: null,
        version: null,
        codename: null,
        ngApp: 'App',
        apiUrl: angular.element('link[rel=api]').attr('href') || '/',
        angular: angular,
        autoReady: true,
        _triggers: {
            'before.init': [],
            'after.init': [],
            'lazy.init': []
        },

        setName: function(name) {
            this.name = name;
        },

        setVersion: function(version) {
            this.version = version;
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

        _modules: {
            'routes': [],
            'filters': [],
            'services': [],
            'resources': ['ngResource'],
            'validations': [],
            'directives': [],
            'controllers': ['ngSanitize']
        },

        useModule: function(resource, modules) {
            if (angular.isUndefined(this._modules[resource])) {
                return false;
            }

            if (angular.isString(modules)) {
                this._modules[resource].push(modules);
            }
            else if (angular.isArray(modules)) {
                this._modules[resource].concat(modules);
            }
        },

        _initAngular: function() {
            var dis = this;
            angular.forEach(Object.keys(this._modules), function(resource) {
                angular.module(dis.ngName(resource), dis._modules[resource]);
            });
        },

        _initApp: function() {
            this.ng = angular.module(this.ngApp, [
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
            if (angular.isDefined(arguments[0])) {
                angular.extend(this, arguments[0]);
            }

            this._initAngular();
            this._initApp();

            if (angular.isDefined(this.autoReady) && this.autoReady === true) {
                this.registerReady();
            }
            
            return this;
        },

        registerReady: function() {
            var dis = this;
            angular.element(document).ready(function () {
                try {
                    dis.trigger('before.init');
                    angular.bootstrap(document, [dis.ngApp]);
                    dis.trigger('after.init');
                    dis.trigger('lazy.init');
                } catch (e) {}
            });
        }
    };

    window.app = window.app || app;
}(window, window.document, window.angular));
