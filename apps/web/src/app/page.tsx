import React from "react";
import { DashScreen } from "~/components/screen";
// import { getBaseUrl } from '~/server/utils/other';

export default async function Home() {
  // const url = `${getBaseUrl()}/api/app/v1/p/test`;
  // let useAuth = auth();
  // let token = await useAuth.getToken();
  // console.log(url);
  // console.log(token);

  // const testHono = await (await fetch(url, { headers: [['Authorization', `Bearer ${await useAuth.getToken()}`]] })).text();
  // console.log(testHono);

  return (
    <DashScreen>
      <p>Hola</p>
      {/* <a href="/dashboard">Dashboard {testHono}</a> */}
      {/* <SignInButton></SignInButton>
      <SignOutButton></SignOutButton>
      <UserButton></UserButton> */}
    </DashScreen>
  );
}
