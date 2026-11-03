
package com.team2;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebServlet("/api/posts")
public class PostsServlet extends HttpServlet {
    private final ObjectMapper mapper = new ObjectMapper();

    // 메모리 저장소 (DB 붙기 전 임시). 모든 요청이 공유하도록 static.
    private static final List<Post> POSTS = new CopyOnWriteArrayList<>();
    private static final AtomicInteger SEQ = new AtomicInteger(0);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json; charset=UTF-8");
        resp.getWriter().write(mapper.writeValueAsString(POSTS));
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json; charset=UTF-8");

        String token = bearer(req);
        Jwt.Claims claims = (token == null) ? null : Jwt.verify(token);
        if (claims == null) {
            resp.setStatus(401);
            resp.getWriter().write("{\"error\":\"로그인 필요\"}");
            return;
        }

        PostReq body = mapper.readValue(req.getReader(), PostReq.class);
        Post post = new Post();
        post.id = SEQ.incrementAndGet();
        post.title = body.title;
        post.content = body.content;
        post.author = claims.sub;
        post.createdAt = LocalDate.now().toString();
        POSTS.add(0, post);

        resp.setStatus(201);
        resp.getWriter().write(mapper.writeValueAsString(post));
    }

    private String bearer(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h == null || !h.startsWith("Bearer ")) return null;
        return h.substring(7).trim();
    }

    static class Post    { public int id; public String title; public String content; public String author; public String createdAt; }
    static class PostReq { public String title; public String content; }
}
