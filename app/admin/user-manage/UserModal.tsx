import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type UserFormData = {
  _id: string
  name: string
  email: string
  whatsappNumber: string
  role: string
  isActive: boolean
  isBlocked: boolean
  isVerified: boolean
  password?: string
}

type UserModalProps = {
  title: string
  triggerLabel: string
  onSubmit: (data: UserFormData) => void
  defaultValues?: Partial<UserFormData>
}

export function UserModal({ title, triggerLabel, onSubmit, defaultValues = {} }: UserModalProps) {
  const [open, setOpen] = useState(false)

  const [formData, setFormData] = useState<UserFormData>({
    _id: "",
    name: "",
    email: "",
    whatsappNumber: "",
    role: "user",
    isActive: true,
    isBlocked: false,
    isVerified: false,
    password: ""
  })

  useEffect(() => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        ...defaultValues,
      }))
    }
  }, [open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleToggle = (name: keyof UserFormData) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {title === "Add User" ? "Fill in the details to add a new user." : "Update user details."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-4 py-4">
              {/* Text Fields (excluding role) */}
              {[
                { id: "name", label: "Name" },
                { id: "email", label: "Email", type: "email" },
                { id: "whatsappNumber", label: "Phone" },
                { id: "password", label: "Password", type: "password" }
              ].map(({ id, label, type = "text" }) => (
                <div key={id} className="grid gap-2">
                  <Label htmlFor={id}>{label}</Label>
                  <Input
                    id={id}
                    name={id}
                    type={type}
                    value={formData[id as keyof UserFormData]?.toString() ?? ""}
                    onChange={handleChange}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    required={id === "name" || id === "email"}
                  />
                </div>
              ))}

              {/* Select for Role */}
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Boolean Toggles */}
              {[
                { id: "isActive", label: "Active" },
                { id: "isBlocked", label: "Blocked" },
                { id: "isVerified", label: "Verified" }
              ].map(({ id, label }) => (
                <div key={id} className="flex items-center justify-between">
                  <Label htmlFor={id}>{label}</Label>
                  <Switch
                    id={id}
                    checked={formData[id as keyof UserFormData] as boolean}
                    onCheckedChange={() => handleToggle(id as keyof UserFormData)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit">{title}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
