"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ShieldCheck, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [error, setError] = useState("");

  const generateCaptcha = useCallback(() => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      router.push("/");
    } else {
      generateCaptcha();
    }
  }, [router, generateCaptcha]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (parseInt(captcha) !== num1 + num2) {
      setError("Incorrect CAPTCHA. Please try again.");
      generateCaptcha();
      setCaptcha("");
      return;
    }
    const validUsers = {
      "dashboard@aspirelearning.app": "Dashboard@2025$",
      "user@aspirelreaning.app": "User@2025$",
    };

    if (validUsers[email] && validUsers[email] === password) {
      sessionStorage.setItem("isLoggedIn", "true");
      router.push("/"); 
    } else {
      setError("Invalid email or password.");
      generateCaptcha();
      setCaptcha("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Aspire Dashboard Login
          </CardTitle>
          <CardDescription>
            Please enter your credentials to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="captcha" className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Security Check: What is {num1} + {num2}?
              </Label>
              <Input
                id="captcha"
                type="number"
                placeholder="Enter the sum"
                required
                value={captcha}
                onChange={(e) => setCaptcha(e.target.value)}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center pt-2">{error}</p>
            )}
            <Button type="submit" className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
