import { db } from '../lib/db'

// Test data
const testUser = {
  email: 'test@student.edu',
  password: 'TestPass123',
  name: 'Test Student',
}

const invalidUser = {
  email: 'invalid@student.edu',
  password: 'WrongPass123',
  name: 'Invalid User',
}

async function testAuthAPI() {
  console.log('🔐 Testing Authentication API...')
  
  const baseUrl = 'http://localhost:3000/api/auth'
  let authToken = ''

  try {
    // Test 1: Register new user
    console.log('\n1️⃣ Testing user registration...')
    const registerResponse = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })

    const registerData = await registerResponse.json()
    console.log('Register Response:', registerData)

    if (registerData.success) {
      console.log('✅ Registration successful')
      authToken = registerData.data.token
    } else {
      console.log('❌ Registration failed:', registerData.error)
    }

    // Test 2: Try to register duplicate user
    console.log('\n2️⃣ Testing duplicate registration...')
    const duplicateResponse = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    })

    const duplicateData = await duplicateResponse.json()
    console.log('Duplicate Response:', duplicateData)

    if (!duplicateData.success && duplicateData.status === 409) {
      console.log('✅ Duplicate registration properly rejected')
    } else {
      console.log('❌ Duplicate registration should have been rejected')
    }

    // Test 3: Login with valid credentials
    console.log('\n3️⃣ Testing login with valid credentials...')
    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password,
      }),
    })

    const loginData = await loginResponse.json()
    console.log('Login Response:', loginData)

    if (loginData.success) {
      console.log('✅ Login successful')
      authToken = loginData.data.token
    } else {
      console.log('❌ Login failed:', loginData.error)
    }

    // Test 4: Login with invalid credentials
    console.log('\n4️⃣ Testing login with invalid credentials...')
    const invalidLoginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: 'WrongPassword',
      }),
    })

    const invalidLoginData = await invalidLoginResponse.json()
    console.log('Invalid Login Response:', invalidLoginData)

    if (!invalidLoginData.success && invalidLoginData.status === 401) {
      console.log('✅ Invalid login properly rejected')
    } else {
      console.log('❌ Invalid login should have been rejected')
    }

    // Test 5: Get current user (authenticated)
    console.log('\n5️⃣ Testing get current user...')
    const meResponse = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Cookie': `auth-token=${authToken}`,
      },
    })

    const meData = await meResponse.json()
    console.log('Me Response:', meData)

    if (meData.success) {
      console.log('✅ Get current user successful')
    } else {
      console.log('❌ Get current user failed:', meData.error)
    }

    // Test 6: Get current user without token
    console.log('\n6️⃣ Testing get current user without token...')
    const noTokenResponse = await fetch(`${baseUrl}/me`, {
      method: 'GET',
    })

    const noTokenData = await noTokenResponse.json()
    console.log('No Token Response:', noTokenData)

    if (!noTokenData.success && noTokenData.status === 401) {
      console.log('✅ Unauthenticated request properly rejected')
    } else {
      console.log('❌ Unauthenticated request should have been rejected')
    }

    // Test 7: Logout
    console.log('\n7️⃣ Testing logout...')
    const logoutResponse = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Cookie': `auth-token=${authToken}`,
      },
    })

    const logoutData = await logoutResponse.json()
    console.log('Logout Response:', logoutData)

    if (logoutData.success) {
      console.log('✅ Logout successful')
    } else {
      console.log('❌ Logout failed:', logoutData.error)
    }

    console.log('\n🎉 Authentication API testing completed!')

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Test database operations
async function testDatabaseAuth() {
  console.log('\n🗄️ Testing Database Authentication Operations...')

  try {
    // Test password hashing
    const bcrypt = require('bcryptjs')
    const password = 'TestPass123'
    const hashedPassword = await bcrypt.hash(password, 12)
    const isValid = await bcrypt.compare(password, hashedPassword)
    
    console.log('Password hashing test:', isValid ? '✅ Passed' : '❌ Failed')

    // Test user creation
    const { createUser, findUserByEmail, verifyPassword } = require('../lib/auth')
    
    const testUserData = {
      email: 'dbtest@student.edu',
      password: 'TestPass123',
      name: 'DB Test User',
    }

    const user = await createUser(testUserData)
    console.log('User creation test:', user ? '✅ Passed' : '❌ Failed')

    const foundUser = await findUserByEmail(testUserData.email)
    console.log('User lookup test:', foundUser ? '✅ Passed' : '❌ Failed')

    const passwordValid = await verifyPassword(testUserData.password, foundUser.password)
    console.log('Password verification test:', passwordValid ? '✅ Passed' : '❌ Failed')

    // Clean up test user
    await db.user.delete({ where: { email: testUserData.email } })
    console.log('✅ Test user cleaned up')

  } catch (error) {
    console.error('❌ Database test error:', error)
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Authentication Backend Tests...\n')
  
  await testDatabaseAuth()
  await testAuthAPI()
  
  console.log('\n✨ All tests completed!')
  process.exit(0)
}

runAllTests().catch(console.error)
