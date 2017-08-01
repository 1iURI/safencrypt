package win.liuri.safencrypt.core.filter;

import org.springframework.web.filter.OncePerRequestFilter;
import win.liuri.safencrypt.core.wrapper.SafencryptRequestWrapper;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class SafencryptFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, FilterChain filterChain) throws ServletException, IOException {
        filterChain.doFilter(new SafencryptRequestWrapper(httpServletRequest), httpServletResponse);
    }

}
