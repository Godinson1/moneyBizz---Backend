import { IAjoMember } from "../../../models"

interface Result {
    addedMembers?: Array<IAjoMember>
    error?: string
}

export { Result }
