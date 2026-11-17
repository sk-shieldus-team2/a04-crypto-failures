package com.team2;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

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
        public long userId;
    }
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json; charset=UTF-8");

        LoginRequest body = mapper.readValue(request.getReader(), LoginRequest.class);
        String username = (body == null) ? null : body.username;
        String password = (body == null) ? null : body.password;

        String sql = "SELECT id, username, role FROM users WHERE username = '"
                + username + "' AND password = '" + password + "'";


        long userId = -1;
        String dbUser = null;
        String role = null;
        try (Connection connection = Db.conn();
             Statement stmt = connection.createStatement();
             ResultSet resultSet = stmt.executeQuery(sql)) {
            if (resultSet.next()) {
                userId = resultSet.getLong("id");
                dbUser = resultSet.getString("username");
                role = resultSet.getString("role");
            }
        } catch (Exception e) {
            throw new IOException(e);
        }

        if (role == null) {
            response.setStatus(401);
            response.getWriter().write("{\"error\":\"로그인 실패\"}");
            return;
        }

        try {
            LoginResponse out = new LoginResponse();
            out.token = Jwt.sign(dbUser, role);
            out.role = role;
            response.getWriter().write(mapper.writeValueAsString(out));
        } catch (Exception e) {
            throw new IOException(e);
        }
    }
}
