import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import Grid from '@mui/material/Grid';

import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';
import Step from '@mui/material/Step';

import Image from 'next/image';

import { set } from 'lodash';

import { v4 as uuidv4 } from 'uuid';
import convertTextToEquation from '@/lib/convert-text-to-equation';

const steps = ['Input Details', 'Input Strucure', 'Preview'];


const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function Form({
    open,
    onClose,
    onSubmit,
    initialValues,
}: {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: any) => void;
    initialValues?: any;
}) {

    const theme = useTheme();
    const [activeStep, setActiveStep] = React.useState(0);
    const [input, setInput] = React.useState({
        code: "",
        name: "",
        images: [
            {
                id: uuidv4(),
                url: "",
            },
            {
                id: uuidv4(),
                url: "",
            }
        ],
        structure: {
            peices: [{
                id: uuidv4(),
                name: "",
                fields: [{
                    id: uuidv4(),
                    name: "",
                    key: "A",
                    value: 0,
                }],
                equation: {
                    width: "",
                    height: "",
                }
            }]
        }
    });

    React.useEffect(() => {
        if (initialValues) {
            setInput(initialValues);
        }
    }, [initialValues]);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const inputCopy = { ...input };
        set(inputCopy, name, value);
        setInput(inputCopy);
    };

    const handleAddField = (index: number) => {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const inputCopy = { ...input };
        const field = {
            id: uuidv4(),
            name: "",
            key: alphabet[input.structure.peices[index].fields.length],
            value: 0,
        };
        inputCopy.structure.peices[index].fields.push(field);
        setInput(inputCopy);
    };

    const handleAddPeice = () => {
        const inputCopy = { ...input };
        const peice = {
            id: uuidv4(),
            name: "",
            fields: [{
                id: uuidv4(),
                name: "",
                key: "A",
                value: 0,
            }],
            equation: {
                width: "",
                height: "",
            }
        };
        inputCopy.structure.peices.push(peice);
        setInput(inputCopy);
    }

    const handleDeleteField = (peiceId: string, fieldId: string) => {
        const inputCopy = { ...input };
        const peiceIndex = inputCopy.structure.peices.findIndex((peice) => peice.id === peiceId);
        const fieldIndex = inputCopy.structure.peices[peiceIndex].fields.findIndex((field) => field.id === fieldId);
        inputCopy.structure.peices[peiceIndex].fields.splice(fieldIndex, 1);
        setInput(inputCopy);
    };

    const handleDeletePeice = (peiceId: string) => {
        const inputCopy = { ...input };
        const peiceIndex = inputCopy.structure.peices.findIndex((peice) => peice.id === peiceId);
        inputCopy.structure.peices.splice(peiceIndex, 1);
        setInput(inputCopy);
    }

    const getTotals = () => {
        const totals = {
            width: 0,
            height: 0,
        };
        input.structure.peices.forEach((peice) => {
            const width = convertTextToEquation(peice.equation.width, input, peice.id);
            const height = convertTextToEquation(peice.equation.height, input, peice.id);
            totals.width += width;
            totals.height += height;
        });
        return totals;
    };

    const clear = () => {
        setInput({
            code: "",
            name: "",
            images: [
                {
                    id: uuidv4(),
                    url: "",
                },
                {
                    id: uuidv4(),
                    url: "",
                }
            ],
            structure: {
                peices: [{
                    id: uuidv4(),
                    name: "",
                    fields: [{
                        id: uuidv4(),
                        name: "",
                        key: "A",
                        value: 0,
                    }],
                    equation: {
                        width: "",
                        height: "",
                    }
                }]
            }
        });

        setActiveStep(0);
    };

    const handleClose = () => {
        clear();
        onClose();
    };

    const convertFilesToBase64 = async (files: FileList) => {
        const promises = [];
        for (let i = 0; i < files.length; i++) {
            promises.push(new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result);
                };
                reader.readAsDataURL(files[i]);
            }));
        }
        return Promise.all(promises);
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
            scroll="body"
            fullWidth
            maxWidth="lg"
        >
            <DialogTitle id="scroll-dialog-title">
                {initialValues ? `Update: ${initialValues.name}` : "Add Input"}
            </DialogTitle>
            <DialogContent dividers={true}>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, width: "100%", [theme.breakpoints.down('sm')]: { flexDirection: "column" } }}>
                    <Box component="div" sx={{ display: 'flex', justifyContent: 'start', gap: 2, padding: 0, flexDirection: "column", width: "80%", [theme.breakpoints.down('sm')]: { width: "100%" } }}>
                        <Stepper activeStep={activeStep}>
                            {steps.map((label, index) => {
                                const stepProps: { completed?: boolean } = {};
                                const labelProps: {
                                    optional?: React.ReactNode;
                                } = {};
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                        <Step sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2, justifyContent: "space-between" }}>
                            <React.Fragment>
                                {activeStep === 0 && (
                                    <List sx={{ width: "100%", display: "flex", flexDirection: "row", [theme.breakpoints.down('sm')]: { flexDirection: "column" }, flexWrap: "wrap" }}>
                                        <ListItem sx={{ width: "50%", [theme.breakpoints.down('sm')]: { width: "100%" } }}>
                                            <TextField id="filled-basic" label="Code" variant="outlined" onChange={handleChange} value={input.code} name="code" fullWidth size='small' />
                                        </ListItem>
                                        <ListItem sx={{ width: "50%", [theme.breakpoints.down('sm')]: { width: "100%" } }}>
                                            <TextField id="filled-basic" label="Name" variant="outlined" onChange={handleChange} name="name" value={input.name} fullWidth size='small' />
                                        </ListItem>
                                        <ListItem sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2, justifyContent: "start", alignItems: "start" }}>
                                            <Typography>Photos</Typography>
                                            <input type="file" name="images[0].url" onChange={async (e) => {
                                                const fileUrl = await convertFilesToBase64(e.target.files as FileList);
                                                const inputCopy = { ...input };
                                                inputCopy.images[0].url = fileUrl[0] as string;
                                                setInput(inputCopy);
                                            }} />
                                            <input type="file" name="images[1].url" onChange={async (e) => {
                                                const fileUrl = await convertFilesToBase64(e.target.files as FileList);
                                                const inputCopy = { ...input };
                                                inputCopy.images[1].url = fileUrl[0] as string;
                                                setInput(inputCopy);
                                            }} />
                                        </ListItem>
                                    </List>
                                )}
                                {activeStep === 1 && (
                                    <List sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                                        {input.structure.peices.map((peice, index) => (
                                            <Grid container key={peice.id} sx={{ margin: 0, width: "100%", background: theme.palette.action.hover, paddingX: 2, paddingLeft: 0, borderRadius: "10px" }} spacing={1}>
                                                <Grid item sx={{ display: "flex", gap: 2, paddingTop: 2 }} xs={12}>
                                                    <ListItemText primary={peice.name} sx={{ paddingLeft: 2, width: "100%", [`& .MuiListItemText-primary`]: { fontSize: "1.2rem" } }} />
                                                    <IconButton aria-label="addField" sx={{ color: "info.main" }} onClick={() => handleAddField(index)}>
                                                        <AddIcon />
                                                    </IconButton>
                                                    {input.structure.peices.length > 1 && input.structure.peices.length - 1 === index && (
                                                        <IconButton aria-label="delete" sx={{ color: "error.main" }} onClick={() => handleDeletePeice(peice.id)}>
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    )}
                                                </Grid>
                                                <ListItem sx={{ display: "flex", flexDirection: "column", gap: 2, width: "50%", [theme.breakpoints.down('sm')]: { width: "100%" } }}>
                                                    <TextField id="filled-basic" label="Name" variant="outlined" sx={{ width: "100%" }} onChange={handleChange} name={`structure.peices[${index}].name`} value={peice.name} size='small' />
                                                </ListItem>
                                                <ListItem sx={{ display: "flex", flexDirection: "column", gap: 2, width: "25%", [theme.breakpoints.down('sm')]: { width: "100%" } }}>
                                                    <TextField id="filled-basic" label="Width" variant="outlined" sx={{ width: "100%" }}
                                                        size='small'
                                                        onChange={handleChange}
                                                        name={`structure.peices[${index}].equation.width`}
                                                        value={peice.equation.width}
                                                    />
                                                </ListItem>
                                                <ListItem sx={{ display: "flex", flexDirection: "column", gap: 2, width: "25%", [theme.breakpoints.down('sm')]: { width: "100%" } }}>
                                                    <TextField id="filled-basic" label="Height" variant="outlined" sx={{ width: "100%" }}
                                                        size='small'
                                                        onChange={handleChange}
                                                        name={`structure.peices[${index}].equation.height`}
                                                        value={peice.equation.height}
                                                    />
                                                </ListItem>
                                                <List sx={{ padding: 2, width: "100%", display: "flex", flexDirection: "row", gap: 2, flexWrap: "wrap", [theme.breakpoints.down('sm')]: { flexDirection: "column" } }}>
                                                    {peice.fields.map((field, fieldIndex) => (
                                                        <ListItem key={field.id} sx={{ display: "flex", gap: 2, background: theme.palette.action.hover, borderRadius: "10px", paddingY: 2, paddingX: 2, width: "49%", [theme.breakpoints.down('sm')]: { width: "100%" } }}>
                                                            <TextField id="filled-basic" label="Key" variant="outlined" sx={{
                                                                width: "5rem",
                                                                [`& .MuiInputBase-input`]: { textAlign: "center" },
                                                                [`& .MuiInputLabel-root`]: { textAlign: "center" },
                                                                backgroundColor: theme.palette.action.hover
                                                            }} size='small' value={field.key} color="info" />
                                                            <TextField id="filled-basic" label="Name" variant="outlined" sx={{ width: "100%" }}
                                                                onChange={handleChange}
                                                                name={`structure.peices[${index}].fields[${fieldIndex}].name`}
                                                                value={field.name}
                                                                size='small'
                                                            />
                                                            {peice.fields.length > 1 && peice.fields.length - 1 === fieldIndex && (
                                                                <IconButton aria-label="delete" sx={{ color: "error.main" }} onClick={() => handleDeleteField(peice.id, field.id)}>
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            )}
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Grid>
                                        ))}
                                        <Box sx={{ display: "flex", gap: 2, justifyContent: "end" }}>
                                            <Button onClick={handleAddPeice}>
                                                Add Peice
                                            </Button>
                                        </Box>
                                    </List>
                                )}
                                {activeStep === 2 && (
                                    <List>
                                        <ListItem sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
                                            {input.structure.peices.map((peice, index) => {
                                                const width = convertTextToEquation(peice.equation.width, input, peice.id);
                                                const height = convertTextToEquation(peice.equation.height, input, peice.id);
                                                return (
                                                    <Grid container key={peice.id} sx={{ margin: 0, width: "100%", background: theme.palette.action.hover, padding: 2, borderRadius: "10px" }} spacing={2}>

                                                        <ListItemText primary={peice.name} sx={{ width: "100%", [`& .MuiListItemText-primary`]: { fontSize: "1.2rem" }, paddingBottom: 2 }} />
                                                        {peice.fields.map((field, fieldIndex) => (
                                                            <Grid item xs={6} key={field.id}>
                                                                <TextField size='small' id="filled-basic" label={`${field.name} [${field.key}]`} variant="outlined" value={field.value} onChange={handleChange} name={`structure.peices[${index}].fields[${fieldIndex}].value`} sx={{ width: "100%" }} />
                                                            </Grid>
                                                        ))}
                                                        <ListItemText primary={`${width}mm x ${height}mm`} sx={{ width: "100%", [`& .MuiListItemText-primary`]: { fontSize: "1rem", fontWeight: "500" }, paddingTop: 2, textAlign: "end" }} />
                                                    </Grid>
                                                )
                                            })}
                                            <ListItemText primary="Total" sx={{ width: "100%", [`& .MuiListItemText-primary`]: { fontSize: "1rem" }, paddingTop: 2, textAlign: "end" }} />
                                            <div style={{ display: "flex", flexDirection: "row", gap: 2, justifyContent: "end", fontSize: "1.1rem", fontWeight: "600", width: "100%" }}>
                                                {getTotals().width}mm x {getTotals().height}mm
                                            </div>
                                        </ListItem>
                                    </List>
                                )}
                                <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                    <Button
                                        color="inherit"
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        sx={{ mr: 1 }}
                                    >
                                        Back
                                    </Button>
                                    <Box sx={{ flex: '1 1 auto' }} />
                                    {activeStep === steps.length - 1 ? null : (
                                        <Button onClick={handleNext}>
                                            Next
                                        </Button>
                                    )}
                                </Box>
                            </React.Fragment>
                        </Step>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: "20%", borderLeft: "1px solid #ccc", padding: 2, [theme.breakpoints.down('sm')]: { borderLeft: "none", borderTop: "1px solid #ccc", width: '100%' } }}>
                        {input.images.length > 0 && input.images.map((image) => (
                            <div key={image.id}>
                                {image.url && <Image key={image.id} src={image.url} width={200} height={200} alt="Image" className="aspect-square" />}
                                {!image.url && <Image key={image.id} src="/placeholder.svg" width={200} height={200} alt="Image" className="aspect-square" />}
                            </div>
                        ))}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={() => {
                    onSubmit(input);
                    handleClose();
                }} autoFocus variant="contained" color="primary">
                    {initialValues ? "Save" : "Create"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
