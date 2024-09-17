import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import React from 'react';

export default function Home() {
  return (
    <div>
      <a href="/dashboard">Dashboard</a>
      <SignInButton></SignInButton>
      <SignOutButton></SignOutButton>
      <UserButton></UserButton>
    </div>
  );
}
