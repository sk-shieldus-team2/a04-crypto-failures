package com.team2;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Db {
    private static final String URL = System.getenv("DB_URL");
    private static final String USER = System.getenv("APP_USER");
    private static final String PASSWORD = System.getenv("APP_USER_PASSWORD");

    public static Connection conn() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}