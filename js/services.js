/**
 * Created by Paul on 13.11.2014.
 */
app.factory('ConvertService', function () {


    function ltrim(str) {
        var chars = '0' || "\\s";
        var x = str.replace(new RegExp("^[" + chars + "]+", "g"), "");

        if (x.length == 0) {
            return '0';
        }
        else {
            return x;
        }
    }

    function lpad(str, len) {
        return Array(len + 1 - str.length).join('0') + str;
    }

    function enc(val) {

        var final = "";
        for (key in values) {

            if (val == parseInt(values[key])) {

                final = key;
            }

        }
        return final;
    }

    function dec(val) {
        val = String(val);
        return parseInt(values[val]);
    }

    function baseCmp(a, b) {
        if (a.length > b.length) {
            return 1;
        }
        else if (a.length < b.length) {
            return -1;
        }

        for (var i = 0; i < a.length; i++) {
            if (dec(a[i]) > dec(b[i])) {
                return 1;
            }
            else if (dec(a[i]) < dec(b[i])) {
                return -1;
            }
        }
        return 0;

    }

    /* Multiplies a by b in base. b must be 1 char long */
    this.baseMul = function (a, b, base) {
        a = String(a);
        b = dec(b);

        base = parseInt(base);

        var final = "";
        var carry = 0;
        var x;

        for (var i = a.length - 1; i >= 0; i--) {
            x = b * dec(a[i]) + carry;

            final = enc(x % base) + final;
            carry = Math.floor(x / base);
        }
        final = String(carry) + final;

        return ltrim(final);
    };

    /* Divides a by b. b must be 1 char long */
    this.baseDiv = function (a, b, base) {
        a = String(a);
        b = dec(b);

        base = parseInt(base);

        var final = "";
        var carry = 0;
        var x;

        for (var i = 0; i < a.length; i++) {
            x = base * carry + dec(a[i]);

            final = final + enc(Math.floor(x / b));
            carry = x % b;

        }

        return [ltrim(final), enc(carry)];
    };

    /* Subtracts from one number another in the same base */
    this.baseSub = function (a, b, base) {
        var cmp = baseCmp(a, b);
        var sign = 0;
        if (cmp < 0) {
            var tmp = a;
            a = b;
            b = tmp;
            sign = 1;
        }

        var mxl = Math.max(a.length, b.length);
        a = lpad(a, mxl);
        b = lpad(b, mxl);

        var carry = 0;
        var final = "";
        var x;
        for (var i = a.length - 1; i >= 0; i--) {
            x = dec(a[i]) - dec(b[i]) - carry;
            if (x < 0) {
                x += base;
                carry = 1;
            }
            else {
                carry = 0;
            }

            final = enc(x % base) + final;
        }
        if (sign == 1) {
            final = "-" + ltrim(final);
        }
        return final;
    };

    /* Adds to number in the same base */
    this.baseAdd = function (a, b, base) {
        var mxl = Math.max(a.length, b.length);
        a = lpad(a, mxl);
        b = lpad(b, mxl);

        var carry = 0;
        var final = "";
        var x;
        for (var i = a.length - 1; i >= 0; i--) {
            x = dec(a[i]) + dec(b[i]) + carry;

            final = enc(x % base) + final;
            carry = Math.floor(x / base);
        }

        if (carry > 0) {
            final = enc(carry) + final;
        }

        return ltrim(final);
    };

    /* Converts from higher base to lower base */
    this.baseConvertDiv = function (nr, from, to) {
        var final = "";
        nr = String(nr);
        var x;
        while (nr != "0") {

            x = this.baseDiv(nr, enc(to), from);
            final = String(x[1]) + final;

            nr = x[0];

        }
        return final;
    };

    /* Converts from lower base to higher base */
    this.baseConvertReplace = function (nr, from, to) {
        var final = "0";
        var pow = 1;

        for (var i = nr.length - 1; i >= 0; i--) {

            final = this.baseAdd(this.baseMul(pow, nr[i], to), final, to);

            pow = this.baseMul(pow, enc(from), to);
        }
        return final;
    };

    return this;

});

app.factory('ValidateService', function () {

    this.validate_nr = function (nr, base) {

        for (var i = 0; i < nr.length; i++) {
            if (typeof values[nr[i]] == 'undefined')
                return false;

            if (values[nr[i]] >= base)
                return false;
        }

        return true;
    };

    this.validate_base = function (base) {
        var x = parseInt(base);
        if (x != 'NaN') {
            if (x < 2 || x > 16)
                return false;
        }
        else {
            return false;
        }
        return true;
    }

    return this;
});