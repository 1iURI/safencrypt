/**
 * AES加密工具类
 * @constructor
 */
function SAES() {
}

/**
 * 加密数据
 * @param {type} data 待加密的字符串
 * @param {type} keyStr 秘钥
 * @param {type} ivStr 向量
 * @returns  {string}加密后的数据
 */
SAES.aesEncrypt = function (data, keyStr, ivStr) {
    var sendData = CryptoJS.enc.Utf8.parse(data);
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    var iv = CryptoJS.enc.Utf8.parse(ivStr);
    var encrypted = CryptoJS.AES.encrypt(sendData, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Iso10126
    });
    //return CryptoJS.enc.Base64.stringify(encrypted.toString(CryptoJS.enc.Utf8));
    return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
};

/**
 * AES加密
 * @param data
 * @param keyStr
 * @return {string}加密后的数据
 */
SAES.encrypt = function (data, keyStr) {
    return this.aesEncrypt(data, keyStr, keyStr);
};

/**
 *
 * @param {type} data BASE64的数据
 * @param {type} key 解密秘钥
 * @param {type} iv 向量
 * @return {string} 解密后的数据
 */
SAES.aesDecrypt = function (data, keyStr, ivStr) {
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    var iv = CryptoJS.enc.Utf8.parse(ivStr);
    //解密的是基于BASE64的数据，此处data是BASE64数据
    var decrypted = CryptoJS.AES.decrypt(data, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Iso10126});
    return decrypted.toString(CryptoJS.enc.Utf8);
};

/**
 * AES解密
 * @param data
 * @param keyStr
 * @return {string} 解密后的数据
 */
SAES.decrypt = function (data, keyStr) {
    return this.aesDecrypt(data, keyStr, keyStr);
};


!function (obj) {
    obj.safencrypt_ajax_inject = function (funs) {
        window._ahrealxhr = window._ahrealxhr || XMLHttpRequest;
        XMLHttpRequest = function () {
            this.xhr = new window._ahrealxhr;
            for (var attr in this.xhr) {
                var type = "";
                try {
                    type = typeof this.xhr[attr]
                } catch (e) {
                }
                if (type === "function") {
                    this[attr] = hookFunc(attr);
                } else {
                    Object.defineProperty(this, attr, {
                        get: getFactory(attr),
                        set: setFactory(attr)
                    })
                }
            }
        };

        function getFactory(attr) {
            return function () {
                return this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
            }
        }

        function setFactory(attr) {
            return function (f) {
                var xhr = this.xhr;
                var that = this;
                if (attr.indexOf("on") != 0) {
                    this[attr + "_"] = f;
                    return;
                }
                if (funs[attr]) {
                    xhr[attr] = function () {
                        funs[attr](that) || f.apply(xhr, arguments);
                    }
                } else {
                    xhr[attr] = f;
                }
            }
        }

        function hookFunc(fun) {
            return function () {
                var args = [].slice.call(arguments);
                if (funs[fun] && funs[fun].call(this, args, this.xhr)) {
                    return;
                }
                return this.xhr[fun].apply(this.xhr, args);
            }
        }

        return window._ahrealxhr;
    };
    obj.unHookAjax = function () {
        if (window._ahrealxhr) XMLHttpRequest = window._ahrealxhr;
        window._ahrealxhr = undefined;
    }
}(window);

/**
 * 加密待发送的数据
 * @param url 发送的url
 * @param data 要发送的数据
 * @return {*} 加密后的数据
 */
function encryptSendData(url, data) {

    function monitor_log(msg) {
        console.log('%c [Safencrypt Monitor] ' + msg + ' -  %c √ Safencrypt已对本次请求进行安全保护 ^_^ %O', 'font-size:16px;color:rgba(22,119,210,255);', 'font-size:12px;color:rgba(9,187,7,255)', url);
    }

    /**
     * 判断是否是基于客户端的请求
     */
    function isBaseOnClient(url) {
        for (var i = 0; i < safencrypt_config.base_on_client_urls.length; i++) {
            var c_url = safencrypt_config.base_on_client_urls[i];
            if (url.indexOf(c_url) >= 0)
                return true;
        }
        return false;
    }

    /**
     * 判断是否为不加密的请求
     */
    function isNonEncrypt(url) {
        for (var i = 0; i < safencrypt_config.non_encrypt_urls.length; i++) {
            var n_url = safencrypt_config.non_encrypt_urls[i];
            if (url.indexOf(n_url) >= 0)
                return true;
        }
        return false;
    }

    var sf = new Safencrypt();
    var ctoken = localStorage[sf.CTOKEN_STORAGE_NAME];
    var identifier = localStorage[sf.IDENTIFIER_STORAGE_NAME];
    var utoken = localStorage[sf.UTOKEN_STORAGE_NAME];

    if (url.indexOf(safencrypt_config.apply_public_key_url) >= 0) {
        // 申请公钥
        monitor_log('监测到【申请公钥串】的请求');
    }
    else if (url.indexOf(safencrypt_config.sign_up_client_url) >= 0) {
        // 注册客户端
        monitor_log('监测到【注册客户端】的请求');
    }
    else if (isBaseOnClient(url)) {
        // 基于客户端的请求
        monitor_log('监测到【基于客户端】的请求');
        var result = "type=" + sf.REQ_TYPE_BASED_CLIENT + "&flag=" + ctoken + "&data=" + encodeURIComponent(SAES.encrypt(data, identifier));
        return result;
    }
    else if (isNonEncrypt(url)) {
        // 不加密的请求
        return result;
    }
    else {
        // 基于用户相关的请求
        var result = "tyoe=" + sf.REQ_TYPE_BASED_USER + "&flag=" + ctoken + "&data=" + encodeURIComponent(SAES.encrypt(data, utoken));
    }
    return data;
}

// 自动解密响应结果
function decryptResponse(data) {
    data = JSON.parse(data);
    var sf = new Safencrypt();
    var ctoken = localStorage[sf.CTOKEN_STORAGE_NAME];
    var identifier = localStorage[sf.IDENTIFIER_STORAGE_NAME];
    if (data.type === 3)
    // 基于客户端的请求 响应
        return SAES.decrypt(data.data, identifier);
    else
        return data;
}

// 自动修改safencrypt的请求pt的请求
(function (send) {
    XMLHttpRequest.prototype.send = function (data) {
        this.setRequestHeader("content-type", "application/x-www-form-urlencoded;charset=utf-8");
        send.call(this, encryptSendData(this.safencrypt_url, data));
    };
})(XMLHttpRequest.prototype.send);

// 自动解密safencrypt的密文响应
safencrypt_ajax_inject({
    onload: function (xhr) {
        xhr.responseText = decryptResponse(xhr.responseText);
    },
    open: function (arg, xhr) {
        xhr.safencrypt_url = arg[1];
    }
});

(function ($w) {

    if (typeof $w.SRSA === 'undefined')
        var SRSA = $w.SRSA = {};

    var biRadixBase = 2;
    var biRadixBits = 16;
    var bitsPerDigit = biRadixBits;
    var biRadix = 1 << 16; // = 2^16 = 65536
    var biHalfRadix = biRadix >>> 1;
    var biRadixSquared = biRadix * biRadix;
    var maxDigitVal = biRadix - 1;
    var maxInteger = 9999999999999998;

    var maxDigits;
    var ZERO_ARRAY;
    var bigZero, bigOne;

    var BigInt = $w.BigInt = function (flag) {
        if (typeof flag == "boolean" && flag == true) {
            this.digits = null;
        } else {
            this.digits = ZERO_ARRAY.slice(0);
        }
        this.isNeg = false;
    };

    SRSA.setMaxDigits = function (value) {
        maxDigits = value;
        ZERO_ARRAY = new Array(maxDigits);
        for (var iza = 0; iza < ZERO_ARRAY.length; iza++) ZERO_ARRAY[iza] = 0;
        bigZero = new BigInt();
        bigOne = new BigInt();
        bigOne.digits[0] = 1;
    };
    SRSA.setMaxDigits(20);

    var dpl10 = 15;

    SRSA.biFromNumber = function (i) {
        var result = new BigInt();
        result.isNeg = i < 0;
        i = Math.abs(i);
        var j = 0;
        while (i > 0) {
            result.digits[j++] = i & maxDigitVal;
            i = Math.floor(i / biRadix);
        }
        return result;
    };

//lr10 = 10 ^ dpl10
    var lr10 = SRSA.biFromNumber(1000000000000000);

    SRSA.biFromDecimal = function (s) {
        var isNeg = s.charAt(0) == '-';
        var i = isNeg ? 1 : 0;
        var result;
        // Skip leading zeros.
        while (i < s.length && s.charAt(i) == '0') ++i;
        if (i == s.length) {
            result = new BigInt();
        }
        else {
            var digitCount = s.length - i;
            var fgl = digitCount % dpl10;
            if (fgl == 0) fgl = dpl10;
            result = SRSA.biFromNumber(Number(s.substr(i, fgl)));
            i += fgl;
            while (i < s.length) {
                result = SRSA.biAdd(SRSA.biMultiply(result, lr10),
                    SRSA.biFromNumber(Number(s.substr(i, dpl10))));
                i += dpl10;
            }
            result.isNeg = isNeg;
        }
        return result;
    };

    SRSA.biCopy = function (bi) {
        var result = new BigInt(true);
        result.digits = bi.digits.slice(0);
        result.isNeg = bi.isNeg;
        return result;
    };

    SRSA.reverseStr = function (s) {
        var result = "";
        for (var i = s.length - 1; i > -1; --i) {
            result += s.charAt(i);
        }
        return result;
    };

    var hexatrigesimalToChar = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z'
    ];

    SRSA.biToString = function (x, radix) { // 2 <= radix <= 36
        var b = new BigInt();
        b.digits[0] = radix;
        var qr = SRSA.biDivideModulo(x, b);
        var result = hexatrigesimalToChar[qr[1].digits[0]];
        while (SRSA.biCompare(qr[0], bigZero) == 1) {
            qr = SRSA.biDivideModulo(qr[0], b);
            digit = qr[1].digits[0];
            result += hexatrigesimalToChar[qr[1].digits[0]];
        }
        return (x.isNeg ? "-" : "") + SRSA.reverseStr(result);
    };

    SRSA.biToDecimal = function (x) {
        var b = new BigInt();
        b.digits[0] = 10;
        var qr = SRSA.biDivideModulo(x, b);
        var result = String(qr[1].digits[0]);
        while (SRSA.biCompare(qr[0], bigZero) == 1) {
            qr = SRSA.biDivideModulo(qr[0], b);
            result += String(qr[1].digits[0]);
        }
        return (x.isNeg ? "-" : "") + SRSA.reverseStr(result);
    };

    var hexToChar = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f'];

    SRSA.digitToHex = function (n) {
        var mask = 0xf;
        var result = "";
        for (i = 0; i < 4; ++i) {
            result += hexToChar[n & mask];
            n >>>= 4;
        }
        return SRSA.reverseStr(result);
    };

    SRSA.biToHex = function (x) {
        var result = "";
        var n = SRSA.biHighIndex(x);
        for (var i = SRSA.biHighIndex(x); i > -1; --i) {
            result += SRSA.digitToHex(x.digits[i]);
        }
        return result;
    };

    SRSA.charToHex = function (c) {
        var ZERO = 48;
        var NINE = ZERO + 9;
        var littleA = 97;
        var littleZ = littleA + 25;
        var bigA = 65;
        var bigZ = 65 + 25;
        var result;

        if (c >= ZERO && c <= NINE) {
            result = c - ZERO;
        } else if (c >= bigA && c <= bigZ) {
            result = 10 + c - bigA;
        } else if (c >= littleA && c <= littleZ) {
            result = 10 + c - littleA;
        } else {
            result = 0;
        }
        return result;
    };

    SRSA.hexToDigit = function (s) {
        var result = 0;
        var sl = Math.min(s.length, 4);
        for (var i = 0; i < sl; ++i) {
            result <<= 4;
            result |= SRSA.charToHex(s.charCodeAt(i));
        }
        return result;
    };

    SRSA.biFromHex = function (s) {
        var result = new BigInt();
        var sl = s.length;
        for (var i = sl, j = 0; i > 0; i -= 4, ++j) {
            result.digits[j] = SRSA.hexToDigit(s.substr(Math.max(i - 4, 0), Math.min(i, 4)));
        }
        return result;
    };

    SRSA.biFromString = function (s, radix) {
        var isNeg = s.charAt(0) == '-';
        var istop = isNeg ? 1 : 0;
        var result = new BigInt();
        var place = new BigInt();
        place.digits[0] = 1; // radix^0
        for (var i = s.length - 1; i >= istop; i--) {
            var c = s.charCodeAt(i);
            var digit = SRSA.charToHex(c);
            var biDigit = SRSA.biMultiplyDigit(place, digit);
            result = SRSA.biAdd(result, biDigit);
            place = SRSA.biMultiplyDigit(place, radix);
        }
        result.isNeg = isNeg;
        return result;
    };

    SRSA.biDump = function (b) {
        return (b.isNeg ? "-" : "") + b.digits.join(" ");
    };

    SRSA.biAdd = function (x, y) {
        var result;

        if (x.isNeg != y.isNeg) {
            y.isNeg = !y.isNeg;
            result = SRSA.biSubtract(x, y);
            y.isNeg = !y.isNeg;
        }
        else {
            result = new BigInt();
            var c = 0;
            var n;
            for (var i = 0; i < x.digits.length; ++i) {
                n = x.digits[i] + y.digits[i] + c;
                result.digits[i] = n % biRadix;
                c = Number(n >= biRadix);
            }
            result.isNeg = x.isNeg;
        }
        return result;
    };

    SRSA.biSubtract = function (x, y) {
        var result;
        if (x.isNeg != y.isNeg) {
            y.isNeg = !y.isNeg;
            result = SRSA.biAdd(x, y);
            y.isNeg = !y.isNeg;
        } else {
            result = new BigInt();
            var n, c;
            c = 0;
            for (var i = 0; i < x.digits.length; ++i) {
                n = x.digits[i] - y.digits[i] + c;
                result.digits[i] = n % biRadix;
                // Stupid non-conforming modulus operation.
                if (result.digits[i] < 0) result.digits[i] += biRadix;
                c = 0 - Number(n < 0);
            }
            // Fix up the negative sign, if any.
            if (c == -1) {
                c = 0;
                for (var i = 0; i < x.digits.length; ++i) {
                    n = 0 - result.digits[i] + c;
                    result.digits[i] = n % biRadix;
                    // Stupid non-conforming modulus operation.
                    if (result.digits[i] < 0) result.digits[i] += biRadix;
                    c = 0 - Number(n < 0);
                }
                // Result is opposite sign of arguments.
                result.isNeg = !x.isNeg;
            } else {
                // Result is same sign.
                result.isNeg = x.isNeg;
            }
        }
        return result;
    };

    SRSA.biHighIndex = function (x) {
        var result = x.digits.length - 1;
        while (result > 0 && x.digits[result] == 0) --result;
        return result;
    };

    SRSA.biNumBits = function (x) {
        var n = SRSA.biHighIndex(x);
        var d = x.digits[n];
        var m = (n + 1) * bitsPerDigit;
        var result;
        for (result = m; result > m - bitsPerDigit; --result) {
            if ((d & 0x8000) != 0) break;
            d <<= 1;
        }
        return result;
    };

    SRSA.biMultiply = function (x, y) {
        var result = new BigInt();
        var c;
        var n = SRSA.biHighIndex(x);
        var t = SRSA.biHighIndex(y);
        var u, uv, k;

        for (var i = 0; i <= t; ++i) {
            c = 0;
            k = i;
            for (j = 0; j <= n; ++j, ++k) {
                uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
                result.digits[k] = uv & maxDigitVal;
                c = uv >>> biRadixBits;
                //c = Math.floor(uv / biRadix);
            }
            result.digits[i + n + 1] = c;
        }
        // Someone give me a logical xor, please.
        result.isNeg = x.isNeg != y.isNeg;
        return result;
    };

    SRSA.biMultiplyDigit = function (x, y) {
        var n, c, uv;

        result = new BigInt();
        n = SRSA.biHighIndex(x);
        c = 0;
        for (var j = 0; j <= n; ++j) {
            uv = result.digits[j] + x.digits[j] * y + c;
            result.digits[j] = uv & maxDigitVal;
            c = uv >>> biRadixBits;
            //c = Math.floor(uv / biRadix);
        }
        result.digits[1 + n] = c;
        return result;
    };

    SRSA.arrayCopy = function (src, srcStart, dest, destStart, n) {
        var m = Math.min(srcStart + n, src.length);
        for (var i = srcStart, j = destStart; i < m; ++i, ++j) {
            dest[j] = src[i];
        }
    };

    var highBitMasks = [0x0000, 0x8000, 0xC000, 0xE000, 0xF000, 0xF800,
        0xFC00, 0xFE00, 0xFF00, 0xFF80, 0xFFC0, 0xFFE0,
        0xFFF0, 0xFFF8, 0xFFFC, 0xFFFE, 0xFFFF];

    SRSA.biShiftLeft = function (x, n) {
        var digitCount = Math.floor(n / bitsPerDigit);
        var result = new BigInt();
        SRSA.arrayCopy(x.digits, 0, result.digits, digitCount,
            result.digits.length - digitCount);
        var bits = n % bitsPerDigit;
        var rightBits = bitsPerDigit - bits;
        for (var i = result.digits.length - 1, i1 = i - 1; i > 0; --i, --i1) {
            result.digits[i] = ((result.digits[i] << bits) & maxDigitVal) |
                ((result.digits[i1] & highBitMasks[bits]) >>>
                    (rightBits));
        }
        result.digits[0] = ((result.digits[i] << bits) & maxDigitVal);
        result.isNeg = x.isNeg;
        return result;
    };

    var lowBitMasks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
        0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
        0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF];

    SRSA.biShiftRight = function (x, n) {
        var digitCount = Math.floor(n / bitsPerDigit);
        var result = new BigInt();
        SRSA.arrayCopy(x.digits, digitCount, result.digits, 0,
            x.digits.length - digitCount);
        var bits = n % bitsPerDigit;
        var leftBits = bitsPerDigit - bits;
        for (var i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
            result.digits[i] = (result.digits[i] >>> bits) |
                ((result.digits[i1] & lowBitMasks[bits]) << leftBits);
        }
        result.digits[result.digits.length - 1] >>>= bits;
        result.isNeg = x.isNeg;
        return result;
    };

    SRSA.biMultiplyByRadixPower = function (x, n) {
        var result = new BigInt();
        SRSA.arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
        return result;
    };

    SRSA.biDivideByRadixPower = function (x, n) {
        var result = new BigInt();
        SRSA.arrayCopy(x.digits, n, result.digits, 0, result.digits.length - n);
        return result;
    };

    SRSA.biModuloByRadixPower = function (x, n) {
        var result = new BigInt();
        SRSA.arrayCopy(x.digits, 0, result.digits, 0, n);
        return result;
    };

    SRSA.biCompare = function (x, y) {
        if (x.isNeg != y.isNeg) {
            return 1 - 2 * Number(x.isNeg);
        }
        for (var i = x.digits.length - 1; i >= 0; --i) {
            if (x.digits[i] != y.digits[i]) {
                if (x.isNeg) {
                    return 1 - 2 * Number(x.digits[i] > y.digits[i]);
                } else {
                    return 1 - 2 * Number(x.digits[i] < y.digits[i]);
                }
            }
        }
        return 0;
    };

    SRSA.biDivideModulo = function (x, y) {
        var nb = SRSA.biNumBits(x);
        var tb = SRSA.biNumBits(y);
        var origYIsNeg = y.isNeg;
        var q, r;
        if (nb < tb) {
            // |x| < |y|
            if (x.isNeg) {
                q = SRSA.biCopy(bigOne);
                q.isNeg = !y.isNeg;
                x.isNeg = false;
                y.isNeg = false;
                r = biSubtract(y, x);
                // Restore signs, 'cause they're references.
                x.isNeg = true;
                y.isNeg = origYIsNeg;
            } else {
                q = new BigInt();
                r = SRSA.biCopy(x);
            }
            return [q, r];
        }

        q = new BigInt();
        r = x;

        // Normalize Y.
        var t = Math.ceil(tb / bitsPerDigit) - 1;
        var lambda = 0;
        while (y.digits[t] < biHalfRadix) {
            y = SRSA.biShiftLeft(y, 1);
            ++lambda;
            ++tb;
            t = Math.ceil(tb / bitsPerDigit) - 1;
        }
        // Shift r over to keep the quotient constant. We'll shift the
        // remainder back at the end.
        r = SRSA.biShiftLeft(r, lambda);
        nb += lambda; // Update the bit count for x.
        var n = Math.ceil(nb / bitsPerDigit) - 1;

        var b = SRSA.biMultiplyByRadixPower(y, n - t);
        while (SRSA.biCompare(r, b) != -1) {
            ++q.digits[n - t];
            r = SRSA.biSubtract(r, b);
        }
        for (var i = n; i > t; --i) {
            var ri = (i >= r.digits.length) ? 0 : r.digits[i];
            var ri1 = (i - 1 >= r.digits.length) ? 0 : r.digits[i - 1];
            var ri2 = (i - 2 >= r.digits.length) ? 0 : r.digits[i - 2];
            var yt = (t >= y.digits.length) ? 0 : y.digits[t];
            var yt1 = (t - 1 >= y.digits.length) ? 0 : y.digits[t - 1];
            if (ri == yt) {
                q.digits[i - t - 1] = maxDigitVal;
            } else {
                q.digits[i - t - 1] = Math.floor((ri * biRadix + ri1) / yt);
            }

            var c1 = q.digits[i - t - 1] * ((yt * biRadix) + yt1);
            var c2 = (ri * biRadixSquared) + ((ri1 * biRadix) + ri2);
            while (c1 > c2) {
                --q.digits[i - t - 1];
                c1 = q.digits[i - t - 1] * ((yt * biRadix) | yt1);
                c2 = (ri * biRadix * biRadix) + ((ri1 * biRadix) + ri2);
            }

            b = SRSA.biMultiplyByRadixPower(y, i - t - 1);
            r = SRSA.biSubtract(r, SRSA.biMultiplyDigit(b, q.digits[i - t - 1]));
            if (r.isNeg) {
                r = SRSA.biAdd(r, b);
                --q.digits[i - t - 1];
            }
        }
        r = SRSA.biShiftRight(r, lambda);
        // Fiddle with the signs and stuff to make sure that 0 <= r < y.
        q.isNeg = x.isNeg != origYIsNeg;
        if (x.isNeg) {
            if (origYIsNeg) {
                q = SRSA.biAdd(q, bigOne);
            } else {
                q = SRSA.biSubtract(q, bigOne);
            }
            y = SRSA.biShiftRight(y, lambda);
            r = SRSA.biSubtract(y, r);
        }
        // Check for the unbelievably stupid degenerate case of r == -0.
        if (r.digits[0] == 0 && SRSA.biHighIndex(r) == 0) r.isNeg = false;

        return [q, r];
    };

    SRSA.biDivide = function (x, y) {
        return SRSA.biDivideModulo(x, y)[0];
    };

    SRSA.biModulo = function (x, y) {
        return SRSA.biDivideModulo(x, y)[1];
    };

    SRSA.biMultiplyMod = function (x, y, m) {
        return SRSA.biModulo(SRSA.biMultiply(x, y), m);
    };

    SRSA.biPow = function (x, y) {
        var result = bigOne;
        var a = x;
        while (true) {
            if ((y & 1) != 0) result = SRSA.biMultiply(result, a);
            y >>= 1;
            if (y == 0) break;
            a = SRSA.biMultiply(a, a);
        }
        return result;
    };

    SRSA.biPowMod = function (x, y, m) {
        var result = bigOne;
        var a = x;
        var k = y;
        while (true) {
            if ((k.digits[0] & 1) != 0) result = SRSA.biMultiplyMod(result, a, m);
            k = SRSA.biShiftRight(k, 1);
            if (k.digits[0] == 0 && SRSA.biHighIndex(k) == 0) break;
            a = SRSA.biMultiplyMod(a, a, m);
        }
        return result;
    };


    $w.BarrettMu = function (m) {
        this.modulus = SRSA.biCopy(m);
        this.k = SRSA.biHighIndex(this.modulus) + 1;
        var b2k = new BigInt();
        b2k.digits[2 * this.k] = 1; // b2k = b^(2k)
        this.mu = SRSA.biDivide(b2k, this.modulus);
        this.bkplus1 = new BigInt();
        this.bkplus1.digits[this.k + 1] = 1; // bkplus1 = b^(k+1)
        this.modulo = BarrettMu_modulo;
        this.multiplyMod = BarrettMu_multiplyMod;
        this.powMod = BarrettMu_powMod;
    };

    function BarrettMu_modulo(x) {
        var $dmath = SRSA;
        var q1 = $dmath.biDivideByRadixPower(x, this.k - 1);
        var q2 = $dmath.biMultiply(q1, this.mu);
        var q3 = $dmath.biDivideByRadixPower(q2, this.k + 1);
        var r1 = $dmath.biModuloByRadixPower(x, this.k + 1);
        var r2term = $dmath.biMultiply(q3, this.modulus);
        var r2 = $dmath.biModuloByRadixPower(r2term, this.k + 1);
        var r = $dmath.biSubtract(r1, r2);
        if (r.isNeg) {
            r = $dmath.biAdd(r, this.bkplus1);
        }
        var rgtem = $dmath.biCompare(r, this.modulus) >= 0;
        while (rgtem) {
            r = $dmath.biSubtract(r, this.modulus);
            rgtem = $dmath.biCompare(r, this.modulus) >= 0;
        }
        return r;
    }

    function BarrettMu_multiplyMod(x, y) {
        /*
        x = this.modulo(x);
        y = this.modulo(y);
        */
        var xy = SRSA.biMultiply(x, y);
        return this.modulo(xy);
    }

    function BarrettMu_powMod(x, y) {
        var result = new BigInt();
        result.digits[0] = 1;
        var a = x;
        var k = y;
        while (true) {
            if ((k.digits[0] & 1) != 0) result = this.multiplyMod(result, a);
            k = SRSA.biShiftRight(k, 1);
            if (k.digits[0] == 0 && SRSA.biHighIndex(k) == 0) break;
            a = this.multiplyMod(a, a);
        }
        return result;
    }

    var RSAKeyPair = function (encryptionExponent, decryptionExponent, modulus) {
        var $dmath = SRSA;
        this.e = $dmath.biFromHex(encryptionExponent);
        this.d = $dmath.biFromHex(decryptionExponent);
        this.m = $dmath.biFromHex(modulus);
        // We can do two bytes per digit, so
        // chunkSize = 2 * (number of digits in modulus - 1).
        // Since biHighIndex returns the high index, not the number of digits, 1 has
        // already been subtracted.
        this.chunkSize = 2 * $dmath.biHighIndex(this.m);
        this.radix = 16;
        this.barrett = new $w.BarrettMu(this.m);
    };

    SRSA.getKeyPair = function (encryptionExponent, decryptionExponent, modulus) {
        return new RSAKeyPair(encryptionExponent, decryptionExponent, modulus);
    };

    if (typeof $w.twoDigit === 'undefined') {
        $w.twoDigit = function (n) {
            return (n < 10 ? "0" : "") + String(n);
        };
    }

// Altered by Rob Saunders (rob@robsaunders.net). New routine pads the
// string after it has been converted to an array. This fixes an
// incompatibility with Flash MX's ActionScript.
    SRSA.encryptedString = function (key, s) {
        var a = [];
        var sl = s.length;
        var i = 0;
        while (i < sl) {
            a[i] = s.charCodeAt(i);
            i++;
        }

        while (a.length % key.chunkSize != 0) {
            a[i++] = 0;
        }

        var al = a.length;
        var result = "";
        var j, k, block;
        for (i = 0; i < al; i += key.chunkSize) {
            block = new BigInt();
            j = 0;
            for (k = i; k < i + key.chunkSize; ++j) {
                block.digits[j] = a[k++];
                block.digits[j] += a[k++] << 8;
            }
            var crypt = key.barrett.powMod(block, key.e);
            var text = key.radix == 16 ? SRSA.biToHex(crypt) : SRSA.biToString(crypt, key.radix);
            result += text + " ";
        }
        return result.substring(0, result.length - 1); // Remove last space.
    };

    SRSA.decryptedString = function (key, s) {
        var blocks = s.split(" ");
        var result = "";
        var i, j, block;
        for (i = 0; i < blocks.length; ++i) {
            var bi;
            if (key.radix == 16) {
                bi = SRSA.biFromHex(blocks[i]);
            }
            else {
                bi = SRSA.biFromString(blocks[i], key.radix);
            }
            block = key.barrett.powMod(bi, key.d);
            for (j = 0; j <= SRSA.biHighIndex(block); ++j) {
                result += String.fromCharCode(block.digits[j] & 255,
                    block.digits[j] >> 8);
            }
        }
        // Remove trailing null, if any.
        if (result.charCodeAt(result.length - 1) == 0) {
            result = result.substring(0, result.length - 1);
        }
        return result;
    };

    SRSA.setMaxDigits(130);

})(window);
function Safencrypt() {

    this.CTOKEN_STORAGE_NAME = 'safencrypt_ctoken';
    this.IDENTIFIER_STORAGE_NAME = 'safencrypt_identifier';
    this.UTOKEN_STORAGE_NAME = 'safencrypt_utoken';
    var self = this;

    var REQ_TYPE_APPLY_PUBLIC_KEY = 1;
    var REQ_TYPE_SIGN_UP_CLIENT = 2;
    this.REQ_TYPE_BASED_CLIENT = 3;
    this.REQ_TYPE_BASED_USER = 4;

    /**
     * 申请非对称加密公钥
     */
    this.applyPublicKey = function (callback) {
        this.log('正在向服务器端申请公钥...');
        $.ajax({
            url: safencrypt_config.apply_public_key_url,
            type: 'GET',
            data: {
                type: REQ_TYPE_APPLY_PUBLIC_KEY
            },
            success: function (data) {
                self.log('获取公钥成功，FLAG = ' + data.flag);
                callback(data.modulus, data.exponent, data.flag);
            },
            error: function (err) {
                self.error('获取公钥失败，无法连接至服务器端');
            }
        });
    };

    /**
     * 注册客户端
     */
    this.signUpClient = function (signUpClientSuccess, signUpClientFailed) {
        this.log('准备向服务器端注册当前浏览器客户端...');
        this.applyPublicKey(function (modulus, exponent, flag) {
            self.log('开始向服务器端发起注册客户端请求...');
            var key = SRSA.getKeyPair(exponent, '', modulus);
            var data = SRSA.encryptedString(key, self.getIdentifier());
            $.ajax({
                url: safencrypt_config.sign_up_client_url,
                type: 'POST',
                data: {
                    type: REQ_TYPE_SIGN_UP_CLIENT,
                    flag: flag,
                    data: data
                },
                success: function (data) {
                    // 得到服务器返回的对象
                    var response = JSON.parse(SAES.decrypt(data.data, self.getIdentifier()));
                    // 存储ctoken到本地
                    localStorage[self.CTOKEN_STORAGE_NAME] = response.ctoken;
                    self.log('注册服务器端成功，CTOKEN = ' + response.ctoken + '。激活【注册客户端成功】回调函数');
                },
                error: function (err) {
                    self.error('注册客户端失败，无法连接到服务器端。激活【注册客户端失败】回调函数');
                    signUpClientFailed();
                }
            })
        });
    };

    /**
     * 获取浏览器标识
     */
    this.getIdentifier = function () {
        var identifier = localStorage[self.IDENTIFIER_STORAGE_NAME];
        if (identifier === undefined || identifier.length <= 0) {
            identifier = 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            self.log('创建新的浏览器标识：' + identifier);
        }
        localStorage[self.IDENTIFIER_STORAGE_NAME] = identifier;
        return identifier;
    };

    /**
     * 检测本地是否已经存储了CToken
     * @returns {boolean}
     */
    this.checkCToken = function () {
        var ctoken = localStorage[self.CTOKEN_STORAGE_NAME];
        return ctoken !== undefined && ctoken.length > 0;
    };

    /**
     * 输出Safencrypt格式的日志
     * @param msg
     */
    this.log = function (msg) {
        console.log('%c [Safencrypt] ' + msg, 'font-size:20px;color:#228B22;');
    };

    /**
     * 输出Safencrypt格式的错误日志
     * @param msg
     */
    this.error = function (msg) {
        console.log('%c [Safencrypt] ' + msg, 'font-size:20px;color:red;');
    };

}

/**
 * 启动Safencrypt安全机制
 */
Safencrypt.startUp = function (signUpClientSuccess, signUpClientFailed) {
    var self = new Safencrypt();
    self.log('正在启动中...[author:1iURI]');
    if (!self.checkCToken()) {// 本地没有ctoken
        self.error('检测到当前浏览器未注册至服务器端，启动客户端注册机制...');
        self.signUpClient(signUpClientSuccess, signUpClientFailed);
    }
    else {
        // 本地有Ctoken
        self.log('启动成功。当前浏览器已经在服务器端注册完毕。');
    }
};

/**
 * 存储UToken到本地
 * @param utoken uToken字符串
 */
Safencrypt.saveUToken = function (utoken) {
    localStorage[new Safencrypt().UTOKEN_STORAGE_NAME] = utoken;
};
