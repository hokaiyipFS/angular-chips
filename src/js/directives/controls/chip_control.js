(function() {
    angular.module('angular.chips')
        .directive('chipControl', ChipControl);

    /*
     * It's for normal input element
     * It send the value to chips directive when press the enter button
     */
    function ChipControl() {
        return {
            restrict: 'A',
            require: '^chips',
            link: ChipControlLinkFun,
        }
    };
    /*@ngInject*/
    function ChipControlLinkFun(scope, iElement, iAttrs, chipsCtrl) {
        iElement.on('keypress', function(event) {
          if (( event.keyCode === 13 ||  // enter
                event.keyCode === 59 || // semicolon
                event.keyCode === 32 || // space
                event.keyCode === 44 ) // comma
                && event.target.value !== '') {
                chipsCtrl.addChip(event.target.value);
                event.target.value = "";
                event.preventDefault();
            }
        });

        iElement.on('focus', function() {
            chipsCtrl.setFocus(true);
        });
        iElement.on('blur', function() {
            chipsCtrl.setFocus(false);
            if (event.target.value !== '') {
                chipsCtrl.addChip(event.target.value);
                event.target.value = "";
            }
        });
    };
})();
