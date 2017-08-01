function Safencrypt() {

    var CTOKEN_COOKIE_NAME = 'safencrypt_ctoken';
    var IDENTIFIER_COOKIE_NAME = 'safencrypt_identifier';
    var self = this;

    /**
     * 申请非对称加密公钥
     */
    this.applyPublicKey = function (callback) {
        this.log('正在向服务器端申请公钥...');
        $.ajax({
            url: safencrypt_config.apply_public_key_url,
            type: 'GET',
            success: function (data) {
                self.log('获取公钥成功，FLAG = ' + data.flag);
                callback(data.modulus, data.exponent, data.flag);
            },
            error: function (err) {
                self.error('获取公钥失败，无法连接至服务器端');
            }
        })
    };

    /**
     * 注册客户端
     */
    this.signUpClient = function (signUpClientSuccess, signUpClientFailed) {
        this.log('准备向服务器端注册当前浏览器客户端...');
        this.applyPublicKey(function (modulus, exponent, flag) {
            self.log('开始向服务器端发起注册客户端请求...');
            var key = RSAUtils.getKeyPair(exponent, '', modulus);
            var data = RSAUtils.encryptedString(key, self.getIdentifier());
            $.ajax({
                url: safencrypt_config.sign_up_client_url,
                type: 'POST',
                data: {
                    flag: flag,
                    data: data
                },
                success: function (data) {

                },
                error: function (err) {

                }
            })
        });
    };

    /**
     * 获取浏览器标识
     */
    this.getIdentifier = function () {
        var identifier = self.getCookie(IDENTIFIER_COOKIE_NAME);
        if (identifier === null || identifier.length <= 0)
            identifier = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        self.setCookie(IDENTIFIER_COOKIE_NAME, identifier, 365);
        return identifier;
    };

    /**
     * 检测本地是否已经存储了CToken
     * @returns {boolean}
     */
    this.checkCToken = function () {
        var ctoken = this.getCookie(CTOKEN_COOKIE_NAME);
        return ctoken !== null && ctoken.length > 0;
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

    this.getCookie = function (c_name) {//获取cookie
        var c_start, c_end;
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start !== -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end === -1) {
                    c_end = document.cookie.length
                }
                return unescape(document.cookie.substring(c_start, c_end))
            }
        }
        return ""
    };

    this.setCookie = function (c_name, value, expireDays) {//设置cookie
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expireDays);
        document.cookie = c_name
            + "="
            + escape(value)
            + ((expireDays == null) ? "" : ";expires="
                + exdate.toGMTString());
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
};
