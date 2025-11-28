import React, { useState } from 'react';

// BUG 1: Inline styles instead of CSS modules
const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // BUG 2: No input sanitization - XSS vulnerability
    const handleSubmit = (e) => {
        e.preventDefault();
        document.getElementById('welcome').innerHTML = `Welcome ${username}!`;
    };

    // BUG 3: Password stored in state without encryption
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        localStorage.setItem('password', e.target.value); // BUG 4: Storing password in localStorage
    };

    // BUG 5: Missing accessibility attributes
    // BUG 6: No form validation
    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="text"  // BUG 7: Should be type="password"
                    value={password}
                    onChange={handlePasswordChange}
                />
                <button type="submit">Login</button>
            </form>
            <div id="welcome"></div>

            {/* BUG 8: Dangerously setting HTML */}
            <div dangerouslySetInnerHTML={{ __html: username }} />
        </div>
    );
};

export default LoginForm;
