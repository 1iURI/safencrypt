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
