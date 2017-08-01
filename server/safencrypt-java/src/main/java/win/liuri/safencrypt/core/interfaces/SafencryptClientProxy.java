package win.liuri.safencrypt.core.interfaces;

import win.liuri.safencrypt.core.bean.ClientInfo;

public interface SafencryptClientProxy {

    /**
     * 添加客户端的代理函数
     *
     * @param clientInfo 客户端信息对象
     */
    void addClient(ClientInfo clientInfo);

}
