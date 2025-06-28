import { redirect } from 'next/navigation'

export default function TeamMembersPage() {
  // Redirect to homepage since team members are now displayed there
  redirect('/')
} 