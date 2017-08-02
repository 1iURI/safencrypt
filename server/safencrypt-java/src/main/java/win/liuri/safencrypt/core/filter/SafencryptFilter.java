package win.liuri.safencrypt.core.filter;

import win.liuri.safencrypt.core.bean.SafencryptResponse;
import win.liuri.safencrypt.core.exception.EncryptRequestInvalidException;
import win.liuri.safencrypt.core.service.SafencryptResponseService;
import win.liuri.safencrypt.core.wrapper.SafencryptRequestWrapper;
import win.liuri.safencrypt.core.wrapper.SafencryptResponseWrapper;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class SafencryptFilter implements Filter {

    private SafencryptResponseService responseService;

    public SafencryptResponseService getResponseService() {
        if (responseService == null)
            responseService = new SafencryptResponseService();
        return responseService;
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) servletRequest;
        HttpServletResponse httpServletResponse = (HttpServletResponse) servletResponse;
        // 替换响应对象为包装过的响应对象
        SafencryptResponseWrapper responseWrapper = new SafencryptResponseWrapper(httpServletResponse);
        filterChain.doFilter(new SafencryptRequestWrapper(httpServletRequest), responseWrapper);
        // 拿到正常的响应结果，并从请求中获取参数，准备加密响应
        String content = responseWrapper.getCaptureAsString();
        Integer type = Integer.valueOf(httpServletRequest.getParameter("type"));
        String flag = httpServletRequest.getParameter("flag");
        String resp = getResponseService().encryptResponse(content, type, flag);
        System.out.println("resp = " + resp);

        // 拿到加密后的响应值，写出给客户端
        httpServletResponse.setContentLength(resp.getBytes().length);
        PrintWriter writer = httpServletResponse.getWriter();
        writer.write(resp);
        writer.flush();
        writer.close();
    }

    @Override
    public void destroy() {

    }

}
