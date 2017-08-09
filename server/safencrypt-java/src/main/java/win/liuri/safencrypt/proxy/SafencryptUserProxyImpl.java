package win.liuri.safencrypt.proxy;

import win.liuri.safencrypt.core.interfaces.SafencryptUserProxy;

public class SafencryptUserProxyImpl implements SafencryptUserProxy {

    @Override
    public boolean checkSignIn(String requestContent) {
        return false;
    }

    @Override
    public String getUTokenWithCToken(String cToken) {
        return null;
    }

    @Override
    public boolean signOut(String cToken) {
        return false;
    }
}
