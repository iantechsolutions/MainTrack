import { SignUpButton } from '@clerk/nextjs';
import React from 'react';

export default function SignUp() {
    return <div style={{
        'width': '100%',
        'height': '100%',
        'alignItems': 'center',
        'justifyContent': 'center'
    }}>
        <SignUpButton />
    </div>;
}
