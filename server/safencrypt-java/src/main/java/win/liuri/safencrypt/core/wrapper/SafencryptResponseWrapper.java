package win.liuri.safencrypt.core.wrapper;

import javax.servlet.ServletOutputStream;
import javax.servlet.WriteListener;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.Writer;

public class SafencryptResponseWrapper extends HttpServletResponseWrapper {

    private SafencryptWriter mWriter;
    private SafencryptOutputStream mOutputStream;

    public SafencryptResponseWrapper(HttpServletResponse response) {
        super(response);
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        mWriter = new SafencryptWriter(super.getWriter());
        return mWriter;
    }

    @Override
    public ServletOutputStream getOutputStream() throws IOException {
        mOutputStream = new SafencryptOutputStream(super.getOutputStream());
        return mOutputStream;
    }

    public SafencryptWriter getmWriter() {
        return mWriter;
    }

    public SafencryptOutputStream getmOutputStream() {
        return mOutputStream;
    }

    /**
     * 加密用writer
     */
    private class SafencryptWriter extends PrintWriter {
        private StringBuilder builder;

        public SafencryptWriter(Writer out) {
            super(out);
            builder = new StringBuilder();
        }

        @Override
        public void write(int c) {
            super.write(c);
        }

        @Override
        public void write(char[] buf, int off, int len) {
            char[] dest = new char[len];
            System.arraycopy(buf, off, dest, 0, len);
            builder.append(dest);
        }

        @Override
        public void write(char[] buf) {
            super.write(buf);
        }

        @Override
        public void write(String s, int off, int len) {
            super.write(s, off, len);
        }

        @Override
        public void write(String s) {
            super.write(s);
        }

        public String getContent() {
            return builder.toString();
        }

    }

    private class SafencryptOutputStream extends ServletOutputStream {

        private ServletOutputStream outputStream;

        public SafencryptOutputStream(ServletOutputStream outputStream) {
            this.outputStream = outputStream;
        }

        @Override
        public boolean isReady() {
            return outputStream.isReady();
        }

        @Override
        public void setWriteListener(WriteListener writeListener) {
            outputStream.setWriteListener(writeListener);
        }

        @Override
        public void write(int b) throws IOException {
            outputStream.write(b);
        }

        @Override
        public void write(byte[] b) throws IOException {
            super.write(b);
        }

        @Override
        public void write(byte[] b, int off, int len) throws IOException {
            super.write(b, off, len);
        }
    }


}
