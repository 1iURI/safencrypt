package win.liuri.safencrypt.core.wrapper;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.util.Enumeration;
import java.util.Map;
import java.util.Vector;

public class SafencryptRequestWrapper extends HttpServletRequestWrapper {

    private Map<String, String[]> parameterMap;

    public SafencryptRequestWrapper(HttpServletRequest request) {
        super(request);
        parameterMap = request.getParameterMap();
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
}