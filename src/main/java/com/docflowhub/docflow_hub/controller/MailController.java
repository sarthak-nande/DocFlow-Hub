package com.docflowhub.docflow_hub.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docflowhub.docflow_hub.service.EmailService;
import com.docflowhub.docflow_hub.versioning.ApiVersion;

@RestController
@ApiVersion(1)
@RequestMapping("/mail")
public class MailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/test")
    public String sendTestMail() {
        emailService.sendHtmlEmail(
            "sarthu102@gmail.com",
            "Spring Boot Gmail SMTP",
            buildWelcomeEmail("sarthu102@gmail.com", "845sdfsrhsd")
        );
        return "Mail Sent!";
    }
    
    public String buildWelcomeEmail(String username, String password) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f6f8;
                    padding: 20px;
                }
                .container {
                    max-width: 600px;
                    background: #ffffff;
                    margin: auto;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    color: #2c3e50;
                }
                .content {
                    margin-top: 20px;
                    color: #333;
                }
                .credentials {
                    background: #f1f3f5;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 15px;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    color: #777;
                    text-align: center;
                }
                .btn {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                }
            </style>
        </head>
        <body>

            <div class="container">
                <h2 class="header">Welcome to Our Platform 🎉</h2>

                <div class="content">
                    <p>Hi <b>%s</b>,</p>

                    <p>Your account has been successfully created. Below are your login details:</p>

                    <div class="credentials">
                        <p><b>Username:</b> %s</p>
                        <p><b>Password:</b> %s</p>
                    </div>

                    <p>Please login and change your password immediately for security reasons.</p>

                    <a href="http://localhost:3000/login" class="btn">Login Now</a>
                </div>

                <div class="footer">
                    <p>If you did not request this account, please ignore this email.</p>
                </div>
            </div>

        </body>
        </html>
        """.formatted(username, username, password);
    }
}