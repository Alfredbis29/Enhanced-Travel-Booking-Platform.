import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Lock, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store'
import { authApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    try { const updated = await authApi.updateProfile({ first_name: firstName, last_name: lastName, phone: phone || undefined }); updateUser(updated); toast({ title: 'Profile updated', description: 'Your profile has been updated successfully.', variant: 'success' }) } 
    catch (error) { console.error('Failed to update profile:', error); toast({ title: 'Update failed', description: 'Failed to update profile.', variant: 'destructive' }) } 
    finally { setIsUpdating(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 6) { toast({ title: 'Password too short', description: 'New password must be at least 6 characters', variant: 'destructive' }); return }
    if (newPassword !== confirmPassword) { toast({ title: 'Passwords don\'t match', variant: 'destructive' }); return }
    setIsChangingPassword(true)
    try { await authApi.changePassword(currentPassword, newPassword); toast({ title: 'Password changed', description: 'Your password has been changed successfully.', variant: 'success' }); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') } 
    catch (error) { console.error('Failed to change password:', error); toast({ title: 'Password change failed', description: 'Current password is incorrect.', variant: 'destructive' }) } 
    finally { setIsChangingPassword(false) }
  }

  if (!user) return null

  return (
    <div className="min-h-screen py-8"><div className="container mx-auto px-4 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-bold mb-8">Account <span className="text-gradient">Settings</span></h1>
        <Card className="mb-6"><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">{getInitials(user.first_name, user.last_name)}</div><div><h2 className="font-display text-xl font-semibold">{user.first_name} {user.last_name}</h2><p className="text-muted-foreground">{user.email}</p></div></div></CardContent></Card>
        <Card className="mb-6"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" />Personal Information</CardTitle><CardDescription>Update your personal details</CardDescription></CardHeader><CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" /></div><div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" /></div></div>
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={user.email} disabled icon={<Mail className="h-4 w-4" />} className="opacity-60" /><p className="text-xs text-muted-foreground">Email cannot be changed</p></div>
            <div className="space-y-2"><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 123 456" icon={<Phone className="h-4 w-4" />} /></div>
            <Button type="submit" disabled={isUpdating}>{isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="mr-2 h-4 w-4" />Save Changes</>)}</Button>
          </form>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-primary" />Change Password</CardTitle><CardDescription>Update your password to keep your account secure</CardDescription></CardHeader><CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="currentPassword">Current Password</Label><Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" icon={<Lock className="h-4 w-4" />} /></div>
            <Separator />
            <div className="space-y-2"><Label htmlFor="newPassword">New Password</Label><Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" icon={<Lock className="h-4 w-4" />} /></div>
            <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm New Password</Label><Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" icon={<Lock className="h-4 w-4" />} /></div>
            <Button type="submit" disabled={isChangingPassword || !currentPassword || !newPassword}>{isChangingPassword ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing...</>) : 'Change Password'}</Button>
          </form>
        </CardContent></Card>
      </motion.div>
    </div></div>
  )
}

