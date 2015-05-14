(function (window, document, angular) {
    "use strict";

    function ModuleDependencies(defaults) {
        var modules = [];

        angular.extend(modules, defaults);

        return {
            get: function(key) {
                return modules[key]
            },

            add: function(key, value) {
                if (angular.isUndefined(modules[key])) {
                    modules[key] = [];
                } 
                    
                modules[key].push(value)

                return this;
            },

            set: function(key, value) {
                modules[key] = value;
                return this;
            },

            keys: function() {
                return Object.keys(modules);
            }
        }
    }

    function EventManager(defaults) {
        var events = {};

        angular.forEach(defaults, function(value) {
            events[value] = [];
        });

        return {
            on: function(eventName, callback) {
                if (angular.isUndefined(events[eventName])) {
                    return false;
                }

                events[eventName].push(callback);

                return this;
            },

            trigger: function(eventName, context) {
                if (angular.isUndefined(events[eventName])) {
                    return false;
                }

                angular.forEach(events[eventName], function (cb) {
                    cb.apply(this);
                }, context);

                return this;
            }
        }
    }


    function AngularApp() {
        var settings,
            events = new EventManager(['before.init', 'after.init', 'lazy.init']),
            mainDependencies,
            modulesDependencies
        ;

        settings = {
            name: null,
            version: null,
            codename: null,
            ngApp: 'app',
            apiUrl: angular.element('link[rel=api]').attr('href') || '/'
        };

        mainDependencies = function () {
            var module = new ModuleDependencies({
                'main': ['ngRoute', 'ngAnimate']
            });

            return {
                get: function() { return module.get('main'); },
                add: function(value) { return module.add('main', value); return api; },
                set: function(value) { return module.set('main', value); return api; }
            }
        };

        modulesDependencies = new ModuleDependencies({
            'filters': [],
            'services': [],
            'resources': ['ngResource'],
            'validations': [],
            'directives': [],
            'controllers': ['ngSanitize']
        });

        return {
            config: function(config) {
                if (angular.isDefined(config)) {
                    angular.extend(settings, config);
                }

                return settings;
            },

            ngName: function(suffix) {
                return settings.ngApp + '.' + suffix;
            },

            resourceUrl: function (uri) {
                return settings.apiUrl + uri + '.json';
            },

            mainModule: mainDependencies(),
            modules: modulesDependencies,

            on: function(eventName, callback) {
                events.on(eventName, callback);
                return this;
            },

            initAngular: function () {
                angular.forEach(modulesDependencies.keys(), function(resource) {
                    var moduleName = this.ngName(resource);
                    angular.module(moduleName, this.modules.get(resource));
                    this.mainModule.add(moduleName);
                }, this);

                this.ng = angular.module(settings.ngApp, this.mainModule.get());

                this.ng.config(['$httpProvider', function ($httpProvider) {
                    var csrfToken = angular.element('meta[name="csrf-token"]').attr('content');
                    $httpProvider.defaults.headers.common['X-CSRF-Token'] = csrfToken; 
                    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
                }]);
            },

            bootstrap: function() {
                angular.element(document).ready(function () {
                    try {
                        events.trigger('before.init');
                        angular.bootstrap(document, [settings.ngApp]);
                        events.trigger('after.init');
                        events.trigger('lazy.init');
                    } catch (e) {}
                });
            },

            init: function() {
                this.initAngular();
                this.bootstrap();

                return this;
            }
        }
    }

    window.app = window.app || new AngularApp();
}(window, window.document, window.angular));
