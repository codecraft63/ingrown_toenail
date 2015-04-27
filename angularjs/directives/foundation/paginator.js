(function (angular, app) {
    'use strict';

    var constant = {
            boundaryLinks: true,
            directionLinks: true,
            firstText: '«',
            lastText: '»'
        };

    function directive(paginationConfig) {
        return {
            restrict: 'EA',
            scope: {
                numPages: '=',
                currentPage: '=',
                maxSize: '=',
                onSelectPage: '&'
            },
            template: '<ul class="pagination"><li ng-repeat="page in pages" ng-class="{current: page.active, unavailable: page.disabled}"><a ng-click="selectPage(page.number)">{{page.text}}</a></li></ul>',
            replace: true,
            link: function(scope, element, attrs) {
                window.page = scope;
                // Setup configuration parameters
                var boundaryLinks = angular.isDefined(attrs.boundaryLinks) ? scope.$eval(attrs.boundaryLinks) : paginationConfig.boundaryLinks;
                var firstText = angular.isDefined(attrs.firstText) ? attrs.firstText : paginationConfig.firstText;
                var lastText = angular.isDefined(attrs.lastText) ? attrs.lastText : paginationConfig.lastText;

                // Create page object used in template
                function makePage(number, text, isActive, isDisabled) {
                    return {
                        number: number,
                        text: text,
                        active: isActive,
                        disabled: isDisabled
                    };
                }

                scope.$watch('numPages + currentPage + maxSize', function() {
                    scope.pages = [];
                    scope.currentPage = parseInt(scope.currentPage);

                    // Default page limits
                    var startPage = 1, endPage = scope.numPages;

                    // recompute if maxSize
                    if ( scope.maxSize && scope.maxSize < scope.numPages ) {
                        startPage = Math.max(scope.currentPage - Math.floor(scope.maxSize/2), 1);
                        endPage   = startPage + scope.maxSize - 1;

                        // Adjust if limit is exceeded
                        if (endPage > scope.numPages) {
                            endPage   = scope.numPages;
                            startPage = endPage - scope.maxSize + 1;
                        }
                    }

                    // Add page number links
                    for (var number = startPage; number <= endPage; number++) {
                        var page = makePage(number, number, scope.isActive(number), false);
                        scope.pages.push(page);
                    }

                    // Add first & last links
                    if (boundaryLinks) {
                        if (scope.currentPage > 1) {
                            var firstPage = makePage(1, firstText, false, scope.noPrevious());
                            scope.pages.unshift(firstPage);
                        }

                        if (scope.currentPage < scope.numPages) {
                            var lastPage = makePage(scope.numPages, lastText, false, scope.noNext());
                            scope.pages.push(lastPage);
                        }
                    }


                    if ( scope.currentPage > scope.numPages ) {
                        scope.selectPage(scope.numPages);
                    }
                });

                scope.noPrevious = function() {
                    return scope.currentPage === 1;
                };

                scope.noNext = function() {
                    return scope.currentPage === scope.numPages;
                };

                scope.isActive = function(page) {
                    return scope.currentPage === page;
                };

                scope.selectPage = function(page) {
                    if ( ! scope.isActive(page) && page > 0 && page <= scope.numPages) {
                        scope.currentPage = page;
                        scope.$parent.$emit('select_page', page);
                    }
                };
            }
        };
    }

    angular.module(app.ngName('directives'))
        .constant('paginationConfig', constant)
        .directive('pagination', ['paginationConfig', directive]);
}(window.angular, window.app));