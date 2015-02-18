/**
 * Created by Paul on 10.11.2014.
 */
app.controller('ConvertCtrl', function ($scope, ConvertService, ValidateService) {

    function parseOperation(text) {
        text = text.replace(/\s/g, '');
        var x = text.match(/(.*)\(([0-9]+)\)([+-/*])(.*)\(([0-9]+)\)=\?\(([0-9]+)\)$/);

        if (x == null) {
            return null;
        }
        var dts = {
            'a': {
                'value': x[1].toLowerCase(),
                'base': parseInt(x[2])
            },
            'b': {
                'value': x[4].toLowerCase(),
                'base': parseInt(x[5])
            },
            'op': x[3],
            'result_base': parseInt(x[6])
        };

        return dts;
    }

    function baseValidator(bases) {
        var ok = true;
        for (var i = 0; i < bases.length; i++) {
            if (!ValidateService.validate_base(bases[i])) {
                $scope.alerts.push('Invalid base ' + bases[i] + '.');
                ok = false;
            }
        }
        return ok;
    }

    function nrValidator(numbers) {
        var ok = true;
        for (var i = 0; i < numbers.length; i++) {
            if (!ValidateService.validate_nr(numbers[i][0], numbers[i][1])) {
                $scope.alerts.push('Invalid literal ' + numbers[i][0] + ' for base ' + numbers[i][1] + '.');
                ok = false;
            }

        }
        return ok;
    }

    function parseConversion(text) {
        text = text.replace(/\s/g, '');
        var x = text.match(/(.*)\(([0-9]+)\)=\?\(([0-9]+)\)$/);

        if (x == null) {
            return null;
        }

        return {
            'number': x[1],
            'base': x[2],
            'result_base': x[3]
        };
    }

    $scope.alerts = [];
    $scope.result = "";
    $scope.result_type = null;


    $scope.processStuff = function () {
        $scope.result_type = 0;
        $scope.alerts = [];
        var text = $scope.input.toLowerCase();
        if (text != null) {

            var operation = parseOperation(text);

            if (operation == null) {

                var conversion = parseConversion(text);
                if (conversion == null) {
                    $scope.alerts.push('Invalid syntax.');
                }
                else {

                    var bases_valid = baseValidator([conversion.base, conversion.result_base]);
                    if (bases_valid)
                        var nr_valid = nrValidator([
                            [conversion.number, conversion.base]
                        ]);

                    if (bases_valid && nr_valid) {
                        $scope.result_type = 2;

                        $scope.acfrom = conversion.number;
                        $scope.acbase = conversion.base;

                        $scope.basefnl = conversion.result_base;

                        if (conversion.base < conversion.result_base) {
                            $scope.result = ConvertService.baseConvertDiv(conversion.number, conversion.base, conversion.result_base);
                        }
                        else {
                            $scope.result = ConvertService.baseConvertReplace(conversion.number, conversion.base, conversion.result_base);
                        }

                    }
                }
            }
            else {
                var bases_valid = baseValidator([operation.result_base, operation.a.base, operation.b.base]);
                if (bases_valid)
                    var nr_valid = nrValidator([
                        [operation.a.value, operation.a.base],
                        [operation.b.value, operation.b.base]
                    ]);

                if (bases_valid && nr_valid) {
                    $scope.result_type = 1;

                    var a = operation.a.value;
                    var b = operation.b.value;

                    $scope.acfrom = operation.a.value;
                    $scope.acbase = operation.a.base;

                    $scope.bcfrom = operation.b.value;
                    $scope.bcbase = operation.b.base;

                    if (operation.a.base > operation.result_base) {
                        a = ConvertService.baseConvertDiv(a, operation.a.base, operation.result_base);
                    }
                    else {
                        a = ConvertService.baseConvertReplace(a, operation.a.base, operation.result_base);
                    }

                    if (operation.b.base > operation.result_base) {
                        b = ConvertService.baseConvertDiv(b, operation.b.base, operation.result_base);
                    }
                    else {
                        b = ConvertService.baseConvertReplace(b, operation.b.base, operation.result_base);
                    }

                    $scope.afnl = a;
                    $scope.bfnl = b;
                    $scope.basefnl = operation.result_base;

                    $scope.sign = operation.op;
                    if (operation.op == '+') {
                        $scope.result = ConvertService.baseAdd(a, b, operation.result_base);
                    }
                    else if (operation.op == '-') {
                        $scope.result = ConvertService.baseSub(a, b, operation.result_base);
                    }
                    else if (operation.op == '*') {
                        if (b.length > 1) {
                            $scope.result_type = 0;
                            $scope.alerts.push("Can't multiply with more than one digit.");
                        }
                        $scope.result = ConvertService.baseMul(a, b, operation.result_base);
                    }
                    else if (operation.op == '/') {

                        if (b.length > 1) {
                            $scope.result_type = 0;
                            $scope.alerts.push("Can't divide with more than one digit.");
                        }
                        var x = ConvertService.baseDiv(a, b, operation.result_base);
                        $scope.result = x[0];
                        $scope.remainder = x[1];
                    }
                }

            }

        }
    }
});