const generateValidNumbers = (min: number, max: number) => {
    const validNumbers = [];
    for (let current = min; current <= max; current++)
    {
        validNumbers.push(current);
    }
    return validNumbers;
}

const generateValidStrings = (min: number, max: number) => {
    return generateValidNumbers(min, max).map((c) => `${c}`);
}


export const validateInput = (min: number, max: number, defaultValue: number, current: number, newValue: string): number => {
    if (generateValidStrings(min, max).includes(newValue))
    {
        return parseInt(newValue);
    }
    if (newValue === "")
    {
        return min;
    }
    if (!generateValidNumbers(min, max).includes(current))
    {
        return defaultValue;
    }
    // check if a digit was typed that can be accepted when everything else that is in the field is discarded
    const currentString = `${current}`;
    if (newValue.startsWith(currentString))
    {
        return validateInput(min, max, defaultValue, current, newValue.substring(currentString.length));
    }
    if (newValue.endsWith(currentString))
    {
        return validateInput(min, max, defaultValue, current, newValue.substring(0, newValue.length - currentString.length));
    }
    return current;
}