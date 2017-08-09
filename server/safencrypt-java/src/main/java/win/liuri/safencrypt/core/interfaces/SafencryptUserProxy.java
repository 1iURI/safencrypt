package win.liuri.safencrypt.core.interfaces;

public interface SafencryptUserProxy {

    /**
     * 判断登录是否成功的代理
     *
     * @param requestContent 登录请求的所有字符串
     * @return 登录是否成功的布尔值返回
     */
    boolean checkSignIn(String requestContent);

    /**
     * 通过CToken获取对应关联的UToken
     *
     * @param cToken 客户端的CToken
     * @return 该用户的对应UToken
     */
    String getUTokenWithCToken(String cToken);

    /**
     * 注销登录CToken与之关联的用户
     *
     * @param cToken 要注销的用户所关联的CToken
     * @return
     */
    boolean signOut(String cToken);

}
