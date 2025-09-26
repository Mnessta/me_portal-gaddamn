import { db } from '../lib/db'
import { 
  createUser, 
  findUserByEmail, 
  verifyPassword, 
  hashPassword,
  emailExists,
  toUserData 
} from '../lib/auth'
import { generateToken, verifyToken } from '../lib/jwt'
import { registerSchema, loginSchema } from '../lib/validations'

async function testAuthFunctions() {
  console.log('🔧 Testing Authentication Functions...\n')

  try {
    // Test 1: Password hashing
    console.log('1️⃣ Testing password hashing...')
    const password = 'TestPass123'
    const hashedPassword = await hashPassword(password)
    const isValid = await verifyPassword(password, hashedPassword)
    console.log('Password hashing:', isValid ? '✅ Passed' : '❌ Failed')

    // Test 2: User creation
    console.log('\n2️⃣ Testing user creation...')
    const testUser = {
      email: 'functest@student.edu',
      password: 'TestPass123',
      name: 'Function Test User',
    }

    const user = await createUser(testUser)
    console.log('User creation:', user ? '✅ Passed' : '❌ Failed')
    console.log('Created user:', user?.name, user?.email)

    // Test 3: Email existence check
    console.log('\n3️⃣ Testing email existence check...')
    const emailExistsResult = await emailExists(testUser.email)
    const emailNotExistsResult = await emailExists('nonexistent@test.com')
    console.log('Email exists check:', emailExistsResult ? '✅ Passed' : '❌ Failed')
    console.log('Email not exists check:', !emailNotExistsResult ? '✅ Passed' : '❌ Failed')

    // Test 4: User lookup
    console.log('\n4️⃣ Testing user lookup...')
    const foundUser = await findUserByEmail(testUser.email)
    console.log('User lookup:', foundUser ? '✅ Passed' : '❌ Failed')

    // Test 5: Password verification
    console.log('\n5️⃣ Testing password verification...')
    if (foundUser) {
      const passwordValid = await verifyPassword(testUser.password, foundUser.password)
      const passwordInvalid = await verifyPassword('WrongPassword', foundUser.password)
      console.log('Valid password:', passwordValid ? '✅ Passed' : '❌ Failed')
      console.log('Invalid password:', !passwordInvalid ? '✅ Passed' : '❌ Failed')
    }

    // Test 6: User data conversion
    console.log('\n6️⃣ Testing user data conversion...')
    if (foundUser) {
      const userData = toUserData(foundUser)
      console.log('User data conversion:', userData && !userData.password ? '✅ Passed' : '❌ Failed')
      console.log('User data:', { id: userData.id, name: userData.name, role: userData.role })
    }

    // Test 7: JWT token generation and verification
    console.log('\n7️⃣ Testing JWT token...')
    if (foundUser) {
      const userData = toUserData(foundUser)
      const token = generateToken(userData)
      const payload = verifyToken(token)
      console.log('JWT generation:', token ? '✅ Passed' : '❌ Failed')
      console.log('JWT verification:', payload ? '✅ Passed' : '❌ Failed')
      console.log('Token payload:', payload ? { userId: payload.userId, email: payload.email, role: payload.role } : 'None')
    }

    // Test 8: Input validation
    console.log('\n8️⃣ Testing input validation...')
    
    // Valid registration data
    const validRegisterData = {
      email: 'valid@test.com',
      password: 'ValidPass123',
      name: 'Valid User',
    }
    const registerValidation = registerSchema.safeParse(validRegisterData)
    console.log('Valid registration data:', registerValidation.success ? '✅ Passed' : '❌ Failed')

    // Invalid registration data
    const invalidRegisterData = {
      email: 'invalid-email',
      password: 'weak',
      name: '',
    }
    const invalidRegisterValidation = registerSchema.safeParse(invalidRegisterData)
    console.log('Invalid registration data:', !invalidRegisterValidation.success ? '✅ Passed' : '❌ Failed')

    // Valid login data
    const validLoginData = {
      email: 'valid@test.com',
      password: 'ValidPass123',
    }
    const loginValidation = loginSchema.safeParse(validLoginData)
    console.log('Valid login data:', loginValidation.success ? '✅ Passed' : '❌ Failed')

    // Clean up test user
    console.log('\n🧹 Cleaning up test user...')
    await db.user.delete({ where: { email: testUser.email } })
    console.log('✅ Test user cleaned up')

    console.log('\n🎉 All authentication function tests passed!')

  } catch (error) {
    console.error('❌ Test error:', error)
  } finally {
    await db.$disconnect()
  }
}

testAuthFunctions()
