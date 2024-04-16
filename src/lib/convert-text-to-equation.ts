const convertTextToEquation = (text: string, input: any, peiceId: string) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const equation = text.split("").reduce((acc, char) => {
        if (alphabet.includes(char.toUpperCase())) {
            return acc + `${+(input.structure.peices.find((peice: any) => peice.id === peiceId).fields.find((field: any) => field.key === char)?.value || 0)}`;
        }
        return acc + char;
    }, "");

    const evaledQuation = eval(equation);

    if (isNaN(evaledQuation) || !evaledQuation || !equation) {
        return 0;
    }

    return evaledQuation;
};

export default convertTextToEquation;