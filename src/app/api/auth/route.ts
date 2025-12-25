import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'crypto';

// Generate simple UUID
function generateUserId(): string {
    return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function POST(request: NextRequest) {
    try {
        const { action, email, password, displayName, role } = await request.json();

        if (action === 'signup') {
            // Check if user exists
            const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
            if (existingUser) {
                return NextResponse.json({ error: 'User already exists' }, { status: 400 });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = generateUserId();

            // Create user
            db.prepare(`
        INSERT INTO users (userId, email, password, displayName, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, email, hashedPassword, displayName, role || 'student');

            const user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId) as any;

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            return NextResponse.json({
                success: true,
                user: userWithoutPassword
            });
        }

        if (action === 'login') {
            // Find user
            const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
            }

            // Update last login
            db.prepare('UPDATE users SET lastLoginAt = CURRENT_TIMESTAMP WHERE userId = ?').run(user.userId);

            // Remove password from response
            const { password: _, ...userWithoutPassword } = user;

            return NextResponse.json({
                success: true,
                user: userWithoutPassword
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Auth error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE userId = ?').get(userId) as any;
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
}
