import { SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import React from 'react';
import { getBaseUrl } from '~/server/utils/other';

export default async function Home() {
  const url = `${getBaseUrl()}/api/app/v1/p/test`;
  let useAuth = auth();
  let token = await useAuth.getToken();
  console.log(url);
  console.log(token);

  const testHono = await (await fetch(url, { headers: [['Authorization', `Bearer ${await useAuth.getToken()}`]] })).text();
  console.log(testHono);

  return (
    <div>
      <a href="/dashboard">Dashboard {testHono}</a>
      <SignInButton></SignInButton>
      <SignOutButton></SignOutButton>
      <UserButton></UserButton>
    </div>
  );
}
