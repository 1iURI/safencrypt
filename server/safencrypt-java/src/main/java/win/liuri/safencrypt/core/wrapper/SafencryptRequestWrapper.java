package win.liuri.safencrypt.core.wrapper;

import win.liuri.safencrypt.core.exception.EncryptRequestInvalidException;
import win.liuri.safencrypt.core.exception.FlagInvalidException;
import win.liuri.safencrypt.core.service.RSAEncryptService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.Vector;

public class SafencryptRequestWrapper extends HttpServletRequestWrapper {

    private Map<String, String[]> parameterMap;

    public SafencryptRequestWrapper(HttpServletRequest request) {
        super(request);
        try {
            parameterMap = decryptParameterMap(request.getParameterMap());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public String getParameter(String name) {
        String[] items = parameterMap.get(name);
        if (items == null || items.length <= 0)
            return null;
        else
            return items[0];
    }

    @Override
    public Map<String, String[]> getParameterMap() {
        return parameterMap;
    }

    @Override
    public Enumeration<String> getParameterNames() {
        Vector<String> vector = new Vector<>(parameterMap.keySet());
        return vector.elements();
    }

    @Override
    public String[] getParameterValues(String name) {
        return parameterMap.get(name);
    }

    /**
     * 解密请求参数map
     *
     * @param map 请求参数map
     * @return 解密后的map
     */
    private Map<String, String[]> decryptParameterMap(Map<String, String[]> map) throws EncryptRequestInvalidException, FlagInvalidException {
        Map<String, String[]> resultMap = new HashMap<>();
        if (!map.containsKey("type"))
            throw new EncryptRequestInvalidException();
        Integer type = Integer.valueOf(map.get("type")[0]);
        if (type == 1) {
            return map;
        } else if (type == 2) {
            String flag = map.get("flag")[0];
            String data = map.get("data")[0];
            resultMap.put("identifier", new String[]{RSAEncryptService.decryptJSRequest(flag, data)});
        } else if (type == 3) {
            return resultMap;
        } else {
            return resultMap;
        }
        return resultMap;
    }

}