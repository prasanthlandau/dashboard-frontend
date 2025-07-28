'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';

const validUsers: Record<string, string> = {
  "dashboard@aspirelearning.app": "Dash@2025$",
  "user@aspirelearning.app": "User@123",
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);

  useEffect(() => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(securityAnswer, 10) !== num1 + num2) {
      alert('Incorrect security check answer.');
      return;
    }
    const isValid = validUsers[email] === password;
    if (isValid) {
      sessionStorage.setItem("isLoggedIn", "true");
      window.location.href = "/dashboard";
    } else {
      alert('Invalid email or password.');
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Aspire Dashboard Login</CardTitle>
        <CardDescription>Please enter your credentials to access the dashboard.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
            <Label htmlFor="security-check">Security Check: What is {num1} + {num2}?</Label>
            <Input
              id="security-check"
              type="number"
              placeholder="Enter the sum"
              required
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            <LogIn className="mr-2 h-4 w-4" /> Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
