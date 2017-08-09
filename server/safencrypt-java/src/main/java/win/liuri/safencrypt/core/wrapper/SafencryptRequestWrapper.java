package win.liuri.safencrypt.core.wrapper;

import org.apache.commons.io.IOUtils;
import win.liuri.safencrypt.core.Safencrypt;
import win.liuri.safencrypt.core.exception.EncryptRequestInvalidException;
import win.liuri.safencrypt.core.exception.FlagInvalidException;
import win.liuri.safencrypt.core.service.RSAEncryptService;
import win.liuri.safencrypt.core.util.AES;

import javax.servlet.Servlet;
import javax.servlet.ServletInputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
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
//            parameterMap = request.getParameterMap();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public ServletInputStream getInputStream() throws IOException {
        return decryptInputStream(super.getInputStream());
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

    private ServletInputStream decryptInputStream(ServletInputStream servletInputStream) {
        try {
            String content = IOUtils.toString(servletInputStream, "UTF-8");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return servletInputStream;
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
        String flag = null;
        String data = null;
        if (type >= 2) {
            flag = map.get("flag")[0];
            data = map.get("data")[0];
        }
        if (type == 1) {
            return map;
        } else if (type == 2) {
            resultMap.put("identifier", new String[]{RSAEncryptService.decryptJSRequest(flag, data)});
        } else if (type == 3) {
            String identifier = Safencrypt.getClientProxy().getClientIdentifier(flag);
            String content = null;
            try {
                System.out.println("pre data = " + data);
                content = AES.decrypt(data, Safencrypt.getClientProxy().getClientIdentifier(flag));
                content = URLDecoder.decode(URLDecoder.decode(content, "UTF-8"), "UTF-8");
                for (String item : content.split("&")) {
                    Integer loc = item.indexOf("=");
                    resultMap.put(item.substring(0, loc), new String[]{item.substring(loc + 1)});
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        } else {
            return resultMap;
        }
        return resultMap;
    }

}