import React, { createContext, useState, useCallback } from 'react';

export const AuthContext = createContext();

const LOCAL_KEY = 'mfg_portal_user';

const MOCK_USERS = [
    { id: "u1", name: "Admin User", email: "admin@mfg.io", role: "Admin", permissions: ["all"] },
    { id: "u2", name: "Jane Engineer", email: "jane@mfg.io", role: "Engineer", permissions: ["view_assigned_projects", "edit_projects"] },
    { id: "u3", name: "Tom Viewer", email: "tom@mfg.io", role: "Viewer", permissions: ["view_all_projects"] },
    { id: "u4", name: "Client Acme", email: "acme@client.io", role: "Customer", permissions: ["view_own_projects"], allowed_project_ids: [1, 4] },
];

const getInitialUser = () => {
    try {
        const saved = localStorage.getItem(LOCAL_KEY);
        if (saved) return JSON.parse(saved);
    } catch (_) { }
    return null; // null = not logged in → show Login page
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getInitialUser);

    // Mock login: match against mock list, or build a custom user
    const login = useCallback(({ email, username, role }) => {
        const matched = MOCK_USERS.find(u => u.role === role) || {
            id: `u_custom_${Date.now()}`,
            name: username,
            email,
            role,
            permissions: role === 'Admin' ? ['all'] : role === 'Engineer' ? ['view_assigned_projects', 'edit_projects'] : ['view_all_projects'],
        };
        const loggedIn = { ...matched, name: username, email };
        localStorage.setItem(LOCAL_KEY, JSON.stringify(loggedIn));
        setUser(loggedIn);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(LOCAL_KEY);
        setUser(null);
    }, []);

    // Legacy helper kept for compatibility
    const switchUser = useCallback((userId) => {
        const found = MOCK_USERS.find(u => u.id === userId);
        if (found) {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(found));
            setUser(found);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, switchUser, mockUsers: MOCK_USERS }}>
            {children}
        </AuthContext.Provider>
    );
};
