(function() {
    angular.module('angular.chips', [])
        .directive('chips', Chips)
        .controller('chipsController', ChipsController);

    function isPromiseLike(obj) {
        return obj && angular.isFunction(obj.then);
    }

    function Chips($compile, $timeout, DomUtil) {

        function linkFun(scope, iElement, iAttrs, ngModelCtrl) {
            if ((error = validation(iElement)) !== undefined) {
                throw error;
            }
            /*addChips method should be called by input control. pls check the input_control.js*/
            scope.chips.addChip = function(data) {
                var modified;
                scope.render !== undefined ? modified = scope.render({ data: data }) : modified = data;
                isPromiseLike(modified) ? modified.then(update) : update();

                function update() {
                    scope.chips.list.push(modified);
                    ngModelCtrl.$setViewValue(scope.chips.list);
                }
            };
            /*removeChips method should be called by input control. pls check the input_control.js*/
            scope.chips.deleteChip = function(index) {
                scope.chips.list.splice(index, 1);
                ngModelCtrl.$setViewValue(scope.chips.list);
            }

            ngModelCtrl.$render = function() {
                scope.chips.list = angular.copy(ngModelCtrl.$modelValue);
            }

            /*Below code will extract the chip-tmpl and compile inside the chips directive scope*/
            var rootDiv = angular.element('<div></div>');
            var tmpl = iElement.find('chip-tmpl').remove();
            tmpl.attr('ng-repeat', 'chip in chips.list track by $index');
            rootDiv.append(tmpl);
            var node = $compile(rootDiv)(scope);
            iElement.prepend(node);

            iElement.on('click', function(event) {
                if (event.target.nodeName === 'CHIPS')
                    iElement.find('input')[0].focus();
            });

            DomUtil(iElement).addClass('chip-out-focus');
        }

        return {
            restrict: 'E',
            scope: {
                /*optional callback, this will be called before rendering the data, user can modify the data before it's rendered*/
                render: '&?'
            },
            transclude: true,
            require: 'ngModel',
            link: linkFun,
            controller: 'chipsController',
            controllerAs: 'chips',
            template: '<div ng-transclude></div>'
        }

    };
    /* <chip-tmpl> tag is mandatory added validation to confirm that*/
    function validation(element) {
        var error;
        if (element.find('chip-tmpl').length === 0) {
            error = 'should have chip-tmpl';
        } else {
            if (element.children().length > 1) {
                error = 'should have only one chip-tmpl';
            } else if (element.children().length < 1) {
                error = 'should have one chip-tmpl';
            }
        }
        return error;
    }

    function ChipsController($scope, $element, DomUtil) {
        /*get call back method from parent scope*/
        function getCallBack(callBack) {
            var target = $scope.$parent;
            if (callBack !== undefined) {
                if (callBack.split('.').length > 1) {
                    var levels = callBack.split('.');
                    for (var index = 0; index < levels.length; index++) {
                        target = target[levels[index]];
                    }
                } else {
                    target = target[callBack];
                }
            }
            return target;
        }
        /*toggling input controller focus*/
        this.setFocus = function(flag) {
                if (flag) {
                    DomUtil($element).removeClass('chip-out-focus').addClass('chip-in-focus');
                } else {
                    DomUtil($element).removeClass('chip-in-focus').addClass('chip-out-focus');
                }
            }
            /*chip will be removed if call back method return true*/
        this.removeChip = function(data, index) {
            var deleteChip = getCallBack(DomUtil($element).attr('remove-chip')[0])(data);
            if (deleteChip) {
                this.deleteChip(index);
            }
        }
    }
})();

(function() {
    angular.module('angular.chips')
        .factory('DomUtil', function() {
            return DomUtil;
        });
    /*Dom related functionality*/
    function DomUtil(element) {
        /*
         * addclass will append class to the given element
         * ng-class will do the same functionality, in our case
         * we don't have access to scope so we are using this util methods
         */
        var utilObj = {};

        utilObj.addClass = function(className) {
            utilObj.removeClass(element, className);
            element.attr('class', element.attr('class') + ' ' + className);
            return utilObj;
        };

        utilObj.removeClass = function(className) {
            var classes = element.attr('class').split(' ');
            var classIndex = classes.indexOf(className);
            if (classIndex !== -1) {
                classes.splice(classIndex, 1);
            }
            element.attr('class', classes.join(' '));
            return utilObj;
        };

        utilObj.attr = function(attrName) {
            function hasAttribute(element, attrName) {
                var result = element.attr(attrName)
                if (result !== undefined)
                    return result

                if (element.children().length > 0) {
                    return hasAttribute(element.children(), attrName);
                } else {
                    return result;
                }
            }

            return angular.extend([hasAttribute(element, attrName)], utilObj);
        };

        return utilObj;
    }
})();

(function(){
	angular.module('angular.chips')
	.directive('removeChip',RemoveChip);

	function RemoveChip(){
		return{
			restrict: 'A',
			require: '^chips',
			link: function(scope, iElement, iAttrs, chipsCtrl){
				iElement.on('click',function(event){
					chipsCtrl.removeChip(scope.chip,scope.$index);
				});
			}
		}
	}	
})();
(function() {
    angular.module('angular.chips')
        .directive('chipControl', ChipControl);

    function ChipControl() {
        return {
            restrict: 'A',
            require: '^chips',
            link: ChipControlLinkFun,
        }
    };

    function ChipControlLinkFun(scope, iElement, iAttrs, chipsCtrl) {
        iElement.on('keypress', function(event) {
            if (event.keyIdentifier === 'Enter') {
                chipsCtrl.addChip(event.target.value);
                event.target.value = "";
            }
        });
        iElement.on('focusin', function() {
            chipsCtrl.setFocus(true);
        });
        iElement.on('focusout', function() {
            chipsCtrl.setFocus(false);
        });
    };
})();

(function(module) {
try { module = angular.module("angular.chips"); }
catch(err) { module = angular.module("angular.chips", []); }
module.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("src/templates/chip.tmpl.html",
    "<!-- <div ng-transclude ng-repeat=\"name in chips.list\"> -->\n" +
    "<div ng-transclude>\n" +
    "</div>");
}]);
})();