package win.liuri.safencrypt;

import com.google.gson.Gson;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class App {

    private class Test {
        private String a;
        private String b;

        public String getA() {
            return a;
        }

        public void setA(String a) {
            this.a = a;
        }

        public String getB() {
            return b;
        }

        public void setB(String b) {
            this.b = b;
        }
    }

    @RequestMapping("/client-msg")
    public Object client_msg(String msg) {
        System.out.println("client-msg: " + msg);
        return "{\"result\": \"hi, safencrypt have receive your client msg - " + msg + "\"}";
    }

    @RequestMapping("/user-msg")
    public Object user_msg(String msg) {
        System.out.println("user-msg: " + msg);
        return "{\"result\": \"hi, safencrypt have receive your user msg - " + msg + "\"}";
    }

    @RequestMapping("/non-encrypt-msg")
    public Object non_encrypt_msg(String msg) {
        System.out.println("non-encrypt-msg: " + msg);
        return "{\"result\": \"hi, safencrypt have receive your non_encrypt_msg - " + msg + "\"}";
    }

    @RequestMapping(value = "/put-info", method = RequestMethod.PUT)
    public Object put_info(@RequestBody Test test) {
        return new Gson().toJson(test);
    }


    // 测试环境的eureka地址： http://10.32.156.49:11111/eureka


}
