package win.liuri.safencrypt.proxy;

import win.liuri.safencrypt.core.bean.ClientInfo;
import win.liuri.safencrypt.core.interfaces.SafencryptClientProxy;

public class SafencryptClientProxyImpl implements SafencryptClientProxy {

    @Override
    public void addClient(ClientInfo clientInfo) {

    }

    @Override
    public String getClientIdentifier(String cToken) {
        return "1234567890123456";
    }
}
