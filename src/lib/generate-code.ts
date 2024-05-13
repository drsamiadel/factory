const generateCode = (prefix: string) => {
    const sample = "0123456789";
    let result = prefix;
    for (let i = 0; i < 5; i++) {
        result += sample[Math.floor(Math.random() * sample.length)];
    }
    return result;
};

export default generateCode;