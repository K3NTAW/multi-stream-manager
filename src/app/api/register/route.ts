import { NextRequest, NextResponse } from "next/server";
import bcrypt from 'bcryptjs';
import { pgPool } from "../../../../server/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    const userExists = await pgPool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return NextResponse.json({ message: "User already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pgPool.query(
      'INSERT INTO users (id, name, email, password) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING id, email, name',
      [name, email, hashedPassword]
    );

    return NextResponse.json(newUser.rows[0], { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: "Something went wrong." }, { status: 500 });
  }
} 