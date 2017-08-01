/**
 * AES加密工具类
 * @constructor
 */
function AESUtils() {
}

/**
 * 加密数据
 * @param {type} data 待加密的字符串
 * @param {type} keyStr 秘钥
 * @param {type} ivStr 向量
 * @returns  加密后的数据
 */
AESUtils.encrypt = function (data, keyStr, ivStr) {
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
 *
 * @param {type} data BASE64的数据
 * @param {type} key 解密秘钥
 * @param {type} iv 向量
 * @return 解密后的数据
 */
AESUtils.decrypt = function (data, keyStr, ivStr) {
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    var iv = CryptoJS.enc.Utf8.parse(ivStr);
    //解密的是基于BASE64的数据，此处data是BASE64数据
    var decrypted = CryptoJS.AES.decrypt(data, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Iso10126});
    return decrypted.toString(CryptoJS.enc.Utf8);
};