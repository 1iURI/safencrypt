package win.liuri.safencrypt.core;

import win.liuri.safencrypt.core.exception.DelegateInvalidException;
import win.liuri.safencrypt.core.interfaces.SafencryptClientProxy;
import win.liuri.safencrypt.core.interfaces.SafencryptUserProxy;

import java.util.UUID;

public class Safencrypt {

    private static SafencryptClientProxy clientProxy;
    private static SafencryptUserProxy userProxy;

    private Safencrypt() {
    }

    public synchronized static void init(SafencryptClientProxy clientProxy, SafencryptUserProxy userProxy) throws DelegateInvalidException {
        if (clientProxy == null || userProxy == null)
            throw new DelegateInvalidException();
        Safencrypt.clientProxy = clientProxy;
        Safencrypt.userProxy = userProxy;
    }

    /**
     * 随机生成一个UToken字符串
     *
     * @return 刚刚生成的UToken字符串
     */
    public static String generateUToken() {
        return UUID.randomUUID().toString();
    }

    public static SafencryptClientProxy getClientProxy() {
        return clientProxy;
    }

    public static SafencryptUserProxy getUserProxy() {
        return userProxy;
    }
}
