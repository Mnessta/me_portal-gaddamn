'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, User, Mail, Lock, GraduationCap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField } from '@/components/forms/form-field'
import { useAuth } from '@/contexts/auth-context'
import { registerSchema } from '@/lib/validations'
import { RegisterInput } from '@/lib/validations'

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser, loading } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password')

  const onSubmit = async (data: RegisterInput) => {
    const success = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
    })
    if (success) {
      router.push('/login')
    }
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    
    return {
      strength: (strength / 5) * 100,
      label: labels[Math.min(strength, 4)],
      color: colors[Math.min(strength, 4)]
    }
  }

  const passwordStrength = getPasswordStrength(password || '')

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Enter your information to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Full Name"
            name="name"
            type="text"
            placeholder="Enter your full name"
            error={errors.name?.message}
            required
            inputProps={{
              ...register('name'),
              autoComplete: 'name',
            }}
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            required
            inputProps={{
              ...register('email'),
              autoComplete: 'email',
            }}
          />

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role <span className="text-destructive">*</span>
            </label>
            <select
              id="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register('role')}
            >
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
            </select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className={`flex h-10 w-full rounded-md border px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                }`}
                {...register('password')}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {password && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Password strength</span>
                  <span className={passwordStrength.color.replace('bg-', 'text-')}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  />
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={`flex h-10 w-full rounded-md border px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : 'border-input'
                }`}
                {...register('confirmPassword')}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              className="rounded border-input"
              required
            />
            <label htmlFor="terms" className="text-sm">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>

          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
