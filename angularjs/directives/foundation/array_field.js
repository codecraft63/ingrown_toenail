(function (window, angular, app) {
    'use strict';

    var constant = {
        add_item_button_template: '<div class="small-12 columns"><span ng-click="addItem()" class="button tiny round"><i class="fi-plus"></i></span></div>',
        remove_function_template: 'removeItem(%index%)'
    };

    function directive ($compile, arrayFieldConfig) {
        var base_element, repository_items, item_template, model_name;

        var add_item_function = function(index, scope) {
            var output = item_template.replace(/%model%/g, model_name+'['+index+']');
            output = output.replace(/%remove_function%/g, arrayFieldConfig.remove_function_template);
            output = output.replace(/%index%/g, index);

            repository_items.append(output);
        }

        return {
            restrict: 'A',
            transclude: false,
            require: '?ngModel',
            compile: function(tElement, tAttrs, transclude) {
                base_element = tElement;
                item_template = tElement.html();
                model_name = tAttrs.ngModel;

                tElement.html('<div class="array-field-items"></div>' + arrayFieldConfig.add_item_button_template);

                repository_items = angular.element('.array-field-items', base_element);

                return function(scope, element, attrs, ctrls) {
                    scope.$watch(attrs.ngModel+ '.length', function(newVal, oldVal) {
                        repository_items.html('');

                        angular.forEach(ctrls.$viewValue, function(value, idx) {
                            add_item_function(idx, scope);
                        });

                        $compile(repository_items.contents())(scope);
                    });

                    scope.addItem = function() {
                        ctrls.$viewValue.push('');
                    }

                    scope.removeItem = function(index) {
                        ctrls.$viewValue.splice(index, 1);
                    };
                }
            }
        };
    }

    angular.module(app.ngName('directives'))
        .constant('arrayFieldConfig', constant)
        .directive('arrayField', ['$compile', 'arrayFieldConfig', directive]);
}(window, window.angular, window.app));
