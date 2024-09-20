import { SignInButton } from '@clerk/nextjs';
import React from 'react';

export default function LogIn() {
    return <div style={{
        'width': '100%',
        'height': '100%',
        'alignItems': 'center',
        'justifyContent': 'center'
    }}>
        <SignInButton/>
    </div>;
}
