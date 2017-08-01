package win.liuri.safencrypt;

import org.apache.commons.codec.binary.Hex;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import win.liuri.safencrypt.core.util.RSA;

import java.security.interfaces.RSAPublicKey;
import java.util.HashMap;

@SpringBootApplication
@RestController
public class App {

    @RequestMapping("/hello")
    public Object greeting() {
        RSAPublicKey publicKey = RSA.getDefaultPublicKey();
        String modulus = new String(Hex.encodeHex(publicKey.getModulus().toByteArray()));
        String exponent = new String(Hex.encodeHex(publicKey.getPublicExponent().toByteArray()));
        HashMap<String , String> result = new HashMap<>();
        result.put("modulus" , modulus);
        result.put("exponent" , exponent);
        return result;
    }

    @RequestMapping("/request")
    public Object req(String data) {
        data = data.replaceAll(" ","");
        System.out.println("data = " + data);
        String result = RSA.decryptStringByJs(data);
        System.out.println("result = " + result);
        return result;

    }

    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

}
