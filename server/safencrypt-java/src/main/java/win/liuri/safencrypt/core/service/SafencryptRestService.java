package win.liuri.safencrypt.core.service;

import org.apache.commons.codec.binary.Hex;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import win.liuri.safencrypt.core.Safencrypt;
import win.liuri.safencrypt.core.bean.ClientInfo;
import win.liuri.safencrypt.core.bean.SafencryptPublicKey;
import win.liuri.safencrypt.core.exception.FlagInvalidException;
import win.liuri.safencrypt.core.util.RSA;

import java.security.KeyPair;
import java.util.HashMap;
import java.util.Map;

@Service
public class SafencryptRestService {

    private static Map<String, KeyPair> keyPairPool;

    /**
     * 获取非对称密钥对存储池
     */
    public synchronized static Map<String, KeyPair> getKeyPairPool() {
        if (keyPairPool == null)
            keyPairPool = new HashMap<>();
        return keyPairPool;
    }

    /**
     * 申请公钥
     *
     * @return 返回公钥
     */
    public SafencryptPublicKey applyPublicKey() {
        // 创建一个非对称加密密钥对
        KeyPair keyPair = RSA.generateKeyPair();
        SafencryptPublicKey safencryptPublicKey = new SafencryptPublicKey(keyPair);
        getKeyPairPool().put(safencryptPublicKey.getFlag(), keyPair);
        return safencryptPublicKey;
    }

    /**
     * 注册客户端
     *
     * @param flag 公钥标识
     * @param data 客戶端信息数据体
     * @return
     */
    public Object signUpClient(String flag, String data) throws FlagInvalidException {
        data = data.replaceAll(" ", "");// 清除密文中的空格
        if (flag == null || flag.length() <= 0 || !getKeyPairPool().containsKey(flag))
            throw new FlagInvalidException();
        KeyPair keyPair = getKeyPairPool().get(flag);
        try {
            byte[] en_data = Hex.decodeHex(data.toCharArray());
            byte[] result_bytes = RSA.decrypt(keyPair.getPrivate(), en_data);
            // 解密获取浏览器标识
            String identifier = StringUtils.reverse(new String(result_bytes));
            ClientInfo clientInfo = new ClientInfo(identifier);
            Safencrypt.getClientProxy().addClient(clientInfo);

        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

}
