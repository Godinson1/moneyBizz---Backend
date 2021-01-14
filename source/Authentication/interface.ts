export interface LoginBody {
    email: string
    password: string
}

export interface RegisterBody {
    name: string
    email: string
    password: string
    confirmPassword: string
    role: string
}
