package com.team2;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class Jwt {
    private static final String SECRET = System.getenv("JWT_SECRET");

    private static final Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder decoder = Base64.getUrlDecoder();


    private static final ObjectMapper MAPPER = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);


    public static class Claims {
        public String sub;
        public String role;
    }

    public static String sign(String username, String role) throws Exception {
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = "{\"sub\":\"" + username + "\",\"role\":\"" + role + "\"}";
        String h = encoder.encodeToString(header.getBytes(StandardCharsets.UTF_8));
        String p = encoder.encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signingInput = h + "." + p;
        String sig = encoder.encodeToString(hmac(signingInput));
        return signingInput + "." + sig;
    }

    public static Claims verify(String token){
        try{
            String[] parts = token.split("\\.");
            if(parts.length != 3){
                return null;
            }

            String signingInput = parts[0] + "." + parts[1];
            String expected = encoder.encodeToString(hmac(signingInput));
            if(!expected.equals(parts[2])){
                return null;
            }

            String payloadJson = new String(decoder.decode(parts[1]), StandardCharsets.UTF_8);
            return MAPPER.readValue(payloadJson, Claims.class);
        }catch (Exception e){
            return null;
        }
    }

    private static byte[] hmac(String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
    }

}
