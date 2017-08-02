function Safencrypt() {

    var CTOKEN_STORAGE_NAME = 'safencrypt_ctoken';
    var IDENTIFIER_STORAGE_NAME = 'safencrypt_identifier';
    var self = this;

    var REQ_TYPE_APPLY_PUBLIC_KEY = 1;
    var REQ_TYPE_SIGN_UP_CLIENT = 2;
    var REQ_TYPE_BASED_CLIENT = 3;
    var REQ_TYPE_BASED_USER = 4;

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
            console.log('data = ' + data);
            $.ajax({
                url: safencrypt_config.sign_up_client_url,
                type: 'POST',
                data: {
                    type: REQ_TYPE_SIGN_UP_CLIENT,
                    flag: flag,
                    data: data
                },
                success: function (data) {
                    console.log("注册客户端，服务器返回了：" + SAES.decrypt(data.data, self.getIdentifier()));

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
        var identifier = localStorage[IDENTIFIER_STORAGE_NAME];
        if (identifier === undefined || identifier.length <= 0) {
            identifier = 'xxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            self.log('创建新的浏览器标识：' + identifier);
        }
        localStorage[IDENTIFIER_STORAGE_NAME] = identifier;
        return identifier;
    };

    /**
     * 检测本地是否已经存储了CToken
     * @returns {boolean}
     */
    this.checkCToken = function () {
        var ctoken = localStorage[CTOKEN_STORAGE_NAME];
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
};
