package com.team2;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/admin")
public class AdminServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json; charset=UTF-8");

        String token = bearer(req);
        if (token == null) { deny(resp, 401, "토큰 없음"); return; }

        Jwt.Claims claims = Jwt.verify(token);
        if (claims == null)               { deny(resp, 401, "서명 검증 실패"); return; }
        if (!"ADMIN".equals(claims.role)) { deny(resp, 403, "관리자 아님");  return; }

        // 관리자만 볼 수 있는 민감 정보 (예시)
        resp.getWriter().write(
                "{\"message\":\"관리자 페이지\",\"secret\":\"DB 접속정보 등 민감자료\",\"viewer\":\""
                        + claims.sub + "\"}");
    }

    private String bearer(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h == null || !h.startsWith("Bearer ")) return null;
        return h.substring(7).trim();
    }

    private void deny(HttpServletResponse resp, int status, String msg) throws IOException {
        resp.setStatus(status);
        resp.getWriter().write("{\"error\":\"" + msg + "\"}");
    }
}
