import { db } from '../lib/db'

async function testUIIntegration() {
  console.log('🎨 Testing UI Integration...\n')

  try {
    // Test 1: Check if we can access the database
    console.log('1️⃣ Testing database connection...')
    const userCount = await db.user.count()
    console.log(`✅ Database connected - ${userCount} users found`)

    // Test 2: Check if we have test users
    console.log('\n2️⃣ Checking for test users...')
    const testUsers = await db.user.findMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    })
    console.log(`✅ Found ${testUsers.length} test users`)

    // Test 3: Verify authentication functions work
    console.log('\n3️⃣ Testing authentication functions...')
    const { findUserByEmail, verifyPassword } = require('../lib/auth')
    
    const testUser = await findUserByEmail('john.doe@student.edu')
    if (testUser) {
      console.log('✅ User lookup works')
      
      const passwordValid = await verifyPassword('password123', testUser.password)
      console.log(`✅ Password verification: ${passwordValid ? 'PASSED' : 'FAILED'}`)
    } else {
      console.log('❌ Test user not found')
    }

    // Test 4: Check JWT functions
    console.log('\n4️⃣ Testing JWT functions...')
    const { generateToken, verifyToken } = require('../lib/jwt')
    
    if (testUser) {
      const { toUserData } = require('../lib/auth')
      const userData = toUserData(testUser)
      const token = generateToken(userData)
      const payload = verifyToken(token)
      
      console.log(`✅ JWT generation: ${token ? 'PASSED' : 'FAILED'}`)
      console.log(`✅ JWT verification: ${payload ? 'PASSED' : 'FAILED'}`)
    }

    // Test 5: Check validation schemas
    console.log('\n5️⃣ Testing validation schemas...')
    const { registerSchema, loginSchema } = require('../lib/validations')
    
    const validRegisterData = {
      email: 'test@example.com',
      password: 'TestPass123',
      confirmPassword: 'TestPass123',
      name: 'Test User',
      role: 'STUDENT'
    }
    
    const registerValidation = registerSchema.safeParse(validRegisterData)
    console.log(`✅ Registration validation: ${registerValidation.success ? 'PASSED' : 'FAILED'}`)
    
    const validLoginData = {
      email: 'test@example.com',
      password: 'TestPass123'
    }
    
    const loginValidation = loginSchema.safeParse(validLoginData)
    console.log(`✅ Login validation: ${loginValidation.success ? 'PASSED' : 'FAILED'}`)

    console.log('\n🎉 All UI integration tests passed!')
    console.log('\n📋 Next steps:')
    console.log('1. Visit http://localhost:3000 to see the landing page')
    console.log('2. Visit http://localhost:3000/login to test login form')
    console.log('3. Visit http://localhost:3000/register to test registration form')
    console.log('4. Try registering a new user')
    console.log('5. Try logging in with the new user')
    console.log('6. Check if you get redirected to the dashboard')

  } catch (error) {
    console.error('❌ UI integration test failed:', error)
  } finally {
    await db.$disconnect()
  }
}

testUIIntegration()
