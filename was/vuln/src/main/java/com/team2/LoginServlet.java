package com.team2;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    private final ObjectMapper mapper = new ObjectMapper();

    static class LoginRequest {
        public String username;
        public String password;
    }

    static class LoginResponse {
        public String token;
        public String role;
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json; charset=UTF-8");

        LoginRequest body = mapper.readValue(request.getReader(), LoginRequest.class);
        String username = (body == null) ? null : body.username;
        String password = (body == null) ? null : body.password;

        String role = null;
        if ("admin".equals(username) && "admin123".equals(password)) role = "ADMIN";
        else if ("user".equals(username) && "user123".equals(password)) role = "USER";

        if (role == null) {
            response.setStatus(401);
            response.getWriter().write("{\"error\":\"로그인 실패\"}");
            return;
        }

        try {
            LoginResponse out = new LoginResponse();
            out.token = Jwt.sign(username, role);
            out.role = role;
            response.getWriter().write(mapper.writeValueAsString(out));
        } catch (Exception e) {
            throw new IOException(e);
        }

    }
}
