const validateAmount = (data: string): string => {
    const result = data.slice(0, -2)
    return result
}

export { validateAmount }
